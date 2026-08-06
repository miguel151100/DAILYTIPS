"""Performance metrics computed from a list of closed-trade P&Ls (in account
currency) and/or an equity curve."""
import numpy as np


def sharpe_ratio(trade_returns: list[float], periods_per_year: float) -> float:
    """Annualized Sharpe ratio (risk-free rate assumed 0) from per-trade
    returns (fractional, e.g. 0.001 = +0.1%)."""
    if len(trade_returns) < 2:
        return float("nan")
    arr = np.asarray(trade_returns, dtype=float)
    std = arr.std(ddof=1)
    if std == 0:
        return float("nan")
    return float(arr.mean() / std * np.sqrt(periods_per_year))


def max_drawdown(equity_curve: list[float]) -> float:
    """Largest peak-to-trough decline in the equity curve, as a fraction
    (e.g. 0.15 = -15%)."""
    if not equity_curve:
        return float("nan")
    arr = np.asarray(equity_curve, dtype=float)
    running_max = np.maximum.accumulate(arr)
    drawdowns = (running_max - arr) / running_max
    return float(drawdowns.max())


def win_rate(trade_pnls: list[float]) -> float:
    if not trade_pnls:
        return float("nan")
    wins = sum(1 for p in trade_pnls if p > 0)
    return wins / len(trade_pnls)


def profit_factor(trade_pnls: list[float]) -> float:
    gross_profit = sum(p for p in trade_pnls if p > 0)
    gross_loss = -sum(p for p in trade_pnls if p < 0)
    if gross_loss == 0:
        return float("inf") if gross_profit > 0 else float("nan")
    return gross_profit / gross_loss


def summarize(trade_pnls: list[float], equity_curve: list[float], periods_per_year: float) -> dict:
    """`equity_curve` must have len(trade_pnls) + 1 entries: starting balance
    at index 0, then equity after each closed trade."""
    if len(equity_curve) != len(trade_pnls) + 1:
        raise ValueError("equity_curve must have exactly one more entry than trade_pnls")

    trade_returns = [pnl / equity_before for pnl, equity_before in zip(trade_pnls, equity_curve[:-1])]
    return {
        "n_trades": len(trade_pnls),
        "win_rate": win_rate(trade_pnls),
        "profit_factor": profit_factor(trade_pnls),
        "sharpe": sharpe_ratio(trade_returns, periods_per_year),
        "max_drawdown": max_drawdown(equity_curve),
        "total_return": (equity_curve[-1] / equity_curve[0] - 1) if equity_curve else float("nan"),
        "final_equity": equity_curve[-1] if equity_curve else float("nan"),
    }
