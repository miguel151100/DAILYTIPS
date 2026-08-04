import numpy as np
import pandas as pd

from backtest.engine import run_portfolio_backtest


def _make_df(seed, n=1500, base=1.1):
    rng = np.random.default_rng(seed)
    idx = pd.date_range("2023-01-01", periods=n, freq="h")
    prices = base + np.cumsum(rng.normal(0, base * 0.0005, n))
    return pd.DataFrame(
        {
            "open": prices,
            "high": prices + base * 0.0003,
            "low": prices - base * 0.0003,
            "close": prices,
            "volume": 100,
        },
        index=idx,
    )


def _instrument_data():
    return {
        "EUR_USD": _make_df(1, base=1.1),
        "USD_JPY": _make_df(2, base=150.0),  # exercises the JPY pip-size path
        "AUD_USD": _make_df(3, base=0.65),
    }


def test_portfolio_backtest_runs_end_to_end_with_multiple_pairs_incl_jpy():
    results = run_portfolio_backtest(_instrument_data(), n_splits=3)

    assert results["n_trades"] >= 0
    assert len(results["equity_curve"]) == results["n_trades"] + 1
    assert results["equity_curve"][0] == 10_000.0


def test_tighter_total_exposure_cap_never_trades_more_than_a_looser_one():
    data = _instrument_data()

    loose = run_portfolio_backtest(data, n_splits=3, max_total_risk_fraction=0.10, risk_per_trade=0.01)
    tight = run_portfolio_backtest(data, n_splits=3, max_total_risk_fraction=0.01, risk_per_trade=0.01)

    # tight caps concurrent exposure to ~1 position at a time; it can never
    # open strictly more trades than a materially looser cap on the same data
    assert tight["n_trades"] <= loose["n_trades"]


def test_single_pair_with_ample_exposure_cap_matches_expected_trade_shape():
    data = {"EUR_USD": _make_df(1, base=1.1)}
    results = run_portfolio_backtest(data, n_splits=3, max_total_risk_fraction=1.0)

    assert results["n_trades"] > 0
    assert "sharpe" in results
    assert "max_drawdown" in results
