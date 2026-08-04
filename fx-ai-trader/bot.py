"""Paper-trading orchestration: one run = one decision at a candle close.

Fetch fresh data -> compute an ML signal -> pass it through the risk manager
-> place an order on the OANDA *practice* (demo) account -> log it.

Meant to be triggered once per candle close (e.g. hourly for H1) by an
external scheduler such as cron -- not run as a long-lived sleep loop, which
would drift and lose all state on restart. The daily-loss circuit breaker's
state is persisted to logs/risk_state.json specifically so it survives
across these separate invocations.
"""
import csv
import json
from datetime import datetime, timezone

import config
from data.fetch import fetch_candles, fetch_latest_price
from execution import oanda_client
from model.predict import latest_signal, load_model
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


def run_once(model=None) -> None:
    account = oanda_client.get_account_summary()
    balance = float(account["balance"])

    risk_manager = _load_risk_manager(balance)
    risk_manager.open_positions = oanda_client.get_open_trade_count()

    if not risk_manager.can_open_trade(balance):
        _save_risk_state(risk_manager)
        print(
            f"[{datetime.now(timezone.utc).isoformat()}] blocked: "
            f"halted={risk_manager.halted} open_positions={risk_manager.open_positions}"
        )
        return

    candles = fetch_candles(count=500)
    signal = latest_signal(candles, model=model)

    if signal.direction == "flat":
        print(f"[{signal.time}] no edge (p_up={signal.probability_up:.3f}), staying flat")
        _save_risk_state(risk_manager)
        return

    live_price = fetch_latest_price(config.INSTRUMENT)
    entry_price = live_price["ask"] if signal.direction == "long" else live_price["bid"]

    units = risk_manager.position_size(balance)
    if signal.direction == "short":
        units = -units

    stop_price = risk_manager.stop_loss_price(entry_price, signal.direction)
    target_price = risk_manager.take_profit_price(entry_price, signal.direction)

    oanda_client.place_market_order(config.INSTRUMENT, units, stop_price, target_price)
    risk_manager.register_open()
    _save_risk_state(risk_manager)

    _log_trade(
        {
            "time": signal.time.isoformat(),
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
        f"[{signal.time}] opened {signal.direction} {abs(units):.0f} units @ "
        f"{entry_price:.5f} (p_up={signal.probability_up:.3f})"
    )


def main() -> None:
    print(
        f"fx-ai-trader | account={config.OANDA_ENV} instrument={config.INSTRUMENT} "
        f"granularity={config.GRANULARITY}"
    )
    model = load_model()
    run_once(model=model)


if __name__ == "__main__":
    main()
