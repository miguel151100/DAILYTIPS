import json
from datetime import datetime, timedelta, timezone

import pytest

import config
import llm.sentiment as sentiment


class _FakeMessage:
    def __init__(self, content):
        self.content = content


class _FakeChoice:
    def __init__(self, content):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, reply):
        self._reply = reply
        self.call_count = 0

    def create(self, model, messages):
        self.call_count += 1
        return _FakeResponse(self._reply)


class _FakeClient:
    """Mirrors the shape llm.openai_client.complete() expects
    (client.chat.completions.create(...)); call_count tracks cache hit/miss."""

    def __init__(self, reply='{"score": 0.6}'):
        self.chat = self
        self.completions = _FakeCompletions(reply)

    @property
    def call_count(self):
        return self.completions.call_count


@pytest.fixture(autouse=True)
def _isolated_cache(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "SENTIMENT_CACHE_PATH", tmp_path / "sentiment_cache.json")


def test_score_sentiment_parses_valid_json_response():
    client = _FakeClient(reply='{"score": 0.6}')
    assert sentiment.score_sentiment(["Fed hikes rates"], client=client) == pytest.approx(0.6)


def test_score_sentiment_clamps_out_of_range_scores():
    client = _FakeClient(reply='{"score": 5.0}')
    assert sentiment.score_sentiment(["headline"], client=client) == 1.0

    client = _FakeClient(reply='{"score": -9.0}')
    assert sentiment.score_sentiment(["headline"], client=client) == -1.0


def test_score_sentiment_returns_neutral_on_malformed_json():
    client = _FakeClient(reply="not json at all")
    assert sentiment.score_sentiment(["headline"], client=client) == 0.0


def test_score_sentiment_returns_neutral_without_calling_client_for_no_headlines():
    client = _FakeClient()
    result = sentiment.score_sentiment([], client=client)
    assert result == 0.0
    assert client.call_count == 0


def test_get_sentiment_fetches_and_caches(monkeypatch):
    monkeypatch.setattr(sentiment, "fetch_headlines", lambda currency, **k: ["ECB signals pause"])
    client = _FakeClient(reply='{"score": 0.3}')
    now = datetime(2024, 6, 1, 10, 0, tzinfo=timezone.utc)

    score = sentiment.get_sentiment("EUR", client=client, now=now)

    assert score == pytest.approx(0.3)
    assert client.call_count == 1
    assert config.SENTIMENT_CACHE_PATH.exists()


def test_get_sentiment_uses_cache_within_ttl(monkeypatch):
    calls = {"n": 0}

    def fake_fetch(currency, **k):
        calls["n"] += 1
        return ["headline"]

    monkeypatch.setattr(sentiment, "fetch_headlines", fake_fetch)
    client = _FakeClient(reply='{"score": 0.4}')
    t0 = datetime(2024, 6, 1, 10, 0, tzinfo=timezone.utc)

    first = sentiment.get_sentiment("USD", client=client, now=t0)
    # well within the default 6h TTL
    second = sentiment.get_sentiment("USD", client=client, now=t0 + timedelta(hours=1))

    assert first == second == pytest.approx(0.4)
    assert calls["n"] == 1  # second call served entirely from cache
    assert client.call_count == 1


def test_get_sentiment_refetches_after_ttl_expires(monkeypatch):
    calls = {"n": 0}

    def fake_fetch(currency, **k):
        calls["n"] += 1
        return ["headline"]

    monkeypatch.setattr(sentiment, "fetch_headlines", fake_fetch)
    client = _FakeClient(reply='{"score": 0.2}')
    t0 = datetime(2024, 6, 1, 10, 0, tzinfo=timezone.utc)

    sentiment.get_sentiment("GBP", client=client, now=t0)
    sentiment.get_sentiment("GBP", client=client, now=t0 + timedelta(hours=config.SENTIMENT_CACHE_HOURS + 1))

    assert calls["n"] == 2
    assert client.call_count == 2


def test_get_sentiment_caches_separately_per_currency(monkeypatch):
    monkeypatch.setattr(sentiment, "fetch_headlines", lambda currency, **k: [f"{currency} headline"])
    client = _FakeClient(reply='{"score": 0.1}')
    now = datetime(2024, 6, 1, 10, 0, tzinfo=timezone.utc)

    sentiment.get_sentiment("EUR", client=client, now=now)
    sentiment.get_sentiment("JPY", client=client, now=now)

    cache = json.loads(config.SENTIMENT_CACHE_PATH.read_text())
    assert set(cache.keys()) == {"EUR", "JPY"}
