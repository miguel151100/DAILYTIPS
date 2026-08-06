"""Integration-style tests for bot.py's per-symbol trading loop, with every
external call (exchange, calendar feed, sentiment) mocked -- this sandbox's
network policy blocks Binance outright, so these are the closest thing to an
end-to-end check available here. Verified manually against a real trained
model during development; formalized here so it stays covered.
"""
import csv
from datetime import datetime, timezone
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest

import bot
import config
import execution.binance_client as bc
from news.calendar import _normalize_events
from risk.manager import RiskManager

_SYMBOL_INFO = {"base_asset": "BTC", "quote_asset": "USDT", "tick_size": 0.1, "step_size": 0.001, "min_qty": 0.001}


def _synthetic_candles(seed=1, n=200, base=60_000.0):
    rng = np.random.default_rng(seed)
    idx = pd.date_range("2023-01-01", periods=n, freq="h", tz="UTC")
    prices = base + np.cumsum(rng.normal(0, base * 0.0005, n))
    return pd.DataFrame(
        {"open": prices, "high": prices + 15, "low": prices - 15, "close": prices, "volume": 100}, index=idx
    )


class _FakeModel:
    """Always predicts a strong long signal, so tests don't depend on a real
    trained HistGradientBoostingClassifier's exact output."""

    def predict_proba(self, X):
        return np.tile([0.2, 0.8], (len(X), 1))


@pytest.fixture(autouse=True)
def _isolated_logs(tmp_path, monkeypatch):
    monkeypatch.setattr(bot, "LOG_PATH", tmp_path / "trades.csv")
    monkeypatch.setattr(bot, "STATE_PATH", tmp_path / "risk_state.json")
    bc._symbol_info_cache.clear()
    bc._leverage_configured.clear()


def test_symbol_currencies_reads_from_exchange_info(monkeypatch):
    monkeypatch.setattr(bc, "get_symbol_info", lambda symbol: _SYMBOL_INFO)
    assert bot._symbol_currencies("BTCUSDT") == ("BTC", "USD")  # USDT stablecoin -> USD


def test_trade_one_symbol_skips_silently_when_no_model_trained():
    rm = RiskManager(starting_balance=10_000)
    with patch("bot.fetch_candles") as mock_fetch:
        bot._trade_one_symbol("NOEXIST_USDT", 10_000, rm, calendar_events=[])
    mock_fetch.assert_not_called()


def test_trade_one_symbol_blocks_on_nearby_high_impact_event(monkeypatch, tmp_path):
    monkeypatch.setattr(config, "model_path_for", lambda symbol, interval=None: tmp_path / "exists.marker")
    (tmp_path / "exists.marker").write_text("x")
    monkeypatch.setattr(bc, "get_symbol_info", lambda symbol: _SYMBOL_INFO)

    now = datetime.now(timezone.utc)
    events = _normalize_events([{"country": "USD", "impact": "High", "date": now.isoformat()}])
    rm = RiskManager(starting_balance=10_000)

    with patch("bot.fetch_candles") as mock_fetch:
        bot._trade_one_symbol("BTCUSDT", 10_000, rm, calendar_events=events)

    mock_fetch.assert_not_called()
    assert rm.open_positions == {}


def test_trade_one_symbol_places_correctly_computed_bracket_order(monkeypatch, tmp_path):
    monkeypatch.setattr(config, "model_path_for", lambda symbol, interval=None: tmp_path / "exists.marker")
    (tmp_path / "exists.marker").write_text("x")
    monkeypatch.setattr(bc, "get_symbol_info", lambda symbol: _SYMBOL_INFO)
    monkeypatch.setattr("bot.load_model", lambda symbol: _FakeModel())

    now = datetime.now(timezone.utc)
    candles = _synthetic_candles()

    rm = RiskManager(starting_balance=10_000, risk_per_trade=0.01, stop_loss_percent=0.015, take_profit_percent=0.03)

    with patch("bot.fetch_candles", return_value=candles), \
         patch("bot.fetch_latest_price", return_value={"time": now, "bid": 60_100.0, "ask": 60_105.0}), \
         patch("bot.sentiment.get_sentiment", return_value=0.0), \
         patch.object(bc, "place_market_order_with_brackets") as mock_place:
        bot._trade_one_symbol("BTCUSDT", 10_000, rm, calendar_events=[])

    mock_place.assert_called_once()
    symbol, direction, quantity, stop_price, target_price = mock_place.call_args[0]

    assert symbol == "BTCUSDT"
    assert direction == "long"  # _FakeModel always predicts strongly up
    assert quantity == pytest.approx(rm.position_size(10_000, 60_105.0))
    assert stop_price == pytest.approx(60_105.0 * 0.985)
    assert target_price == pytest.approx(60_105.0 * 1.03)
    assert rm.open_positions == {"BTCUSDT": 1}

    with open(bot.LOG_PATH, newline="") as f:
        logged = list(csv.DictReader(f))
    assert len(logged) == 1
    assert logged[0]["symbol"] == "BTCUSDT"


def test_trade_one_symbol_sentiment_veto_blocks_a_long(monkeypatch, tmp_path):
    monkeypatch.setattr(config, "model_path_for", lambda symbol, interval=None: tmp_path / "exists.marker")
    (tmp_path / "exists.marker").write_text("x")
    monkeypatch.setattr(bc, "get_symbol_info", lambda symbol: _SYMBOL_INFO)
    monkeypatch.setattr("bot.load_model", lambda symbol: _FakeModel())

    candles = _synthetic_candles()

    # base (BTC) sentiment very negative, quote (USD) neutral -> pair
    # sentiment strongly opposes a long
    def fake_sentiment(currency, **kwargs):
        return -0.9 if currency == "BTC" else 0.0

    rm = RiskManager(starting_balance=10_000)

    with patch("bot.fetch_candles", return_value=candles), \
         patch("bot.fetch_latest_price", return_value={"time": datetime.now(timezone.utc), "bid": 60_100.0, "ask": 60_105.0}), \
         patch("bot.sentiment.get_sentiment", side_effect=fake_sentiment), \
         patch.object(bc, "place_market_order_with_brackets") as mock_place:
        bot._trade_one_symbol("BTCUSDT", 10_000, rm, calendar_events=[])

    mock_place.assert_not_called()
    assert rm.open_positions == {}


def test_run_once_skips_symbols_and_saves_risk_state(monkeypatch, tmp_path):
    monkeypatch.setattr(bot, "LOG_PATH", tmp_path / "trades.csv")
    monkeypatch.setattr(bot, "STATE_PATH", tmp_path / "risk_state.json")

    with patch.object(bc, "get_account_balance", return_value=10_000.0), \
         patch.object(bc, "get_open_positions_by_symbol", return_value={}), \
         patch("bot.calendar.fetch_calendar_events", return_value=[]), \
         patch("bot._trade_one_symbol") as mock_trade:
        bot.run_once(symbols=["BTCUSDT", "ETHUSDT"])

    assert mock_trade.call_count == 2
    assert (tmp_path / "risk_state.json").exists()
