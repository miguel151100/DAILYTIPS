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


def _simulate_trade(df: pd.DataFrame, entry_idx: int, horizon: int, direction: str) -> float:
    """Simulate one trade opened at df.index[entry_idx], held up to `horizon`
    candles, honoring stop-loss/take-profit against intrabar high/low, exiting
    at the horizon's close otherwise. Returns P&L in price units per unit size
    (i.e. price delta net of fees/slippage), not yet scaled by position size.
    Cost and stop/target distances are percent-of-entry-price -- see
    config.py's comments on why crypto uses percent instead of forex's pips.
    """
    entry_close = df["close"].iloc[entry_idx]
    cost = entry_close * (config.TAKER_FEE_PERCENT + config.SLIPPAGE_PERCENT)
    window = df.iloc[entry_idx + 1 : entry_idx + 1 + horizon]

    if direction == "long":
        entry_price = entry_close + cost
        stop = entry_price * (1 - config.STOP_LOSS_PERCENT)
        target = entry_price * (1 + config.TAKE_PROFIT_PERCENT)
        for _, bar in window.iterrows():
            if bar["low"] <= stop:
                return stop - cost - entry_price
            if bar["high"] >= target:
                return target - cost - entry_price
        exit_price = window["close"].iloc[-1] - cost if len(window) else entry_price
        return exit_price - entry_price
    else:  # short
        entry_price = entry_close - cost
        stop = entry_price * (1 + config.STOP_LOSS_PERCENT)
        target = entry_price * (1 - config.TAKE_PROFIT_PERCENT)
        for _, bar in window.iterrows():
            if bar["high"] >= stop:
                return entry_price - (stop + cost)
            if bar["low"] <= target:
                return entry_price - (target + cost)
        exit_price = window["close"].iloc[-1] + cost if len(window) else entry_price
        return entry_price - exit_price


def _generate_candidates(
    df: pd.DataFrame, symbol: str, n_splits: int, threshold: float, label_horizon: int
) -> list[tuple]:
    """Walk-forward train/predict over one symbol's history, returning
    out-of-sample (entry_time, symbol, direction, entry_idx) candidates --
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
            candidates.append((entry_time, symbol, direction, df.index.get_loc(entry_time)))
    return candidates


def run_backtest(
    df: pd.DataFrame,
    symbol: str = "BTCUSDT",
    n_splits: int = 5,
    starting_balance: float = 10_000.0,
    threshold: float = config.SIGNAL_THRESHOLD,
    label_horizon: int = config.LABEL_HORIZON,
) -> dict:
    """Single-symbol out-of-sample backtest. For multiple symbols sharing one
    account's exposure limits, use run_portfolio_backtest instead."""
    candidates = _generate_candidates(df, symbol, n_splits, threshold, label_horizon)

    balance = starting_balance
    equity_curve = [balance]
    trade_pnls = []

    for _entry_time, _symbol, direction, entry_idx in candidates:
        entry_price = df["close"].iloc[entry_idx]
        price_pnl = _simulate_trade(df, entry_idx, label_horizon, direction)

        risk_amount = balance * config.RISK_PER_TRADE
        units = risk_amount / (entry_price * config.STOP_LOSS_PERCENT)
        trade_pnl = price_pnl * units

        balance += trade_pnl
        trade_pnls.append(trade_pnl)
        equity_curve.append(balance)

    periods_per_year = _periods_per_year(config.BINANCE_INTERVAL)
    summary = summarize(trade_pnls, equity_curve, periods_per_year)
    summary["equity_curve"] = equity_curve
    return summary


