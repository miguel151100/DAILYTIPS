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


def _simulate_trade(df: pd.DataFrame, entry_idx: int, horizon: int, direction: str) -> float:
    """Simulate one trade opened at df.index[entry_idx], held up to `horizon`
    candles, honoring stop-loss/take-profit against intrabar high/low, exiting
    at the horizon's close otherwise. Returns P&L in price units per unit size
    (i.e. price delta net of spread/slippage), not yet scaled by position size.
    """
    entry_close = df["close"].iloc[entry_idx]
    cost = (config.SPREAD_PIPS / 2 + config.SLIPPAGE_PIPS) * config.PIP_SIZE
    window = df.iloc[entry_idx + 1 : entry_idx + 1 + horizon]

    if direction == "long":
        entry_price = entry_close + cost
        stop = entry_price - config.STOP_LOSS_PIPS * config.PIP_SIZE
        target = entry_price + config.TAKE_PROFIT_PIPS * config.PIP_SIZE
        for _, bar in window.iterrows():
            if bar["low"] <= stop:
                return stop - cost - entry_price
            if bar["high"] >= target:
                return target - cost - entry_price
        exit_price = window["close"].iloc[-1] - cost if len(window) else entry_price
        return exit_price - entry_price
    else:  # short
        entry_price = entry_close - cost
        stop = entry_price + config.STOP_LOSS_PIPS * config.PIP_SIZE
        target = entry_price - config.TAKE_PROFIT_PIPS * config.PIP_SIZE
        for _, bar in window.iterrows():
            if bar["high"] >= stop:
                return entry_price - (stop + cost)
            if bar["low"] <= target:
                return entry_price - (target + cost)
        exit_price = window["close"].iloc[-1] + cost if len(window) else entry_price
        return entry_price - exit_price


def run_backtest(
    df: pd.DataFrame,
    n_splits: int = 5,
    starting_balance: float = 10_000.0,
    threshold: float = config.SIGNAL_THRESHOLD,
    label_horizon: int = config.LABEL_HORIZON,
) -> dict:
    feats = build_features(df, label_horizon=label_horizon)
    X = feats[FEATURE_COLUMNS].values
    y = feats["label"].values
    feat_index = feats.index

    tscv = TimeSeriesSplit(n_splits=n_splits)
    balance = starting_balance
    equity_curve = [balance]
    trade_pnls = []

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

            entry_idx = df.index.get_loc(feat_index[local_i])
            price_pnl = _simulate_trade(df, entry_idx, label_horizon, direction)

            risk_amount = balance * config.RISK_PER_TRADE
            units = risk_amount / (config.STOP_LOSS_PIPS * config.PIP_SIZE)
            trade_pnl = price_pnl * units

            balance += trade_pnl
            trade_pnls.append(trade_pnl)
            equity_curve.append(balance)

    periods_per_year = _periods_per_year(config.GRANULARITY)
    return summarize(trade_pnls, equity_curve, periods_per_year)


def _periods_per_year(granularity: str) -> float:
    hours_per_candle = {"H1": 1, "H4": 4, "D": 24, "M15": 0.25, "M5": 5 / 60, "M1": 1 / 60}
    hours = hours_per_candle.get(granularity, 1)
    # forex trades ~24h/day, ~5 days/week
    return (24 / hours) * 252


if __name__ == "__main__":
    from data.fetch import fetch_candles

    candles = fetch_candles(count=5000)
    results = run_backtest(candles)
    for k, v in results.items():
        print(f"{k}: {v}")
