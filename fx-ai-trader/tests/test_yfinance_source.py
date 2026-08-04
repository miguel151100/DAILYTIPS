"""Tests for data/yfinance_source.py using a mocked yf.download -- this
environment's network policy blocks Yahoo Finance outright, so these verify
the schema transformation logic (column renaming, UTC conversion, sorting)
without a real network call. The function itself should be smoke-tested
against the real API from an unrestricted machine before relying on it.
"""
import pandas as pd
import pytest

from data import yfinance_source


def _fake_yahoo_raw() -> pd.DataFrame:
    idx = pd.date_range("2024-03-01", periods=5, freq="h", tz="America/New_York")
    idx = idx[::-1]  # Yahoo doesn't always return sorted data -- exercise our sort step
    return pd.DataFrame(
        {
            "Open": [1.10, 1.11, 1.12, 1.13, 1.14],
            "High": [1.101, 1.111, 1.121, 1.131, 1.141],
            "Low": [1.099, 1.109, 1.119, 1.129, 1.139],
            "Close": [1.105, 1.115, 1.125, 1.135, 1.145],
            "Adj Close": [1.105, 1.115, 1.125, 1.135, 1.145],
            "Volume": [0, 0, 0, 0, 0],
        },
        index=idx,
    )


def test_fetch_candles_renames_columns_and_converts_to_utc(monkeypatch):
    monkeypatch.setattr(yfinance_source.yf, "download", lambda *a, **k: _fake_yahoo_raw())

    df = yfinance_source.fetch_candles(instrument="EUR_USD")

    assert list(df.columns) == ["open", "high", "low", "close", "volume"]
    assert str(df.index.tz) == "UTC"


def test_fetch_candles_returns_chronologically_sorted_data(monkeypatch):
    monkeypatch.setattr(yfinance_source.yf, "download", lambda *a, **k: _fake_yahoo_raw())

    df = yfinance_source.fetch_candles(instrument="EUR_USD")

    assert df.index.is_monotonic_increasing
    # the fixture's Close values are assigned positionally to the *reversed*
    # index, so row 0 (04:00 ET) got 1.105 and row 4 (00:00 ET) got 1.145.
    # After re-sorting ascending by time, 00:00 ET (close=1.145) comes first.
    assert df["close"].iloc[0] == pytest.approx(1.145)
    assert df["close"].iloc[-1] == pytest.approx(1.105)


def test_fetch_candles_raises_on_empty_response(monkeypatch):
    monkeypatch.setattr(yfinance_source.yf, "download", lambda *a, **k: pd.DataFrame())

    with pytest.raises(RuntimeError, match="no data"):
        yfinance_source.fetch_candles(instrument="EUR_USD")


def test_unknown_instrument_passed_through_as_raw_ticker(monkeypatch):
    seen = {}

    def fake_download(ticker, **kwargs):
        seen["ticker"] = ticker
        return _fake_yahoo_raw()

    monkeypatch.setattr(yfinance_source.yf, "download", fake_download)
    yfinance_source.fetch_candles(instrument="XAU_USD")

    assert seen["ticker"] == "XAU_USD"
