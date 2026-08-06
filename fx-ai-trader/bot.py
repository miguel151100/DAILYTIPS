"""Paper-trading orchestration: one run = one decision per configured
Binance Futures symbol.

Fetch fresh data -> compute an ML signal -> pass it through the (portfolio-
aware) risk manager -> place a market order with stop-loss/take-profit
brackets on the *testnet* account -> log it. Loops over every symbol
returned by data.fetch.resolve_symbols() (the BINANCE_SYMBOLS env override
if set, else every USDT-margined perpetual Binance offers); a symbol with no
trained model yet is skipped silently so partial rollout works fine.

Meant to be triggered once per candle close (e.g. hourly for the default 1h
interval) by an external scheduler such as cron -- not run as a long-lived
sleep loop, which would drift and lose all state on restart. The daily-loss
circuit breaker's state is persisted to logs/risk_state.json specifically so
it survives across these separate invocations.

Two optional, fail-open advisory filters run before each trade if
OPENAI_API_KEY is set: news.calendar blocks trading near high-impact
calendar events for the symbol's quote currency (deterministic, no LLM), and
llm.sentiment vetoes trades that go against the base/quote asset's recent
news sentiment (LLM-scored, cached per asset). Both are additive risk
reduction on top of the existing model + risk manager, not requirements --
if either errors out, the bot logs it and trades anyway.
"""
from __future__ import annotations

import csv
import json
from datetime import datetime, timezone

import config
from data.fetch import fetch_candles, fetch_latest_price, resolve_symbols
from execution import binance_client
from llm import sentiment
from model.predict import latest_signal, load_model
from news import calendar
from risk.manager import RiskManager

LOG_PATH = config.LOG_DIR / "trades.csv"
STATE_PATH = config.LOG_DIR / "risk_state.json"

# Binance quote stablecoins map to "USD" for calendar/sentiment purposes --
# Fed/CPI news is exactly what's relevant to a USDT-margined position.
_STABLECOIN_TO_USD = {"USDT": "USD", "BUSD": "USD", "USDC": "USD", "FDUSD": "USD"}


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _load_risk_manager(current_balance: float) -> RiskManager:
    rm = RiskManager(starting_balance=current_balance)
    if STATE_PATH.exists():
        state = json.loads(STATE_PATH.read_text())
        if state.get("date") == _today():
            rm.day_start_balance = state["day_start_balance"]
            rm.halted = state["halted"]
            return rm
    rm.start_new_day(current_balance)
    return rm


def _save_risk_state(rm: RiskManager) -> None:
    STATE_PATH.write_text(
        json.dumps({"date": _today(), "day_start_balance": rm.day_start_balance, "halted": rm.halted})
    )


def _log_trade(row: dict) -> None:
    is_new = not LOG_PATH.exists()
    with open(LOG_PATH, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(row.keys()))
        if is_new:
            writer.writeheader()
        writer.writerow(row)


def _symbol_currencies(symbol: str) -> tuple[str, str]:
    """(base, quote) currency codes for sentiment/calendar purposes -- read
    from the exchange (not guessed from the symbol string), with stablecoin
    quote assets mapped to "USD"."""
    info = binance_client.get_symbol_info(symbol)
    quote = _STABLECOIN_TO_USD.get(info["quote_asset"], info["quote_asset"])
    return info["base_asset"], quote


def _sentiment_vetoes(symbol: str, direction: str) -> bool:
    """True if asset sentiment meaningfully opposes the model's direction.
    Pair sentiment = base asset sentiment - quote currency sentiment (both
    -1..1); a long bets the base strengthens vs. the quote, so a strongly
    negative pair sentiment opposes a long and vice versa for a short."""
    base, quote = _symbol_currencies(symbol)
    pair_sentiment = max(-1.0, min(1.0, sentiment.get_sentiment(base) - sentiment.get_sentiment(quote)))
    if direction == "long":
        return pair_sentiment <= config.SENTIMENT_VETO_THRESHOLD
    return pair_sentiment >= -config.SENTIMENT_VETO_THRESHOLD


def _trade_one_symbol(symbol: str, balance: float, risk_manager: RiskManager, calendar_events: list) -> None:
    model_path = config.model_path_for(symbol)
    if not model_path.exists():
        return  # no trained model for this symbol yet -- not an error, just not deployed

    if not risk_manager.can_open_trade(balance, symbol):
        return

    # Both filters below are advisory, fail-open: if the check itself errors
    # out (flaky feed, LLM hiccup), we log it and trade anyway rather than
    # let a best-effort risk *reduction* become a hard blocker. The real
    # safety net (stop-loss, daily circuit breaker, exposure caps) doesn't
    # depend on either of these.
    try:
        base, quote = _symbol_currencies(symbol)
        if calendar.high_impact_window(calendar_events, {base, quote}, datetime.now(timezone.utc)):
            print(f"[{symbol}] skipped: high-impact news event nearby")
            return
    except Exception as e:
        print(f"[{symbol}] news filter error, continuing without it: {e}")

    try:
        candles = fetch_candles(symbol=symbol, count=500)
        signal = latest_signal(candles, symbol, model=load_model(symbol))
    except Exception as e:
        print(f"[{symbol}] error: {e}")
        return

    if signal.direction == "flat":
        return

    try:
        if _sentiment_vetoes(symbol, signal.direction):
            print(f"[{symbol}] skipped: sentiment opposes {signal.direction}")
            return
    except Exception as e:
        print(f"[{symbol}] sentiment filter error, continuing without it: {e}")

    live_price = fetch_latest_price(symbol)
    entry_price = live_price["ask"] if signal.direction == "long" else live_price["bid"]

    quantity = risk_manager.position_size(balance, entry_price)
    stop_price = risk_manager.stop_loss_price(entry_price, signal.direction)
    target_price = risk_manager.take_profit_price(entry_price, signal.direction)

    binance_client.place_market_order_with_brackets(symbol, signal.direction, quantity, stop_price, target_price)
    risk_manager.register_open(symbol)

    _log_trade(
        {
            "time": signal.time.isoformat(),
            "symbol": symbol,
            "direction": signal.direction,
            "probability_up": signal.probability_up,
            "entry_price": entry_price,
            "stop_price": stop_price,
            "target_price": target_price,
            "quantity": quantity,
            "balance_before": balance,
        }
    )
    print(
        f"[{symbol}] [{signal.time}] opened {signal.direction} {quantity} @ "
        f"{entry_price} (p_up={signal.probability_up:.3f})"
    )


def run_once(symbols: list[str] | None = None) -> None:
    balance = binance_client.get_account_balance()

    risk_manager = _load_risk_manager(balance)
    risk_manager.open_positions = binance_client.get_open_positions_by_symbol()

    if risk_manager.halted:
        _save_risk_state(risk_manager)
        print(f"[{datetime.now(timezone.utc).isoformat()}] halted: daily loss circuit breaker tripped")
        return

    try:
        calendar_events = calendar.fetch_calendar_events()
    except Exception as e:
        print(f"calendar fetch failed, continuing without the news filter: {e}")
        calendar_events = []

    for symbol in symbols or resolve_symbols():
        try:
            _trade_one_symbol(symbol, balance, risk_manager, calendar_events)
        except Exception as e:
            # last-resort safety net: a live-price fetch or order-placement
            # failure on one symbol must not take down the rest of the run
            print(f"[{symbol}] unexpected error, skipping this symbol this run: {e}")

    _save_risk_state(risk_manager)


def main() -> None:
    print(f"fx-ai-trader | account={config.BINANCE_ENV} interval={config.BINANCE_INTERVAL}")
    run_once()


if __name__ == "__main__":
    main()
