import numpy as np
import pandas as pd

from features.engineer import FEATURE_COLUMNS, build_features, _rsi


def _make_df(prices) -> pd.DataFrame:
    idx = pd.date_range("2024-01-01", periods=len(prices), freq="h")
    return pd.DataFrame({"close": prices}, index=idx)


def test_build_features_no_nans_and_expected_columns():
    prices = np.linspace(1.0, 1.1, 100)
    df = _make_df(prices)
    feats = build_features(df, label_horizon=4)

    assert not feats.isna().any().any()
    for col in FEATURE_COLUMNS + ["label"]:
        assert col in feats.columns
    # warm-up (24 for sma_slow) + label horizon (4) trimmed off the front/back
    assert len(feats) <= len(df) - 4


def test_monotonic_increase_yields_bullish_label_and_high_rsi():
    prices = np.linspace(1.0, 1.5, 200)
    df = _make_df(prices)
    feats = build_features(df, label_horizon=4)

    # in a strictly increasing series, price `horizon` steps ahead is always higher
    assert (feats["label"] == 1).all()
    # momentum and short-term return should be positive throughout
    assert (feats["ret_1"] > 0).all()
    assert (feats["momentum_12"] > 0).all()
    # RSI should be pinned high (all gains, no losses)
    assert feats["rsi_14"].iloc[-1] > 90


def test_flat_series_yields_neutral_rsi_and_bearish_label():
    prices = np.full(100, 1.2345)
    df = _make_df(prices)
    feats = build_features(df, label_horizon=4)

    assert (feats["ret_1"] == 0).all()
    assert (feats["rsi_14"] == 50.0).all()
    # future close == current close everywhere -> "future > current" is False -> label 0
    assert (feats["label"] == 0).all()


def test_rsi_bounds():
    rng = np.random.default_rng(42)
    prices = 1.1 + np.cumsum(rng.normal(0, 0.001, 300))
    close = pd.Series(prices)
    rsi = _rsi(close).dropna()
    assert len(rsi) > 0
    assert (rsi >= 0).all() and (rsi <= 100).all()
