"""Train the direction-prediction model with walk-forward validation.

Walk-forward (as opposed to a random train/test split) is essential for time
series: each fold trains only on data that precedes its test window, so the
model is never evaluated on data it could have seen the "future" of during
training. A random split would leak future information into training and
produce misleadingly good accuracy.
"""
from __future__ import annotations

import sys

import joblib
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, roc_auc_score

import config
from features.engineer import FEATURE_COLUMNS, build_features


def _make_model() -> HistGradientBoostingClassifier:
    return HistGradientBoostingClassifier(
        max_iter=200,
        max_depth=4,
        learning_rate=0.05,
        l2_regularization=1.0,
        random_state=42,
    )


def walk_forward_validate(feats: pd.DataFrame, n_splits: int = 5) -> list[dict]:
    """Evaluate the model across `n_splits` chronological folds.

    Returns a list of per-fold metrics dicts (accuracy, roc_auc, n_train, n_test).
    """
    X = feats[FEATURE_COLUMNS].values
    y = feats["label"].values

    tscv = TimeSeriesSplit(n_splits=n_splits)
    results = []
    for fold, (train_idx, test_idx) in enumerate(tscv.split(X)):
        model = _make_model()
        model.fit(X[train_idx], y[train_idx])
        preds = model.predict(X[test_idx])
        probs = model.predict_proba(X[test_idx])[:, 1]

        metrics = {
            "fold": fold,
            "n_train": len(train_idx),
            "n_test": len(test_idx),
            "accuracy": accuracy_score(y[test_idx], preds),
        }
        # roc_auc undefined if a fold's test set has only one class
        if len(set(y[test_idx])) > 1:
            metrics["roc_auc"] = roc_auc_score(y[test_idx], probs)
        else:
            metrics["roc_auc"] = float("nan")
        results.append(metrics)
    return results


def feature_importance_report(feats: pd.DataFrame, n_splits: int = 5, n_repeats: int = 10) -> pd.DataFrame:
    """Permutation importance measured on the *last* walk-forward fold's
    held-out test set -- i.e. strictly out-of-sample. This is what the model
    actually relies on to generalize, which is not the same as importance
    measured on training data (that can just reflect memorized noise).
    """
    X = feats[FEATURE_COLUMNS].values
    y = feats["label"].values

    tscv = TimeSeriesSplit(n_splits=n_splits)
    train_idx, test_idx = list(tscv.split(X))[-1]

    model = _make_model()
    model.fit(X[train_idx], y[train_idx])

    scoring = "roc_auc" if len(set(y[test_idx])) > 1 else "accuracy"
    result = permutation_importance(
        model, X[test_idx], y[test_idx], n_repeats=n_repeats, random_state=42, scoring=scoring
    )
    return (
        pd.DataFrame(
            {
                "feature": FEATURE_COLUMNS,
                "importance_mean": result.importances_mean,
                "importance_std": result.importances_std,
            }
        )
        .sort_values("importance_mean", ascending=False)
        .reset_index(drop=True)
    )


def train_final_model(feats: pd.DataFrame) -> HistGradientBoostingClassifier:
    """Fit on the full available dataset -- call only after walk-forward
    validation shows acceptable out-of-sample performance."""
    model = _make_model()
    model.fit(feats[FEATURE_COLUMNS].values, feats["label"].values)
    return model


def save_model(model, symbol: str, interval: str = config.BINANCE_INTERVAL) -> None:
    joblib.dump(model, config.model_path_for(symbol, interval))


def run(
    df: pd.DataFrame,
    symbol: str,
    n_splits: int = 5,
    save: bool = True,
    report_importance: bool = True,
) -> list[dict]:
    """End-to-end for one symbol: build features, walk-forward validate,
    train final model, save to model/saved/{symbol}_{interval}."""
    feats = build_features(df, label_horizon=config.LABEL_HORIZON)
    if len(feats) < (n_splits + 1) * 20:
        raise ValueError(
            f"Not enough data ({len(feats)} rows) for {n_splits}-fold walk-forward "
            "validation. Fetch more history or reduce n_splits."
        )

    fold_metrics = walk_forward_validate(feats, n_splits=n_splits)
    for m in fold_metrics:
        print(
            f"fold {m['fold']}: n_train={m['n_train']:>5} n_test={m['n_test']:>4} "
            f"accuracy={m['accuracy']:.4f} roc_auc={m['roc_auc']:.4f}"
        )
    avg_acc = sum(m["accuracy"] for m in fold_metrics) / len(fold_metrics)
    print(f"\nmean walk-forward accuracy: {avg_acc:.4f} (0.50 = coin flip)")

    if report_importance:
        print("\nfeature importance (permutation, out-of-sample, last fold):")
        importance = feature_importance_report(feats, n_splits=n_splits)
        for _, row in importance.iterrows():
            print(f"  {row['feature']:<16} {row['importance_mean']:+.4f} (+/- {row['importance_std']:.4f})")

    if save:
        final_model = train_final_model(feats)
        save_model(final_model, symbol)
        print(f"final model trained on {len(feats)} rows, saved to {config.model_path_for(symbol)}")

    return fold_metrics


def train_all(
    symbols: list[str],
    n_splits: int = 5,
    candles_count: int = 1500,
    fetch_fn=None,
) -> dict[str, list[dict] | str]:
    """Batch-train one model per symbol. Continues past a failing symbol
    (e.g. one with too little history, or a data-fetch error) instead of
    aborting the whole run -- returns per-symbol fold metrics on success, or
    the error message string on failure, so the caller can see exactly which
    symbols need attention without losing the ones that worked.
    """
    if fetch_fn is None:
        from data.fetch import fetch_candles as fetch_fn

    results: dict[str, list[dict] | str] = {}
    for i, symbol in enumerate(symbols, 1):
        print(f"\n=== [{i}/{len(symbols)}] {symbol} ===")
        try:
            candles = fetch_fn(symbol=symbol, count=candles_count)
            results[symbol] = run(candles, symbol, n_splits=n_splits)
        except Exception as e:
            print(f"  skipped: {e}")
            results[symbol] = str(e)

    succeeded = [k for k, v in results.items() if not isinstance(v, str)]
    failed = [k for k, v in results.items() if isinstance(v, str)]
    print(f"\ntrain_all done: {len(succeeded)} trained, {len(failed)} skipped")
    if failed:
        print(f"skipped: {', '.join(failed)}")
    return results


if __name__ == "__main__":
    from data.fetch import fetch_candles, resolve_symbols

    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        train_all(resolve_symbols())
    else:
        symbol = sys.argv[1] if len(sys.argv) > 1 else "BTCUSDT"
        try:
            candles = fetch_candles(symbol=symbol, count=1500)
        except RuntimeError as e:
            print(f"error: {e}", file=sys.stderr)
            sys.exit(1)
        run(candles, symbol)
