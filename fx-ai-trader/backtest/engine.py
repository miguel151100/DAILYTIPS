"""Out-of-sample backtest: walk-forward trains the model fold by fold (same
splits as model.train.walk_forward_validate) and only ever trades each fold's
held-out test window with the model trained on data strictly before it. This
avoids the classic backtest bug of training and testing on overlapping data,
which would make a strategy look profitable purely from memorized noise.
"""
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit

import config
from backtest.metrics import summarize
from features.engineer import FEATURE_COLUMNS, build_features
from model.train import _make_model
from risk.manager import RiskManager


def _simulate_trade(df: pd.DataFrame, entry_idx: int, horizon: int, direction: str, pip_size: float) -> float:
    """Simulate one trade opened at df.index[entry_idx], held up to `horizon`
    candles, honoring stop-loss/take-profit against intrabar high/low, exiting
    at the horizon's close otherwise. Returns P&L in price units per unit size
    (i.e. price delta net of spread/slippage), not yet scaled by position size.
    """
    entry_close = df["close"].iloc[entry_idx]
    cost = (config.SPREAD_PIPS / 2 + config.SLIPPAGE_PIPS) * pip_size
    window = df.iloc[entry_idx + 1 : entry_idx + 1 + horizon]

    if direction == "long":
        entry_price = entry_close + cost
        stop = entry_price - config.STOP_LOSS_PIPS * pip_size
        target = entry_price + config.TAKE_PROFIT_PIPS * pip_size
        for _, bar in window.iterrows():
            if bar["low"] <= stop:
                return stop - cost - entry_price
            if bar["high"] >= target:
                return target - cost - entry_price
        exit_price = window["close"].iloc[-1] - cost if len(window) else entry_price
        return exit_price - entry_price
    else:  # short
        entry_price = entry_close - cost
        stop = entry_price + config.STOP_LOSS_PIPS * pip_size
        target = entry_price - config.TAKE_PROFIT_PIPS * pip_size
        for _, bar in window.iterrows():
            if bar["high"] >= stop:
                return entry_price - (stop + cost)
            if bar["low"] <= target:
                return entry_price - (target + cost)
        exit_price = window["close"].iloc[-1] + cost if len(window) else entry_price
        return entry_price - exit_price


def _generate_candidates(
    df: pd.DataFrame, instrument: str, n_splits: int, threshold: float, label_horizon: int
) -> list[tuple]:
    """Walk-forward train/predict over one instrument's history, returning
    out-of-sample (entry_time, instrument, direction, entry_idx) candidates --
    same folding logic as model.train.walk_forward_validate, just kept here
    too since the backtest needs the raw per-row probabilities, not just
    aggregate fold metrics."""
    feats = build_features(df, label_horizon=label_horizon)
    X = feats[FEATURE_COLUMNS].values
    y = feats["label"].values
    feat_index = feats.index

    candidates = []
    tscv = TimeSeriesSplit(n_splits=n_splits)
    for train_idx, test_idx in tscv.split(X):
        model = _make_model()
        model.fit(X[train_idx], y[train_idx])
        probs = model.predict_proba(X[test_idx])[:, 1]

        for local_i, prob_up in zip(test_idx, probs):
            if prob_up >= threshold:
                direction = "long"
            elif prob_up <= 1 - threshold:
                direction = "short"
            else:
                continue
            entry_time = feat_index[local_i]
            candidates.append((entry_time, instrument, direction, df.index.get_loc(entry_time)))
    return candidates


def run_backtest(
    df: pd.DataFrame,
    instrument: str = "EUR_USD",
    n_splits: int = 5,
    starting_balance: float = 10_000.0,
    threshold: float = config.SIGNAL_THRESHOLD,
    label_horizon: int = config.LABEL_HORIZON,
) -> dict:
    """Single-instrument out-of-sample backtest. For multiple pairs sharing
    one account's exposure limits, use run_portfolio_backtest instead."""
    pip_size = config.pip_size_for(instrument)
    candidates = _generate_candidates(df, instrument, n_splits, threshold, label_horizon)

    balance = starting_balance
    equity_curve = [balance]
    trade_pnls = []

    for _entry_time, _instrument, direction, entry_idx in candidates:
        price_pnl = _simulate_trade(df, entry_idx, label_horizon, direction, pip_size)

        risk_amount = balance * config.RISK_PER_TRADE
        units = risk_amount / (config.STOP_LOSS_PIPS * pip_size)
        trade_pnl = price_pnl * units

        balance += trade_pnl
        trade_pnls.append(trade_pnl)
        equity_curve.append(balance)

    periods_per_year = _periods_per_year(config.GRANULARITY)
    summary = summarize(trade_pnls, equity_curve, periods_per_year)
    summary["equity_curve"] = equity_curve
    return summary


