"""Economic calendar news-blackout filter.

Deliberately does NOT use an LLM: "is there a high-impact release for this
currency within N hours of now" is answerable directly from the calendar
feed's structured fields (currency, impact level, timestamp). Asking a
language model to interpret that into a go/no-go decision would add
hallucination risk to a safety gate for no benefit over filtering the
structured data in code -- GPT is used elsewhere (llm/sentiment.py,
report.py) for the parts it's actually suited to: reading free text and
writing prose.

NOTE: this sandbox's network policy blocks the feed's domain, so the exact
live JSON schema below is unverified from here -- it follows the widely used
community convention for this feed, but confirm field names against a real
response before relying on this live.
"""
import requests
import pandas as pd

import config

_CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"


def _to_utc_timestamp(value) -> pd.Timestamp:
    ts = pd.Timestamp(value)
    return ts.tz_localize("UTC") if ts.tzinfo is None else ts.tz_convert("UTC")


def _normalize_events(raw: list[dict]) -> list[dict]:
    """Parse defensively: a missing/malformed field skips that one event
    rather than raising and losing the whole feed."""
    events = []
    for item in raw:
        currency = item.get("country") or item.get("currency")
        impact = item.get("impact")
        raw_time = item.get("date") or item.get("time")
        if not currency or not impact or not raw_time:
            continue
        try:
            time = _to_utc_timestamp(raw_time)
        except (ValueError, TypeError):
            continue
        events.append(
            {
                "currency": str(currency).strip().upper(),
                "impact": str(impact).strip().lower(),
                "time": time,
                "title": item.get("title", ""),
            }
        )
    return events


def fetch_calendar_events(url: str = _CALENDAR_URL) -> list[dict]:
    """Fetch this week's economic calendar. Returns normalized dicts:
    {"currency": str, "impact": "high"/"medium"/"low"/..., "time": UTC
    Timestamp, "title": str}."""
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return _normalize_events(resp.json())


def high_impact_window(
    events: list[dict], instrument: str, now, hours_ahead: float = config.NEWS_BLACKOUT_HOURS
) -> bool:
    """True if either currency in `instrument` (e.g. "EUR_USD" -> EUR, USD)
    has a High-impact calendar event within `hours_ahead` hours of `now`, in
    either direction (before *or* after -- volatility doesn't stop the
    instant a release prints, and this also covers releases that already
    happened moments ago)."""
    currencies = set(instrument.split("_"))
    now = _to_utc_timestamp(now)
    window_start = now - pd.Timedelta(hours=hours_ahead)
    window_end = now + pd.Timedelta(hours=hours_ahead)

    return any(
        event["impact"] == "high" and event["currency"] in currencies and window_start <= event["time"] <= window_end
        for event in events
    )
