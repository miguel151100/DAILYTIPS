"""Tests for execution/binance_client.py using mocked requests calls -- this
environment's network policy blocks both Binance testnet and production
domains outright, so these verify signing, rounding, and call sequencing
without a real network call. Smoke-test against the real testnet from an
unrestricted machine before relying on this live.
"""
import hashlib
import hmac
from urllib.parse import parse_qs, urlparse

import pytest
import requests

import config
import execution.binance_client as bc


@pytest.fixture(autouse=True)
def _reset_module_caches():
    bc._symbol_info_cache.clear()
    bc._leverage_configured.clear()
    yield
    bc._symbol_info_cache.clear()
    bc._leverage_configured.clear()


@pytest.fixture(autouse=True)
def _credentials(monkeypatch):
    monkeypatch.setattr(config, "BINANCE_API_KEY", "test-key")
    monkeypatch.setattr(config, "BINANCE_API_SECRET", "test-secret")


def test_require_credentials_raises_clear_error_when_missing(monkeypatch):
    monkeypatch.setattr(config, "BINANCE_API_KEY", "")
    with pytest.raises(RuntimeError, match="BINANCE_API_KEY"):
        bc.get_account_balance()


def test_guard_testnet_only_blocks_live_without_confirmation(monkeypatch):
    monkeypatch.setattr(config, "BINANCE_ENV", "live")
    monkeypatch.delenv("CONFIRM_LIVE_TRADING", raising=False)
    with pytest.raises(RuntimeError, match="BINANCE_ENV=live"):
        bc.get_account_balance()


def test_guard_allows_live_with_explicit_confirmation(monkeypatch):
    monkeypatch.setattr(config, "BINANCE_ENV", "live")
    monkeypatch.setenv("CONFIRM_LIVE_TRADING", "I_UNDERSTAND_THE_RISK")
    monkeypatch.setattr(
        requests, "request", lambda *a, **k: _fake_response([{"asset": "USDT", "availableBalance": "500"}])
    )
    assert bc.get_account_balance() == 500.0


def _fake_response(payload, status=200):
    class _Resp:
        def raise_for_status(self):
            if status >= 400:
                err = requests.HTTPError(response=self)
                raise err

        def json(self):
            return payload

    return _Resp()


def test_signature_matches_independently_computed_hmac(monkeypatch):
    monkeypatch.setattr(bc.time, "time", lambda: 1700000000.0)
    captured = {}

    def fake_request(method, url, headers=None, timeout=None):
        captured["method"] = method
        captured["url"] = url
        captured["headers"] = headers
        return _fake_response([{"asset": "USDT", "availableBalance": "1000"}])

    monkeypatch.setattr(requests, "request", fake_request)

    bc.get_account_balance()

    parsed = urlparse(captured["url"])
    query_without_sig = parsed.query.rsplit("&signature=", 1)[0]
    actual_signature = parsed.query.rsplit("&signature=", 1)[1]

    expected_signature = hmac.new(
        b"test-secret", query_without_sig.encode(), hashlib.sha256
    ).hexdigest()

    assert actual_signature == expected_signature
    assert captured["headers"]["X-MBX-APIKEY"] == "test-key"
    assert "timestamp=1700000000000" in query_without_sig


def _exchange_info_response():
    return {
        "symbols": [
            {
                "symbol": "BTCUSDT",
                "baseAsset": "BTC",
                "quoteAsset": "USDT",
                "filters": [
                    {"filterType": "PRICE_FILTER", "tickSize": "0.10"},
                    {"filterType": "LOT_SIZE", "stepSize": "0.001", "minQty": "0.001"},
                ],
            },
            {
                "symbol": "ETHUSDT",
                "baseAsset": "ETH",
                "quoteAsset": "USDT",
                "filters": [
                    {"filterType": "PRICE_FILTER", "tickSize": "0.01"},
                    {"filterType": "LOT_SIZE", "stepSize": "0.01", "minQty": "0.01"},
                ],
            },
        ]
    }


def test_get_symbol_info_parses_and_caches(monkeypatch):
    calls = {"n": 0}

    def fake_get(url, params=None, timeout=None):
        calls["n"] += 1
        return _fake_response(_exchange_info_response())

    monkeypatch.setattr(requests, "get", fake_get)

    info = bc.get_symbol_info("BTCUSDT")
    assert info == {"base_asset": "BTC", "quote_asset": "USDT", "tick_size": 0.10, "step_size": 0.001, "min_qty": 0.001}

    bc.get_symbol_info("ETHUSDT")  # already cached from the same exchangeInfo fetch
    assert calls["n"] == 1


def test_get_symbol_info_unknown_symbol_raises(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda *a, **k: _fake_response(_exchange_info_response()))
    with pytest.raises(ValueError, match="Unknown Binance Futures symbol"):
        bc.get_symbol_info("DOGEUSDT")


def test_round_price_and_quantity_snap_to_symbol_steps(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda *a, **k: _fake_response(_exchange_info_response()))

    assert bc.round_price("BTCUSDT", 65432.37) == pytest.approx(65432.4)
    assert bc.round_quantity("BTCUSDT", 0.01234) == pytest.approx(0.012)


