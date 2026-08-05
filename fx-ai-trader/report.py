"""Plain-language summary of the bot's trading activity, generated from
logs/trades.csv via the OpenAI API. Read-only -- touches no trading logic.

NOTE: trades.csv only records trades as they're OPENED (direction, entry
price, stop/target, model confidence) -- it does not track realized
win/loss, since that requires reconciling against Binance's closed-trade
history, which this script doesn't do. The report describes activity, not
performance; check backtest/engine.py results or your Binance testnet
account statement for actual P&L.
"""
import csv
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import config
from llm.openai_client import complete

TRADES_LOG = config.LOG_DIR / "trades.csv"

_REPORT_SYSTEM_PROMPT = (
    "You are a trading assistant summarizing a crypto futures bot's activity "
    "for its operator, in Spanish, in 3-5 sentences. Be factual and neutral -- "
    "you are describing what happened (trades opened, which symbols, which "
    "direction), not evaluating performance, since win/loss data isn't "
    "provided. Do not invent numbers beyond what's given."
)


def _read_trades(path: Path = TRADES_LOG) -> list[dict]:
    if not path.exists():
        return []
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def summarize_trades(trades: list[dict]) -> dict:
    """Structured counts -- what the LLM turns into prose, not the LLM's own
    output, so the numbers themselves are never at risk of being hallucinated."""
    by_symbol = Counter(t["symbol"] for t in trades)
    by_direction = Counter(t["direction"] for t in trades)
    return {
        "n_trades": len(trades),
        "by_symbol": dict(by_symbol),
        "by_direction": dict(by_direction),
        "symbols_traded": sorted(by_symbol.keys()),
    }


def generate_report(trades: list[dict] | None = None, client=None) -> str:
    trades = trades if trades is not None else _read_trades()
    summary = summarize_trades(trades)

    if summary["n_trades"] == 0:
        return "No se abrieron operaciones en el periodo registrado."

    prompt = (
        "Resumen de actividad del bot:\n"
        f"- Operaciones abiertas: {summary['n_trades']}\n"
        f"- Por símbolo: {summary['by_symbol']}\n"
        f"- Por dirección: {summary['by_direction']}\n"
    )
    return complete(prompt, system=_REPORT_SYSTEM_PROMPT, client=client)


def save_report(text: str, date: str | None = None) -> Path:
    date = date or datetime.now(timezone.utc).date().isoformat()
    path = config.LOG_DIR / f"report_{date}.txt"
    path.write_text(text)
    return path


def main() -> None:
    report = generate_report()
    print(report)
    path = save_report(report)
    print(f"\nsaved to {path}")


if __name__ == "__main__":
    main()
