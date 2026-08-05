"""Fetch historical candles, live prices, and the tradeable symbol universe
from Binance's public USDT-M Futures endpoints.

Unlike OANDA, none of this needs an API key -- Binance's market-data
endpoints (klines, ticker, exchangeInfo) are public. Only account state and
order placement (execution/binance_client.py) require signed requests.
"""
import os

import pandas as pd
import requests

import config

_MAX_KLINES_PER_REQUEST = 1500


def _klines_to_frame(klines: list[list]) -> pd.DataFrame:
    rows = [
        {
            "time": pd.Timestamp(k[0], unit="ms", tz="UTC"),
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": float(k[5]),
        }
        for k in klines
    ]
    return pd.DataFrame(rows).set_index("time").sort_index()


def fetch_candles(
    symbol: str = "BTCUSDT",
    interval: str = config.BINANCE_INTERVAL,
    count: int = _MAX_KLINES_PER_REQUEST,
    start_time_ms: int | None = None,
    end_time_ms: int | None = None,
) -> pd.DataFrame:
    """Fetch OHLC candles for a symbol.

    If start_time_ms/end_time_ms are given, paginate through the full range
    in chunks of _MAX_KLINES_PER_REQUEST. Otherwise fetch the most recent
    `count` candles.
    """
    url = f"{config.BINANCE_BASE_URL}/fapi/v1/klines"

    if start_time_ms is None and end_time_ms is None:
        params = {"symbol": symbol, "interval": interval, "limit": min(count, _MAX_KLINES_PER_REQUEST)}
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        return _klines_to_frame(resp.json())

    frames = []
    cursor = start_time_ms
    end = end_time_ms or int(pd.Timestamp.now(tz="UTC").timestamp() * 1000)
    while True:
        params = {
            "symbol": symbol,
            "interval": interval,
            "limit": _MAX_KLINES_PER_REQUEST,
            "startTime": cursor,
            "endTime": end,
        }
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        frames.append(_klines_to_frame(batch))
        last_open_ms = batch[-1][0]
        if last_open_ms >= end or len(batch) < 2:
            break
        cursor = last_open_ms + 1

    if not frames:
        return pd.DataFrame(columns=["open", "high", "low", "close", "volume"])
    full = pd.concat(frames)
    full = full[~full.index.duplicated(keep="first")].sort_index()
    return full


def fetch_latest_price(symbol: str = "BTCUSDT") -> dict:
    """Fetch the current best bid/ask for a symbol."""
    url = f"{config.BINANCE_BASE_URL}/fapi/v1/ticker/bookTicker"
    resp = requests.get(url, params={"symbol": symbol}, timeout=30)
    resp.raise_for_status()
    price = resp.json()
    return {
        "time": pd.Timestamp.now(tz="UTC"),
        "bid": float(price["bidPrice"]),
        "ask": float(price["askPrice"]),
    }


def list_tradeable_symbols() -> list[str]:
    """Every USDT-margined perpetual futures symbol Binance currently lists
    and has trading enabled, fetched dynamically so this stays current as
    Binance adds or removes symbols. Restricted to USDT-margined perpetuals
    (not COIN-margined, not dated/quarterly contracts) -- the common, most
    liquid segment, and the one this project's risk math (percent-of-price
    stops, USDT balance tracking) is built around.
    """
    url = f"{config.BINANCE_BASE_URL}/fapi/v1/exchangeInfo"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    symbols = resp.json()["symbols"]
    return sorted(
        s["symbol"]
        for s in symbols
        if s["status"] == "TRADING" and s.get("contractType") == "PERPETUAL" and s["quoteAsset"] == "USDT"
    )


def resolve_symbols() -> list[str]:
    """The symbol universe to train/trade: BINANCE_SYMBOLS env var
    (comma-separated, e.g. "BTCUSDT,ETHUSDT") if set -- useful for testing
    against a handful of symbols -- else every symbol list_tradeable_symbols()
    returns."""
    override = os.environ.get("BINANCE_SYMBOLS", "")
    if override:
        return [s.strip() for s in override.split(",") if s.strip()]
    return list_tradeable_symbols()


if __name__ == "__main__":
    df = fetch_candles(count=500)
    print(df.tail())
    print(f"Fetched {len(df)} candles")
