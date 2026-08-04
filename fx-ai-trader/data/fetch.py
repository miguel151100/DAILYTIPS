"""Fetch historical candles and live prices from the OANDA v20 REST API."""
import os
from datetime import datetime, timezone

import pandas as pd
import requests

import config

_MAX_CANDLES_PER_REQUEST = 5000


def _headers() -> dict:
    if not config.OANDA_API_TOKEN:
        raise RuntimeError(
            "OANDA_API_TOKEN is not set. Copy .env.example to .env and fill in your "
            "OANDA practice account credentials."
        )
    return {"Authorization": f"Bearer {config.OANDA_API_TOKEN}"}


def _candles_to_frame(candles: list[dict]) -> pd.DataFrame:
    rows = []
    for c in candles:
        if not c.get("complete", True):
            continue
        mid = c["mid"]
        rows.append(
            {
                "time": pd.Timestamp(c["time"]),
                "open": float(mid["o"]),
                "high": float(mid["h"]),
                "low": float(mid["l"]),
                "close": float(mid["c"]),
                "volume": int(c["volume"]),
            }
        )
    df = pd.DataFrame(rows).set_index("time").sort_index()
    return df


def fetch_candles(
    instrument: str = "EUR_USD",
    granularity: str = config.GRANULARITY,
    count: int = _MAX_CANDLES_PER_REQUEST,
    from_time: str | None = None,
    to_time: str | None = None,
) -> pd.DataFrame:
    """Fetch OHLC candles for an instrument.

    If from_time/to_time (ISO8601 or RFC3339 strings) are given, paginate through
    the full range in chunks of _MAX_CANDLES_PER_REQUEST. Otherwise fetch the most
    recent `count` candles.
    """
    url = f"{config.OANDA_BASE_URL}/v3/instruments/{instrument}/candles"

    if from_time is None and to_time is None:
        params = {"granularity": granularity, "price": "M", "count": min(count, _MAX_CANDLES_PER_REQUEST)}
        resp = requests.get(url, headers=_headers(), params=params, timeout=30)
        resp.raise_for_status()
        return _candles_to_frame(resp.json()["candles"])

    frames = []
    cursor = from_time
    end = pd.Timestamp(to_time) if to_time else pd.Timestamp.now(tz=timezone.utc)
    while True:
        params = {
            "granularity": granularity,
            "price": "M",
            "count": _MAX_CANDLES_PER_REQUEST,
            "from": cursor,
        }
        resp = requests.get(url, headers=_headers(), params=params, timeout=30)
        resp.raise_for_status()
        batch = _candles_to_frame(resp.json()["candles"])
        if batch.empty:
            break
        frames.append(batch)
        last_time = batch.index[-1]
        if last_time >= end or len(batch) < 2:
            break
        cursor = last_time.isoformat()

    if not frames:
        return pd.DataFrame(columns=["open", "high", "low", "close", "volume"])
    full = pd.concat(frames)
    full = full[~full.index.duplicated(keep="first")].sort_index()
    return full[full.index <= end]


def fetch_latest_price(instrument: str = "EUR_USD") -> dict:
    """Fetch the current bid/ask price for an instrument."""
    url = f"{config.OANDA_BASE_URL}/v3/accounts/{config.OANDA_ACCOUNT_ID}/pricing"
    params = {"instruments": instrument}
    resp = requests.get(url, headers=_headers(), params=params, timeout=30)
    resp.raise_for_status()
    price = resp.json()["prices"][0]
    return {
        "time": datetime.fromisoformat(price["time"].replace("Z", "+00:00")),
        "bid": float(price["bids"][0]["price"]),
        "ask": float(price["asks"][0]["price"]),
    }


def list_tradeable_instruments() -> list[str]:
    """Every currency pair OANDA itself offers on this account (~68-70 pairs:
    majors, minors, and a good number of exotics), fetched dynamically so this
    stays current if OANDA adds or removes instruments. This is the honest
    version of "every currency in the world" -- no retail broker actually
    trades all ~180 ISO currencies; most aren't freely convertible or have no
    liquid retail FX market at all.
    """
    url = f"{config.OANDA_BASE_URL}/v3/accounts/{config.OANDA_ACCOUNT_ID}/instruments"
    resp = requests.get(url, headers=_headers(), timeout=30)
    resp.raise_for_status()
    instruments = resp.json()["instruments"]
    return sorted(i["name"] for i in instruments if i["type"] == "CURRENCY")


def resolve_instruments() -> list[str]:
    """The instrument universe to train/trade: FX_INSTRUMENTS env var
    (comma-separated, e.g. "EUR_USD,GBP_JPY") if set -- useful for testing
    against a handful of pairs -- else every pair list_tradeable_instruments()
    returns."""
    override = os.environ.get("FX_INSTRUMENTS", "")
    if override:
        return [s.strip() for s in override.split(",") if s.strip()]
    return list_tradeable_instruments()


if __name__ == "__main__":
    df = fetch_candles(count=500)
    print(df.tail())
    print(f"Fetched {len(df)} candles")
