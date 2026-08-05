"""Asset sentiment scoring: recent news headlines (via GDELT's free, keyless
DOC 2.0 API) summarized into a single -1..1 score by the OpenAI API.

Cached per ASSET (not per symbol -- BTCUSDT and BTCUSDC would share BTC
sentiment) with a TTL, so a run across dozens of symbols doesn't fire a
GDELT + OpenAI call per symbol every time bot.py runs. This is an advisory
filter layered on top of the trading bot, not a model feature -- see bot.py
and the README for why.

NOTE: like news/calendar.py, GDELT's domain is blocked by this sandbox's
network policy, so the live response schema is unverified from here --
tested against mocks; confirm against a real response before relying on this
live.
"""
import json
from datetime import datetime, timezone

import requests

import config
from llm.openai_client import complete

_GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

# reasonable search terms for majors (crypto assets plus the fiat/stablecoin
# side of a USDT-margined position); generic fallback for anything else --
# hand-tuning queries for every possible Binance quote/base asset isn't
# practical
_KEYWORDS_BY_CURRENCY = {
    "BTC": "Bitcoin BTC price",
    "ETH": "Ethereum ETH price",
    "BNB": "Binance Coin BNB",
    "SOL": "Solana SOL crypto",
    "XRP": "XRP Ripple crypto",
    # USDT/USDC/BUSD-margined positions are USD-macro-sensitive (Fed policy,
    # CPI) -- bot.py maps stablecoin quote assets to "USD" before calling
    # get_sentiment, so this key covers that case
    "USD": "US dollar Federal Reserve",
}

_SENTIMENT_SYSTEM_PROMPT = (
    "You are a financial sentiment classifier. Given a list of recent news "
    'headlines about a currency, respond with ONLY a JSON object of the form '
    '{"score": <number between -1 and 1>} where -1 is extremely bearish for '
    "that currency, 0 is neutral, and 1 is extremely bullish. No other text."
)


def fetch_headlines(currency: str, max_records: int = 10) -> list[str]:
    """Recent news headlines mentioning `currency`, via GDELT's free DOC 2.0 API."""
    query = _KEYWORDS_BY_CURRENCY.get(currency, f"{currency} cryptocurrency")
    params = {
        "query": query,
        "mode": "artlist",
        "format": "json",
        "maxrecords": max_records,
        "timespan": "1d",
    }
    resp = requests.get(_GDELT_URL, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    return [a["title"] for a in data.get("articles", []) if a.get("title")]


def score_sentiment(headlines: list[str], client=None) -> float:
    """-1 (bearish) to +1 (bullish). Returns 0.0 (neutral) for no headlines,
    or if the model's response can't be parsed as the expected JSON -- a
    parsing hiccup is treated as "no signal", not a hard failure. An
    API/auth/network error from `complete()` itself is NOT caught here; it
    propagates to the caller (bot.py's fail-open wrapper handles that)."""
    if not headlines:
        return 0.0

    prompt = "Headlines:\n" + "\n".join(f"- {h}" for h in headlines)
    response_text = complete(prompt, system=_SENTIMENT_SYSTEM_PROMPT, client=client)

    try:
        score = float(json.loads(response_text)["score"])
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 0.0

    return max(-1.0, min(1.0, score))


def _load_cache() -> dict:
    if config.SENTIMENT_CACHE_PATH.exists():
        return json.loads(config.SENTIMENT_CACHE_PATH.read_text())
    return {}


def _save_cache(cache: dict) -> None:
    config.SENTIMENT_CACHE_PATH.write_text(json.dumps(cache))


def get_sentiment(currency: str, client=None, now: datetime | None = None) -> float:
    """Cached, per-currency sentiment score -- the entry point bot.py uses.
    Refetches (GDELT + OpenAI) only if the cached value is older than
    config.SENTIMENT_CACHE_HOURS; otherwise returns the cached score."""
    now = now or datetime.now(timezone.utc)
    cache = _load_cache()

    cached = cache.get(currency)
    if cached:
        age_hours = (now - datetime.fromisoformat(cached["fetched_at"])).total_seconds() / 3600
        if age_hours < config.SENTIMENT_CACHE_HOURS:
            return cached["score"]

    headlines = fetch_headlines(currency)
    score = score_sentiment(headlines, client=client)

    cache[currency] = {"score": score, "fetched_at": now.isoformat()}
    _save_cache(cache)
    return score
