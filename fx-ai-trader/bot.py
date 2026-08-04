"""Paper-trading orchestration: one run = one decision per configured pair.

Fetch fresh data -> compute an ML signal -> pass it through the (portfolio-
aware) risk manager -> place an order on the OANDA *practice* (demo) account
-> log it. Loops over every instrument returned by
data.fetch.resolve_instruments() (the FX_INSTRUMENTS env override if set,
else every currency pair OANDA's account offers); a pair with no trained
model yet is skipped silently so partial rollout works fine.

Meant to be triggered once per candle close (e.g. hourly for H1) by an
external scheduler such as cron -- not run as a long-lived sleep loop, which
would drift and lose all state on restart. The daily-loss circuit breaker's
state is persisted to logs/risk_state.json specifically so it survives
across these separate invocations.

Two optional, fail-open advisory filters run before each trade if
OPENAI_API_KEY is set: news.calendar blocks trading near high-impact
calendar events (deterministic, no LLM), and llm.sentiment vetoes trades
that go against the currency's recent news sentiment (LLM-scored, cached
per currency). Both are additive risk reduction on top of the existing
model + risk manager, not requirements -- if either errors out, the bot logs
it and trades anyway.
"""
import csv
import json
from datetime import datetime, timezone

import config
from data.fetch import fetch_candles, fetch_latest_price, resolve_instruments
from execution import oanda_client
from llm import sentiment
from model.predict import latest_signal, load_model
from news import calendar
from risk.manager import RiskManager

LOG_PATH = config.LOG_DIR / "trades.csv"
STATE_PATH = config.LOG_DIR / "risk_state.json"


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


def _sentiment_vetoes(instrument: str, direction: str) -> bool:
    """True if currency sentiment meaningfully opposes the model's direction.
    Pair sentiment = base currency sentiment - quote currency sentiment (both
    -1..1); a long bets the base strengthens vs. the quote, so a strongly
    negative pair sentiment opposes a long and vice versa for a short."""
    base, quote = instrument.split("_")
    pair_sentiment = max(-1.0, min(1.0, sentiment.get_sentiment(base) - sentiment.get_sentiment(quote)))
    if direction == "long":
        return pair_sentiment <= config.SENTIMENT_VETO_THRESHOLD
    return pair_sentiment >= -config.SENTIMENT_VETO_THRESHOLD


def _trade_one_instrument(instrument: str, balance: float, risk_manager: RiskManager, calendar_events: list) -> None:
    model_path = config.model_path_for(instrument)
    if not model_path.exists():
        return  # no trained model for this pair yet -- not an error, just not deployed

    if not risk_manager.can_open_trade(balance, instrument):
        return

    # Both filters below are advisory, fail-open: if the check itself errors
    # out (flaky feed, LLM hiccup), we log it and trade anyway rather than
    # let a best-effort risk *reduction* become a hard blocker. The real
    # safety net (stop-loss, daily circuit breaker, exposure caps) doesn't
    # depend on either of these.
    try:
        if calendar.high_impact_window(calendar_events, instrument, datetime.now(timezone.utc)):
            print(f"[{instrument}] skipped: high-impact news event nearby")
            return
    except Exception as e:
        print(f"[{instrument}] news filter error, continuing without it: {e}")

    try:
        candles = fetch_candles(instrument=instrument, count=500)
        signal = latest_signal(candles, instrument, model=load_model(instrument))
    except Exception as e:
        print(f"[{instrument}] error: {e}")
        return

    if signal.direction == "flat":
        return

    try:
        if _sentiment_vetoes(instrument, signal.direction):
            print(f"[{instrument}] skipped: sentiment opposes {signal.direction}")
            return
    except Exception as e:
        print(f"[{instrument}] sentiment filter error, continuing without it: {e}")

    live_price = fetch_latest_price(instrument)
    entry_price = live_price["ask"] if signal.direction == "long" else live_price["bid"]

    units = risk_manager.position_size(balance, instrument)
    if signal.direction == "short":
        units = -units

    stop_price = risk_manager.stop_loss_price(entry_price, signal.direction, instrument)
    target_price = risk_manager.take_profit_price(entry_price, signal.direction, instrument)

    oanda_client.place_market_order(instrument, units, stop_price, target_price)
    risk_manager.register_open(instrument)

    _log_trade(
        {
            "time": signal.time.isoformat(),
            "instrument": instrument,
            "direction": signal.direction,
            "probability_up": signal.probability_up,
            "entry_price": entry_price,
            "stop_price": stop_price,
            "target_price": target_price,
            "units": units,
            "balance_before": balance,
        }
    )
    print(
        f"[{instrument}] [{signal.time}] opened {signal.direction} {abs(units):.0f} units @ "
        f"{entry_price:.5f} (p_up={signal.probability_up:.3f})"
    )


def run_once(instruments: list[str] | None = None) -> None:
    account = oanda_client.get_account_summary()
    balance = float(account["balance"])

    risk_manager = _load_risk_manager(balance)
    risk_manager.open_positions = oanda_client.get_open_trades_by_instrument()

    if risk_manager.halted:
        _save_risk_state(risk_manager)
        print(f"[{datetime.now(timezone.utc).isoformat()}] halted: daily loss circuit breaker tripped")
        return

    try:
        calendar_events = calendar.fetch_calendar_events()
    except Exception as e:
        print(f"calendar fetch failed, continuing without the news filter: {e}")
        calendar_events = []

    for instrument in instruments or resolve_instruments():
        try:
            _trade_one_instrument(instrument, balance, risk_manager, calendar_events)
        except Exception as e:
            # last-resort safety net: a live-price fetch or order-placement
            # failure on one pair must not take down the rest of the run
            print(f"[{instrument}] unexpected error, skipping this pair this run: {e}")

    _save_risk_state(risk_manager)


def main() -> None:
    print(f"fx-ai-trader | account={config.OANDA_ENV} granularity={config.GRANULARITY}")
    run_once()


if __name__ == "__main__":
    main()
