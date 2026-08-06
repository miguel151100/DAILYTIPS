"""Tests for data/fetch.py using mocked requests.get -- Binance's domains are
blocked by this sandbox's network policy, so these verify the parsing/
pagination/filtering logic without a real network call.
"""
import pandas as pd
import pytest
import requests

import data.fetch as fetch


def _kline(open_time_ms, o=100.0, h=101.0, l=99.0, c=100.5, v=10.0):
    return [open_time_ms, str(o), str(h), str(l), str(c), str(v), open_time_ms + 3599999, "0", 1, "0", "0", "0"]


class _FakeResponse:
    def __init__(self, payload, status=200):
        self._payload = payload
        self.status_code = status

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(response=self)

    def json(self):
        return self._payload


def test_fetch_candles_single_batch_parses_schema(monkeypatch):
    klines = [_kline(1700000000000 + i * 3600_000) for i in range(5)]
    monkeypatch.setattr(requests, "get", lambda url, params=None, timeout=None: _FakeResponse(klines))

    df = fetch.fetch_candles(symbol="BTCUSDT", count=5)

    assert list(df.columns) == ["open", "high", "low", "close", "volume"]
    assert len(df) == 5
    assert df.index.is_monotonic_increasing
    assert str(df.index.tz) == "UTC"


def test_fetch_candles_paginates_across_multiple_batches(monkeypatch):
    batch1 = [_kline(1700000000000 + i * 3600_000) for i in range(3)]
    batch2 = [_kline(1700000000000 + (i + 3) * 3600_000) for i in range(3)]
    calls = {"n": 0}

    def fake_get(url, params=None, timeout=None):
        calls["n"] += 1
        return _FakeResponse(batch1 if calls["n"] == 1 else (batch2 if calls["n"] == 2 else []))

    monkeypatch.setattr(requests, "get", fake_get)

    end_ms = 1700000000000 + 6 * 3600_000
    df = fetch.fetch_candles(symbol="BTCUSDT", start_time_ms=1700000000000, end_time_ms=end_ms)

    assert len(df) == 6
    assert df.index.is_monotonic_increasing
    assert not df.index.duplicated().any()


def test_fetch_latest_price_parses_book_ticker(monkeypatch):
    payload = {"symbol": "BTCUSDT", "bidPrice": "64999.10", "bidQty": "1", "askPrice": "65000.90", "askQty": "1"}
    monkeypatch.setattr(requests, "get", lambda url, params=None, timeout=None: _FakeResponse(payload))

    price = fetch.fetch_latest_price("BTCUSDT")

    assert price["bid"] == pytest.approx(64999.10)
    assert price["ask"] == pytest.approx(65000.90)
    assert isinstance(price["time"], pd.Timestamp)


def _exchange_info(symbols):
    return {"symbols": symbols}


def test_list_tradeable_symbols_filters_trading_perpetual_usdt(monkeypatch):
    payload = _exchange_info(
        [
            {"symbol": "BTCUSDT", "status": "TRADING", "contractType": "PERPETUAL", "quoteAsset": "USDT"},
            {"symbol": "ETHUSDT", "status": "TRADING", "contractType": "PERPETUAL", "quoteAsset": "USDT"},
            {"symbol": "BTCUSDT_240329", "status": "TRADING", "contractType": "CURRENT_QUARTER", "quoteAsset": "USDT"},
            {"symbol": "BTCBUSD", "status": "TRADING", "contractType": "PERPETUAL", "quoteAsset": "BUSD"},
            {"symbol": "XRPUSDT", "status": "BREAK", "contractType": "PERPETUAL", "quoteAsset": "USDT"},
        ]
    )
    monkeypatch.setattr(requests, "get", lambda url, params=None, timeout=None: _FakeResponse(payload))

    symbols = fetch.list_tradeable_symbols()

    assert symbols == ["BTCUSDT", "ETHUSDT"]


def test_resolve_symbols_honors_env_override(monkeypatch):
    monkeypatch.setenv("BINANCE_SYMBOLS", "BTCUSDT, ETHUSDT ,SOLUSDT")
    assert fetch.resolve_symbols() == ["BTCUSDT", "ETHUSDT", "SOLUSDT"]


def test_resolve_symbols_falls_back_to_list_tradeable_symbols(monkeypatch):
    monkeypatch.delenv("BINANCE_SYMBOLS", raising=False)
    monkeypatch.setattr(fetch, "list_tradeable_symbols", lambda: ["BTCUSDT"])
    assert fetch.resolve_symbols() == ["BTCUSDT"]