def run_portfolio_backtest(
    symbol_data: dict[str, pd.DataFrame],
    n_splits: int = 5,
    starting_balance: float = 10_000.0,
    threshold: float = config.SIGNAL_THRESHOLD,
    label_horizon: int = config.LABEL_HORIZON,
    risk_per_trade: float = config.RISK_PER_TRADE,
    max_positions_per_instrument: int = config.MAX_POSITIONS_PER_INSTRUMENT,
    max_total_risk_fraction: float = config.MAX_TOTAL_RISK_FRACTION,
) -> dict:
    """Backtest several symbols sharing ONE account: walk-forward trains and
    generates out-of-sample candidate signals per symbol exactly like
    run_backtest, then merges every symbol's candidates into a single
    chronological timeline and replays it against one shared RiskManager --
    so the total-exposure cap and daily circuit breaker apply across
    symbols, not per symbol in isolation (a symbol-by-symbol backtest would
    pretend every symbol had its own separate account, which overstates how
    much capital you could actually put to work at once).

    A trade's holding window (label_horizon candles from entry) is treated as
    the time it occupies an exposure slot, even though its P&L is resolved
    immediately via _simulate_trade -- that's a simplification (real trades
    can exit early on a stop/target hit sooner than the horizon), but it's a
    conservative one: it holds the exposure slot for at least as long as, and
    usually longer than, the trade is actually at risk.
    """
    candidates = []
    for symbol, df in symbol_data.items():
        candidates.extend(_generate_candidates(df, symbol, n_splits, threshold, label_horizon))
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
    open_until: list[tuple] = []  # (close_time, symbol)
    current_date = None

    for entry_time, symbol, direction, entry_idx in candidates:
        entry_date = entry_time.date()
        if entry_date != current_date:
            current_date = entry_date
            risk_manager.start_new_day(balance)

        still_open = []
        for close_time, sym in open_until:
            if close_time <= entry_time:
                risk_manager.register_close(sym, balance)
            else:
                still_open.append((close_time, sym))
        open_until = still_open

        if not risk_manager.can_open_trade(balance, symbol):
            continue

        df = symbol_data[symbol]
        entry_price = df["close"].iloc[entry_idx]
        price_pnl = _simulate_trade(df, entry_idx, label_horizon, direction)
        units = risk_manager.position_size(balance, entry_price)
        trade_pnl = price_pnl * units

        balance += trade_pnl
        trade_pnls.append(trade_pnl)
        equity_curve.append(balance)

        risk_manager.register_open(symbol)
        close_idx = min(entry_idx + label_horizon, len(df.index) - 1)
        open_until.append((df.index[close_idx], symbol))

    periods_per_year = _periods_per_year(config.BINANCE_INTERVAL)
    summary = summarize(trade_pnls, equity_curve, periods_per_year)
    summary["equity_curve"] = equity_curve
    return summary


def _periods_per_year(interval: str) -> float:
    hours_per_candle = {
        "1m": 1 / 60, "3m": 3 / 60, "5m": 5 / 60, "15m": 15 / 60, "30m": 30 / 60,
        "1h": 1, "2h": 2, "4h": 4, "6h": 6, "8h": 8, "12h": 12,
        "1d": 24, "3d": 72, "1w": 168,
    }
    hours = hours_per_candle.get(interval, 1)
    # crypto trades 24/7/365, unlike forex's ~5-day trading week
    return (24 / hours) * 365


if __name__ == "__main__":
    import sys

    from backtest.plot import plot_equity_curve
    from data.fetch import fetch_candles, resolve_symbols

    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        symbols = resolve_symbols()
        symbol_data = {s: fetch_candles(symbol=s, count=1500) for s in symbols}
        results = run_portfolio_backtest(symbol_data)
        plot_path = config.LOG_DIR / "portfolio_equity_curve.png"
    else:
        symbol = sys.argv[1] if len(sys.argv) > 1 else "BTCUSDT"
        candles = fetch_candles(symbol=symbol, count=1500)
        results = run_backtest(candles, symbol=symbol)
        plot_path = config.LOG_DIR / f"{symbol}_equity_curve.png"

    for k, v in results.items():
        if k != "equity_curve":
            print(f"{k}: {v}")

    plot_equity_curve(results["equity_curve"], plot_path)
    print(f"\nequity curve plot saved to {plot_path}")