def run_portfolio_backtest(
    instrument_data: dict[str, pd.DataFrame],
    n_splits: int = 5,
    starting_balance: float = 10_000.0,
    threshold: float = config.SIGNAL_THRESHOLD,
    label_horizon: int = config.LABEL_HORIZON,
    risk_per_trade: float = config.RISK_PER_TRADE,
    max_positions_per_instrument: int = config.MAX_POSITIONS_PER_INSTRUMENT,
    max_total_risk_fraction: float = config.MAX_TOTAL_RISK_FRACTION,
) -> dict:
    """Backtest several instruments sharing ONE account: walk-forward trains
    and generates out-of-sample candidate signals per instrument exactly like
    run_backtest, then merges every instrument's candidates into a single
    chronological timeline and replays it against one shared RiskManager --
    so the total-exposure cap and daily circuit breaker apply across pairs,
    not per pair in isolation (a pair-by-pair backtest would pretend every
    instrument had its own separate account, which overstates how much
    capital you could actually put to work at once).

    A trade's holding window (label_horizon candles from entry) is treated as
    the time it occupies an exposure slot, even though its P&L is resolved
    immediately via _simulate_trade -- that's a simplification (real trades
    can exit early on a stop/target hit sooner than the horizon), but it's a
    conservative one: it holds the exposure slot for at least as long as, and
    usually longer than, the trade is actually at risk.
    """
    candidates = []
    for instrument, df in instrument_data.items():
        candidates.extend(_generate_candidates(df, instrument, n_splits, threshold, label_horizon))
    candidates.sort(key=lambda c: c[0])

    risk_manager = RiskManager(
        starting_balance=starting_balance,
        risk_per_trade=risk_per_trade,
        max_positions_per_instrument=max_positions_per_instrument,
        max_total_risk_fraction=max_total_risk_fraction,
    )
    balance = starting_balance
    equity_curve = [balance]
    trade_pnls = []
    open_until: list[tuple] = []  # (close_time, instrument)
    current_date = None

    for entry_time, instrument, direction, entry_idx in candidates:
        entry_date = entry_time.date()
        if entry_date != current_date:
            current_date = entry_date
            risk_manager.start_new_day(balance)

        still_open = []
        for close_time, inst in open_until:
            if close_time <= entry_time:
                risk_manager.register_close(inst, balance)
            else:
                still_open.append((close_time, inst))
        open_until = still_open

        if not risk_manager.can_open_trade(balance, instrument):
            continue

        df = instrument_data[instrument]
        pip_size = config.pip_size_for(instrument)
        price_pnl = _simulate_trade(df, entry_idx, label_horizon, direction, pip_size)
        units = risk_manager.position_size(balance, instrument)
        trade_pnl = price_pnl * units

        balance += trade_pnl
        trade_pnls.append(trade_pnl)
        equity_curve.append(balance)

        risk_manager.register_open(instrument)
        close_idx = min(entry_idx + label_horizon, len(df.index) - 1)
        open_until.append((df.index[close_idx], instrument))

    periods_per_year = _periods_per_year(config.GRANULARITY)
    summary = summarize(trade_pnls, equity_curve, periods_per_year)
    summary["equity_curve"] = equity_curve
    return summary


def _periods_per_year(granularity: str) -> float:
    hours_per_candle = {"H1": 1, "H4": 4, "D": 24, "M15": 0.25, "M5": 5 / 60, "M1": 1 / 60}
    hours = hours_per_candle.get(granularity, 1)
    # forex trades ~24h/day, ~5 days/week
    return (24 / hours) * 252


if __name__ == "__main__":
    import sys

    from backtest.plot import plot_equity_curve
    from data.fetch import fetch_candles, resolve_instruments

    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        instruments = resolve_instruments()
        instrument_data = {i: fetch_candles(instrument=i, count=5000) for i in instruments}
        results = run_portfolio_backtest(instrument_data)
        plot_path = config.LOG_DIR / "portfolio_equity_curve.png"
    else:
        instrument = sys.argv[1] if len(sys.argv) > 1 else "EUR_USD"
        candles = fetch_candles(instrument=instrument, count=5000)
        results = run_backtest(candles, instrument=instrument)
        plot_path = config.LOG_DIR / f"{instrument}_equity_curve.png"

    for k, v in results.items():
        if k != "equity_curve":
            print(f"{k}: {v}")

    plot_equity_curve(results["equity_curve"], plot_path)
    print(f"\nequity curve plot saved to {plot_path}")
