import pandas as pd
import pytest

from news.calendar import _normalize_events, high_impact_window


def _raw_event(currency, impact, time, title="Some Release"):
    return {"country": currency, "impact": impact, "date": time, "title": title}


def _event(currency, impact, time, title="Some Release"):
    """A normalized event, as high_impact_window expects (i.e. the output of
    _normalize_events, not the raw feed dict)."""
    return _normalize_events([_raw_event(currency, impact, time, title)])[0]


def test_normalize_events_parses_valid_entries():
    raw = [_raw_event("USD", "High", "2024-06-01T12:30:00Z", "NFP")]
    events = _normalize_events(raw)

    assert len(events) == 1
    assert events[0]["currency"] == "USD"
    assert events[0]["impact"] == "high"
    assert events[0]["title"] == "NFP"
    assert str(events[0]["time"].tz) == "UTC"


@pytest.mark.parametrize(
    "raw_event",
    [
        {"impact": "High", "date": "2024-06-01T12:30:00Z"},  # missing currency
        {"country": "USD", "date": "2024-06-01T12:30:00Z"},  # missing impact
        {"country": "USD", "impact": "High"},  # missing date
        {"country": "USD", "impact": "High", "date": "not-a-real-timestamp!!"},  # unparseable date
    ],
)
def test_normalize_events_skips_malformed_entries_without_raising(raw_event):
    events = _normalize_events([raw_event])
    assert events == []


def test_normalize_events_skips_only_the_bad_entry_among_good_ones():
    raw = [
        _raw_event("USD", "High", "2024-06-01T12:30:00Z"),
        {"country": "EUR"},  # malformed
        _raw_event("EUR", "Medium", "2024-06-01T14:00:00Z"),
    ]
    events = _normalize_events(raw)
    assert len(events) == 2


def test_high_impact_window_true_when_event_is_soon():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    events = [_event("USD", "High", "2024-06-01T11:00:00Z")]  # 1 hour ahead

    # BTCUSDT is USDT-margined -- USD-denominated macro news is relevant
    assert high_impact_window(events, {"USD"}, now, hours_ahead=2) is True


def test_high_impact_window_true_for_a_recent_past_event_too():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    events = [_event("USD", "High", "2024-06-01T09:00:00Z")]  # 1 hour ago

    assert high_impact_window(events, {"USD"}, now, hours_ahead=2) is True


def test_high_impact_window_false_when_event_is_far_outside_window():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    events = [_event("USD", "High", "2024-06-02T10:00:00Z")]  # 24 hours ahead

    assert high_impact_window(events, {"USD"}, now, hours_ahead=2) is False


def test_high_impact_window_false_for_unrelated_currency():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    events = [_event("JPY", "High", "2024-06-01T11:00:00Z")]  # soon, but not in the given set

    assert high_impact_window(events, {"USD"}, now, hours_ahead=2) is False


def test_high_impact_window_false_for_low_impact_event():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    events = [_event("USD", "Low", "2024-06-01T11:00:00Z")]

    assert high_impact_window(events, {"USD"}, now, hours_ahead=2) is False


def test_high_impact_window_checks_any_currency_in_the_given_set():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    events = [_event("EUR", "High", "2024-06-01T11:00:00Z")]

    # a caller checking multiple currencies at once (e.g. a forex pair) --
    # EUR being in the set is enough, even though USD is also in it
    assert high_impact_window(events, {"EUR", "USD"}, now, hours_ahead=2) is True


def test_high_impact_window_false_with_no_events():
    now = pd.Timestamp("2024-06-01T10:00:00Z")
    assert high_impact_window([], {"USD"}, now) is False
