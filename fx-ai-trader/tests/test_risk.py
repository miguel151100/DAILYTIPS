import pytest

from risk.manager import RiskManager


def test_position_size_scales_with_balance_and_entry_price():
    rm = RiskManager(starting_balance=10_000, risk_per_trade=0.01, stop_loss_percent=0.015)
    # risking 1% of 10,000 = 100, over a 1.5% stop at entry=60,000 -> stop
    # distance = 900 -> 100/900 BTC
    assert rm.position_size(10_000, entry_price=60_000) == pytest.approx(100 / 900)
    # double the balance -> double the quantity for the same entry price
    assert rm.position_size(20_000, entry_price=60_000) == pytest.approx(200 / 900)
    # a 10x higher entry price -> 10x smaller quantity for the same $ risk
    assert rm.position_size(10_000, entry_price=600_000) == pytest.approx(10 / 900)


def test_stop_loss_and_take_profit_prices_long_and_short():
    rm = RiskManager(starting_balance=10_000, stop_loss_percent=0.015, take_profit_percent=0.03)
    entry = 60_000.0

    assert rm.stop_loss_price(entry, "long") == pytest.approx(59_100.0)
    assert rm.take_profit_price(entry, "long") == pytest.approx(61_800.0)
    assert rm.stop_loss_price(entry, "short") == pytest.approx(60_900.0)
    assert rm.take_profit_price(entry, "short") == pytest.approx(58_200.0)


def test_percent_based_distance_scales_with_price_unlike_fixed_pips():
    rm = RiskManager(starting_balance=10_000, stop_loss_percent=0.015)

    # a token at $0.002 gets a proportionally tiny absolute stop distance --
    # no separate per-symbol convention needed, unlike forex's JPY pip hack
    small = rm.stop_loss_price(0.002, "long")
    assert small == pytest.approx(0.002 * 0.985)


def test_max_positions_per_instrument_blocks_stacking_the_same_symbol():
    rm = RiskManager(starting_balance=10_000, max_positions_per_instrument=1)
    assert rm.can_open_trade(10_000, "BTCUSDT") is True
    rm.register_open("BTCUSDT")
    assert rm.can_open_trade(10_000, "BTCUSDT") is False
    # a different symbol is unaffected by BTCUSDT's cap
    assert rm.can_open_trade(10_000, "ETHUSDT") is True

    rm.register_close("BTCUSDT", 10_000)
    assert rm.can_open_trade(10_000, "BTCUSDT") is True


def test_total_exposure_cap_limits_positions_across_all_symbols():
    rm = RiskManager(starting_balance=10_000, risk_per_trade=0.01, max_total_risk_fraction=0.03)
    # cap allows 3 concurrent positions (3 * 1% = 3%) across ANY symbols
    rm.register_open("BTCUSDT")
    rm.register_open("ETHUSDT")
    assert rm.can_open_trade(10_000, "SOLUSDT") is True
    rm.register_open("SOLUSDT")
    # a 4th position anywhere would push total risk to 4% > 3% cap
    assert rm.can_open_trade(10_000, "BNBUSDT") is False
    assert rm.total_open_positions() == 3


def test_daily_loss_circuit_breaker_halts_trading_across_all_symbols():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    assert rm.can_open_trade(9_800, "BTCUSDT") is True
    assert rm.can_open_trade(9_650, "BTCUSDT") is False
    assert rm.halted is True
    # the halt blocks every symbol, not just the one being checked when it tripped
    assert rm.can_open_trade(9_900, "ETHUSDT") is False


def test_start_new_day_resets_circuit_breaker():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    rm.can_open_trade(9_600, "BTCUSDT")  # trips the breaker
    assert rm.halted is True

    rm.start_new_day(9_600)
    assert rm.halted is False
    assert rm.can_open_trade(9_600, "BTCUSDT") is True


def test_register_close_can_trigger_breaker_after_a_losing_trade():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    rm.register_open("BTCUSDT")
    rm.register_close("BTCUSDT", balance=9_500)  # a single trade blew past the daily limit
    assert rm.halted is True
    assert rm.can_open_trade(9_500, "ETHUSDT") is False
