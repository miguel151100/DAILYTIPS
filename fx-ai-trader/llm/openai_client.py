"""Thin wrapper around the OpenAI chat completions API. Used only by the
optional advisory filters (llm/sentiment.py) and report.py -- nothing in the
core train/backtest/trade loop depends on this module.
"""
import config


def _get_client():
    if not config.OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. This is only needed for the sentiment "
            "filter and report.py -- model training, backtesting, and trading "
            "all work fine without it."
        )
    import openai

    return openai.OpenAI(api_key=config.OPENAI_API_KEY)


def complete(prompt: str, system: str | None = None, model: str | None = None, client=None) -> str:
    """Send a single-turn chat completion request, returning the response text.

    `client` is injectable for testing -- must expose the same
    `.chat.completions.create(model=..., messages=...)` interface as the real
    `openai.OpenAI()` client, returning an object with
    `.choices[0].message.content`.
    """
    if client is None:
        client = _get_client()

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(model=model or config.OPENAI_MODEL, messages=messages)
    return response.choices[0].message.content
