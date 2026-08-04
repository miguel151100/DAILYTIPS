import pytest

from llm.openai_client import complete


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
        self.reply = reply
        self.last_call = None

    def create(self, model, messages):
        self.last_call = {"model": model, "messages": messages}
        return _FakeResponse(self.reply)


class _FakeChat:
    def __init__(self, reply):
        self.completions = _FakeCompletions(reply)


class _FakeClient:
    def __init__(self, reply="hello"):
        self.chat = _FakeChat(reply)


def test_complete_returns_response_text():
    client = _FakeClient(reply="the answer is 42")
    result = complete("what is the answer?", client=client)
    assert result == "the answer is 42"


def test_complete_includes_system_message_when_given():
    client = _FakeClient()
    complete("hi", system="be concise", client=client)

    messages = client.chat.completions.last_call["messages"]
    assert messages[0] == {"role": "system", "content": "be concise"}
    assert messages[1] == {"role": "user", "content": "hi"}


def test_complete_omits_system_message_when_not_given():
    client = _FakeClient()
    complete("hi", client=client)

    messages = client.chat.completions.last_call["messages"]
    assert messages == [{"role": "user", "content": "hi"}]


def test_complete_raises_clear_error_without_api_key(monkeypatch):
    import config

    monkeypatch.setattr(config, "OPENAI_API_KEY", "")
    with pytest.raises(RuntimeError, match="OPENAI_API_KEY"):
        complete("hi")
