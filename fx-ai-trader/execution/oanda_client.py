"""Thin wrapper around the OANDA v20 REST API for account state and order
placement. Deliberately refuses to touch a live account unless explicitly
overridden -- this project is built and validated for paper trading only.
"""
import os

import requests

import config


def _headers() -> dict:
    if not config.OANDA_API_TOKEN:
        raise RuntimeError(
            "OANDA_API_TOKEN is not set. Copy .env.example to .env and fill in your "
            "OANDA practice account credentials."
        )
    return {"Authorization": f"Bearer {config.OANDA_API_TOKEN}", "Content-Type": "application/json"}


def _guard_practice_only() -> None:
    if config.OANDA_ENV == "live" and os.environ.get("CONFIRM_LIVE_TRADING") != "I_UNDERSTAND_THE_RISK":
        raise RuntimeError(
            "OANDA_ENV=live but this bot has only been built and validated for paper "
            "trading (practice account). Refusing to place real-money orders. If you "
            "truly intend to risk live capital, set "
            "CONFIRM_LIVE_TRADING=I_UNDERSTAND_THE_RISK -- but understand no backtest "
            "or demo run here constitutes a guarantee of live performance."
        )


def get_account_summary() -> dict:
    _guard_practice_only()
    url = f"{config.OANDA_BASE_URL}/v3/accounts/{config.OANDA_ACCOUNT_ID}/summary"
    resp = requests.get(url, headers=_headers(), timeout=30)
    resp.raise_for_status()
    return resp.json()["account"]


def get_open_trades_by_instrument() -> dict[str, int]:
    """Currently open trade count per instrument, straight from the broker
    (the source of truth) -- used to resync the risk manager's per-instrument
    and portfolio-wide exposure state on every bot run."""
    _guard_practice_only()
    url = f"{config.OANDA_BASE_URL}/v3/accounts/{config.OANDA_ACCOUNT_ID}/openTrades"
    resp = requests.get(url, headers=_headers(), timeout=30)
    resp.raise_for_status()
    counts: dict[str, int] = {}
    for trade in resp.json()["trades"]:
        counts[trade["instrument"]] = counts.get(trade["instrument"], 0) + 1
    return counts


def place_market_order(instrument: str, units: float, stop_loss_price: float, take_profit_price: float) -> dict:
    """`units` positive opens a long, negative opens a short. Attaches
    stop-loss and take-profit orders atomically on fill."""
    _guard_practice_only()
    precision = config.price_precision_for(instrument)
    url = f"{config.OANDA_BASE_URL}/v3/accounts/{config.OANDA_ACCOUNT_ID}/orders"
    body = {
        "order": {
            "type": "MARKET",
            "instrument": instrument,
            "units": str(int(units)),
            "timeInForce": "FOK",
            "positionFill": "DEFAULT",
            "stopLossOnFill": {"price": f"{stop_loss_price:.{precision}f}"},
            "takeProfitOnFill": {"price": f"{take_profit_price:.{precision}f}"},
        }
    }
    resp = requests.post(url, headers=_headers(), json=body, timeout=30)
    resp.raise_for_status()
    return resp.json()
