import numpy as np
import pandas as pd

from features.engineer import FEATURE_COLUMNS, build_features, _atr, _rsi


def _make_df(prices, start="2024-01-01", intrabar_range=0.0002) -> pd.DataFrame:
    prices = np.asarray(prices, dtype=float)
    idx = pd.date_range(start, periods=len(prices), freq="h")
    return pd.DataFrame(
        {
            "open": prices,
            "high": prices + intrabar_range,
            "low": prices - intrabar_range,
            "close": prices,
        },
        index=idx,
    )


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


def test_macd_is_positive_in_a_sustained_uptrend():
    prices = np.linspace(1.0, 1.5, 200)
    df = _make_df(prices)
    feats = build_features(df, label_horizon=4)

    # fast EMA leads price up faster than the slow EMA in a steady uptrend
    assert (feats["macd_norm"] > 0).all()


def test_bollinger_pct_b_is_neutral_on_a_flat_series():
    prices = np.full(100, 1.2345)
    df = _make_df(prices)
    feats = build_features(df, label_horizon=4)

    # zero-width band (no volatility) -> defined as neutral, not NaN
    assert (feats["bb_pct_b"] == 0.5).all()
    assert (feats["bb_bandwidth"] == 0.0).all()


def test_bollinger_pct_b_above_half_in_a_sustained_uptrend():
    prices = np.linspace(1.0, 1.5, 200)
    df = _make_df(prices)
    feats = build_features(df, label_horizon=4)

    # price consistently running above its rolling mean -> upper half of the band
    assert (feats["bb_pct_b"] > 0.5).all()


def test_atr_reflects_intrabar_range():
    prices = np.linspace(1.0, 1.1, 100)
    narrow = _make_df(prices, intrabar_range=0.0001)
    wide = _make_df(prices, intrabar_range=0.0010)

    atr_narrow = _atr(narrow["high"], narrow["low"], narrow["close"]).dropna()
    atr_wide = _atr(wide["high"], wide["low"], wide["close"]).dropna()

    assert (atr_narrow > 0).all()
    assert (atr_wide > atr_narrow).all()


def test_session_flags_match_expected_utc_hours():
    prices = np.linspace(1.0, 1.1, 48)
    df = _make_df(prices, start="2024-01-01 00:00")  # 48 hourly candles = exactly 2 UTC days
    feats = build_features(df, label_horizon=1)

    for ts, row in feats.iterrows():
        hour = ts.hour
        assert row["session_asia"] == float(0 <= hour < 9)
        assert row["session_london"] == float(8 <= hour < 17)
        assert row["session_ny"] == float(13 <= hour < 22)

    # sanity check the overlap window is real: 13:00-16:59 UTC has both London and NY set
    overlap_rows = feats.between_time("13:00", "16:59")
    assert len(overlap_rows) > 0
    assert (overlap_rows["session_london"] == 1).all()
    assert (overlap_rows["session_ny"] == 1).all()
