"""Thin wrapper around the Binance USDT-M Futures REST API for market data,
account state, and order placement. Deliberately refuses to touch a live
account unless explicitly overridden -- this project is built and validated
for the futures testnet only.

Order placement here is NOT atomic the way OANDA's was: Binance Futures has
no single "market order with stop-loss/take-profit attached" call, so
place_market_order_with_brackets makes three separate requests (entry, stop,
target). A failure partway through (e.g. entry fills but the stop-loss call
fails) leaves a naked position -- callers should treat a raised exception
from this function as "go check the account/positions manually," not "safe
to retry blindly."
"""
import hashlib
import hmac
import os
import time
from urllib.parse import urlencode

import requests

import config

_symbol_info_cache: dict[str, dict] = {}
_leverage_configured: set[str] = set()


def _guard_testnet_only() -> None:
    if config.BINANCE_ENV == "live" and os.environ.get("CONFIRM_LIVE_TRADING") != "I_UNDERSTAND_THE_RISK":
        raise RuntimeError(
            "BINANCE_ENV=live but this bot has only been built and validated against the "
            "futures testnet. Refusing to place real-money orders. If you truly intend to "
            "risk live capital, set CONFIRM_LIVE_TRADING=I_UNDERSTAND_THE_RISK -- but "
            "understand no backtest or testnet run here constitutes a guarantee of live "
            "performance, and leveraged futures positions can be liquidated for more than "
            "you expect if the stop-loss doesn't trigger in time."
        )


def _require_credentials() -> None:
    if not config.BINANCE_API_KEY or not config.BINANCE_API_SECRET:
        raise RuntimeError(
            "BINANCE_API_KEY / BINANCE_API_SECRET are not set. Copy .env.example to .env "
            "and fill in your Binance Futures testnet credentials (testnet.binancefuture.com "
            "-- not testnet.binance.vision, that's the separate Spot testnet)."
        )


def _signed_request(method: str, path: str, params: dict | None = None) -> dict:
    _require_credentials()
    params = dict(params or {})
    params["timestamp"] = int(time.time() * 1000)
    params.setdefault("recvWindow", 5000)
    query_string = urlencode(params, doseq=True)
    signature = hmac.new(
        config.BINANCE_API_SECRET.encode(), query_string.encode(), hashlib.sha256
    ).hexdigest()
    url = f"{config.BINANCE_BASE_URL}{path}?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": config.BINANCE_API_KEY}

    resp = requests.request(method, url, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def _public_request(path: str, params: dict | None = None) -> dict:
    resp = requests.get(f"{config.BINANCE_BASE_URL}{path}", params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_symbol_info(symbol: str) -> dict:
    """Tick size, quantity step, minimum quantity, and base/quote asset for
    a symbol -- read straight from the exchange (exchangeInfo), not guessed
    from a naming convention the way forex's "pip" was. Cached for the
    process lifetime; this data changes rarely."""
    if symbol not in _symbol_info_cache:
        data = _public_request("/fapi/v1/exchangeInfo")
        for s in data["symbols"]:
            filters = {f["filterType"]: f for f in s["filters"]}
            _symbol_info_cache[s["symbol"]] = {
                "base_asset": s["baseAsset"],
                "quote_asset": s["quoteAsset"],
                "tick_size": float(filters["PRICE_FILTER"]["tickSize"]),
                "step_size": float(filters["LOT_SIZE"]["stepSize"]),
                "min_qty": float(filters["LOT_SIZE"]["minQty"]),
            }
    if symbol not in _symbol_info_cache:
        raise ValueError(f"Unknown Binance Futures symbol: {symbol}")
    return _symbol_info_cache[symbol]


def _round_to_step(value: float, step: float) -> float:
    if step <= 0:
        return value
    return round(value / step) * step


def round_price(symbol: str, price: float) -> float:
    return _round_to_step(price, get_symbol_info(symbol)["tick_size"])


def round_quantity(symbol: str, quantity: float) -> float:
    return _round_to_step(quantity, get_symbol_info(symbol)["step_size"])


def ensure_leverage_and_margin_type(symbol: str) -> None:
    """Idempotent per-symbol setup, cached for the process lifetime: low
    leverage (config.BINANCE_LEVERAGE, default 2x) keeps the liquidation
    price far from any reasonable stop-loss, and ISOLATED margin (default)
    means a losing position can only lose its own allocated margin, not the
    whole account balance."""
    _guard_testnet_only()
    if symbol in _leverage_configured:
        return

    _signed_request("POST", "/fapi/v1/leverage", {"symbol": symbol, "leverage": config.BINANCE_LEVERAGE})
    try:
        _signed_request(
            "POST", "/fapi/v1/marginType", {"symbol": symbol, "marginType": config.BINANCE_MARGIN_TYPE}
        )
    except requests.HTTPError as e:
        try:
            body = e.response.json() if e.response is not None else {}
        except ValueError:
            body = {}
        if body.get("code") != -4046:  # -4046 = "No need to change margin type" -- already set
            raise
    _leverage_configured.add(symbol)


def get_account_balance(asset: str = "USDT") -> float:
    _guard_testnet_only()
    balances = _signed_request("GET", "/fapi/v2/balance")
    for b in balances:
        if b["asset"] == asset:
            return float(b["availableBalance"])
    raise ValueError(f"No {asset} balance entry returned by the account")


def get_open_positions_by_symbol() -> dict[str, int]:
    """Currently open position count per symbol, straight from the exchange
    (the source of truth) -- used to resync the risk manager's per-symbol
    and portfolio-wide exposure state on every bot run."""
    _guard_testnet_only()
    positions = _signed_request("GET", "/fapi/v2/positionRisk")
    counts: dict[str, int] = {}
    for p in positions:
        if float(p["positionAmt"]) != 0:
            counts[p["symbol"]] = counts.get(p["symbol"], 0) + 1
    return counts


def place_market_order_with_brackets(
    symbol: str, direction: str, quantity: float, stop_loss_price: float, take_profit_price: float
) -> dict:
    """Opens a position at market (`direction` is "long" or "short"), then
    attaches a STOP_MARKET stop-loss and a TAKE_PROFIT_MARKET take-profit as
    two further orders -- see the module docstring on why this isn't atomic."""
    _guard_testnet_only()
    ensure_leverage_and_margin_type(symbol)

    side = "BUY" if direction == "long" else "SELL"
    opposite_side = "SELL" if direction == "long" else "BUY"
    quantity = round_quantity(symbol, quantity)

    entry = _signed_request(
        "POST", "/fapi/v1/order", {"symbol": symbol, "side": side, "type": "MARKET", "quantity": quantity}
    )
    stop = _signed_request(
        "POST",
        "/fapi/v1/order",
        {
            "symbol": symbol,
            "side": opposite_side,
            "type": "STOP_MARKET",
            "stopPrice": round_price(symbol, stop_loss_price),
            "closePosition": "true",
        },
    )
    target = _signed_request(
        "POST",
        "/fapi/v1/order",
        {
            "symbol": symbol,
            "side": opposite_side,
            "type": "TAKE_PROFIT_MARKET",
            "stopPrice": round_price(symbol, take_profit_price),
            "closePosition": "true",
        },
    )
    return {"entry": entry, "stop_loss": stop, "take_profit": target}
