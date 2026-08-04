"""Technical feature engineering for the FX ML model.

All features at row t are computed from data available up to and including
candle t (no look-ahead). The label is the only column that peeks into the
future -- that's intentional, it's the supervised learning target.
"""
import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "ret_1",
    "ret_4",
    "ret_12",
    "sma_fast_dist",
    "sma_slow_dist",
    "ema_fast_dist",
    "rsi_14",
    "volatility_12",
    "momentum_12",
]


def _rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()

    has_enough_data = avg_gain.notna() & avg_loss.notna()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    # avg_loss == 0: no losses in the window -> RSI is 100 if there were gains,
    # else 50 (perfectly flat, not "undefined" like the warm-up NaNs are)
    rsi = rsi.where(avg_loss != 0, np.where(avg_gain > 0, 100.0, 50.0))
    return pd.Series(rsi, index=close.index).where(has_enough_data)


def compute_feature_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Compute FEATURE_COLUMNS from OHLC data. No label, no dropna -- shared by
    both training (build_features) and live inference (model.predict) so the
    two paths can never drift apart on what a "feature" means.
    """
    out = pd.DataFrame(index=df.index)
    close = df["close"]

    out["ret_1"] = close.pct_change(1)
    out["ret_4"] = close.pct_change(4)
    out["ret_12"] = close.pct_change(12)

    sma_fast = close.rolling(8).mean()
    sma_slow = close.rolling(24).mean()
    ema_fast = close.ewm(span=8, adjust=False).mean()

    out["sma_fast_dist"] = (close - sma_fast) / sma_fast
    out["sma_slow_dist"] = (close - sma_slow) / sma_slow
    out["ema_fast_dist"] = (close - ema_fast) / ema_fast

    out["rsi_14"] = _rsi(close, 14)
    out["volatility_12"] = close.pct_change().rolling(12).std()
    out["momentum_12"] = close - close.shift(12)

    assert list(out.columns) == FEATURE_COLUMNS
    return out


def build_features(df: pd.DataFrame, label_horizon: int = 4) -> pd.DataFrame:
    """Compute technical features and a binary up/down label from OHLC data.

    Parameters
    ----------
    df : DataFrame indexed by time with a "close" column (and optionally
        open/high/low/volume).
    label_horizon : number of candles ahead used to define the label
        (1 if close[t + horizon] > close[t] else 0).

    Returns
    -------
    DataFrame with FEATURE_COLUMNS + "label", NaN rows (warm-up period and
    the final `label_horizon` rows, which have no future data) dropped.
    """
    out = compute_feature_columns(df)
    close = df["close"]

    future_close = close.shift(-label_horizon)
    out["label"] = (future_close > close).astype(float)
    # last `label_horizon` rows have no future close -> undefined label
    out.loc[future_close.isna(), "label"] = np.nan

    out = out.dropna()
    out["label"] = out["label"].astype(int)
    return out