def test_ensure_leverage_and_margin_type_is_idempotent_per_symbol(monkeypatch):
    calls = []

    def fake_request(method, url, headers=None, timeout=None):
        calls.append(url)
        return _fake_response({"leverage": config.BINANCE_LEVERAGE})

    monkeypatch.setattr(requests, "request", fake_request)

    bc.ensure_leverage_and_margin_type("BTCUSDT")
    bc.ensure_leverage_and_margin_type("BTCUSDT")

    assert len(calls) == 2  # leverage + marginType, only on the FIRST call


def test_ensure_leverage_and_margin_type_swallows_already_set_error(monkeypatch):
    def fake_request(method, url, headers=None, timeout=None):
        if "marginType" in url:
            return _fake_response({"code": -4046, "msg": "No need to change margin type."}, status=400)
        return _fake_response({"leverage": config.BINANCE_LEVERAGE})

    monkeypatch.setattr(requests, "request", fake_request)

    bc.ensure_leverage_and_margin_type("BTCUSDT")  # must not raise
    assert "BTCUSDT" in bc._leverage_configured


def test_ensure_leverage_and_margin_type_reraises_other_errors(monkeypatch):
    def fake_request(method, url, headers=None, timeout=None):
        if "marginType" in url:
            return _fake_response({"code": -1111, "msg": "Something else broke."}, status=400)
        return _fake_response({"leverage": config.BINANCE_LEVERAGE})

    monkeypatch.setattr(requests, "request", fake_request)

    with pytest.raises(requests.HTTPError):
        bc.ensure_leverage_and_margin_type("BTCUSDT")


def test_place_market_order_with_brackets_sends_correctly_shaped_orders(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda *a, **k: _fake_response(_exchange_info_response()))

    captured_orders = []

    def fake_request(method, url, headers=None, timeout=None):
        params = parse_qs(urlparse(url).query)
        if "/order" in url:
            captured_orders.append({k: v[0] for k, v in params.items()})
        return _fake_response({"orderId": len(captured_orders)})

    monkeypatch.setattr(requests, "request", fake_request)

    result = bc.place_market_order_with_brackets(
        "BTCUSDT", "long", quantity=0.01234, stop_loss_price=64000.37, take_profit_price=67000.22
    )

    assert set(result.keys()) == {"entry", "stop_loss", "take_profit"}
    assert len(captured_orders) == 3

    entry, stop, target = captured_orders
    assert entry["side"] == "BUY" and entry["type"] == "MARKET"
    assert entry["quantity"] == "0.012"  # rounded to BTCUSDT's 0.001 step

    assert stop["side"] == "SELL" and stop["type"] == "STOP_MARKET"
    assert stop["stopPrice"] == "64000.4"  # rounded to BTCUSDT's 0.10 tick

    assert target["side"] == "SELL" and target["type"] == "TAKE_PROFIT_MARKET"
    assert target["stopPrice"] == "67000.2"


def test_place_market_order_with_brackets_short_uses_buy_to_close(monkeypatch):
    monkeypatch.setattr(requests, "get", lambda *a, **k: _fake_response(_exchange_info_response()))
    captured_orders = []

    def fake_request(method, url, headers=None, timeout=None):
        params = parse_qs(urlparse(url).query)
        if "/order" in url:
            captured_orders.append({k: v[0] for k, v in params.items()})
        return _fake_response({"orderId": len(captured_orders)})

    monkeypatch.setattr(requests, "request", fake_request)

    bc.place_market_order_with_brackets("BTCUSDT", "short", 0.01, 66000, 63000)

    entry, stop, target = captured_orders
    assert entry["side"] == "SELL"
    assert stop["side"] == "BUY"
    assert target["side"] == "BUY"


def test_get_open_positions_by_symbol_counts_only_nonzero(monkeypatch):
    positions = [
        {"symbol": "BTCUSDT", "positionAmt": "0.010"},
        {"symbol": "ETHUSDT", "positionAmt": "0.000"},
        {"symbol": "SOLUSDT", "positionAmt": "-2.500"},
    ]
    monkeypatch.setattr(requests, "request", lambda *a, **k: _fake_response(positions))

    counts = bc.get_open_positions_by_symbol()
    assert counts == {"BTCUSDT": 1, "SOLUSDT": 1}


def test_get_account_balance_returns_requested_asset(monkeypatch):
    balances = [{"asset": "USDT", "availableBalance": "1234.56"}, {"asset": "BUSD", "availableBalance": "0"}]
    monkeypatch.setattr(requests, "request", lambda *a, **k: _fake_response(balances))

    assert bc.get_account_balance("USDT") == pytest.approx(1234.56)


def test_get_account_balance_raises_for_missing_asset(monkeypatch):
    monkeypatch.setattr(requests, "request", lambda *a, **k: _fake_response([{"asset": "BUSD", "availableBalance": "0"}]))
    with pytest.raises(ValueError, match="No USDT balance"):
        bc.get_account_balance("USDT")
