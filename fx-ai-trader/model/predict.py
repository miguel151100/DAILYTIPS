"""Load the trained model and turn fresh price data into a trade signal."""
from dataclasses import dataclass

import joblib
import pandas as pd

import config
from features.engineer import FEATURE_COLUMNS, compute_feature_columns


@dataclass
class Signal:
    direction: str  # "long", "short", or "flat"
    probability_up: float
    time: pd.Timestamp


def load_model(instrument: str, granularity: str = config.GRANULARITY):
    path = config.model_path_for(instrument, granularity)
    if not path.exists():
        raise FileNotFoundError(
            f"No trained model at {path}. Run `python -m model.train` (or train_all) first."
        )
    return joblib.load(path)


def latest_signal(
    df: pd.DataFrame, instrument: str, model=None, threshold: float = config.SIGNAL_THRESHOLD
) -> Signal:
    """Compute the trade signal for the most recent candle in `df`.

    `df` must have at least enough history to satisfy the feature warm-up
    period (see features.engineer.build_features) plus config.LABEL_HORIZON
    trailing rows -- pass more history than you think you need; the label
    horizon trims real, usable rows off the tail.
    """
    if model is None:
        model = load_model(instrument)

    # Live inference has no future candle to build a label from -- use the
    # same feature computation as training (compute_feature_columns) but skip
    # build_features' label step, so the most recent candle stays usable.
    feats = compute_feature_columns(df).dropna()
    if feats.empty:
        raise ValueError("Not enough history to compute features for a live signal.")

    last_row = feats.iloc[[-1]]
    prob_up = float(model.predict_proba(last_row[FEATURE_COLUMNS].values)[0, 1])

    if prob_up >= threshold:
        direction = "long"
    elif prob_up <= 1 - threshold:
        direction = "short"
    else:
        direction = "flat"

    return Signal(direction=direction, probability_up=prob_up, time=feats.index[-1])
