import pytest

from risk.manager import RiskManager


def test_position_size_scales_with_balance_and_risk():
    rm = RiskManager(starting_balance=10_000, risk_per_trade=0.01, stop_loss_pips=20, pip_size=0.0001)
    # risking 1% of 10,000 = 100, over a 20-pip (0.0020) stop -> 50,000 units
    assert rm.position_size(10_000) == pytest.approx(50_000)
    # position size scales linearly with balance
    assert rm.position_size(20_000) == pytest.approx(100_000)


def test_stop_loss_and_take_profit_prices_long_and_short():
    rm = RiskManager(starting_balance=10_000, stop_loss_pips=20, take_profit_pips=40, pip_size=0.0001)
    entry = 1.1000

    assert rm.stop_loss_price(entry, "long") == pytest.approx(1.0980)
    assert rm.take_profit_price(entry, "long") == pytest.approx(1.1040)
    assert rm.stop_loss_price(entry, "short") == pytest.approx(1.1020)
    assert rm.take_profit_price(entry, "short") == pytest.approx(1.0960)


def test_max_open_positions_blocks_new_trades():
    rm = RiskManager(starting_balance=10_000, max_open_positions=1)
    assert rm.can_open_trade(10_000) is True
    rm.register_open()
    assert rm.can_open_trade(10_000) is False
    rm.register_close(10_000)
    assert rm.can_open_trade(10_000) is True


def test_daily_loss_circuit_breaker_halts_trading():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    # a 2% loss is within tolerance
    assert rm.can_open_trade(9_800) is True
    # a 3%+ loss trips the breaker and it stays tripped for the rest of the day
    assert rm.can_open_trade(9_650) is False
    assert rm.halted is True
    # even a partial recovery doesn't un-halt within the same day
    assert rm.can_open_trade(9_900) is False


def test_start_new_day_resets_circuit_breaker():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    rm.can_open_trade(9_600)  # trips the breaker
    assert rm.halted is True

    rm.start_new_day(9_600)
    assert rm.halted is False
    assert rm.can_open_trade(9_600) is True


def test_register_close_can_trigger_breaker_after_a_losing_trade():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    rm.register_open()
    rm.register_close(balance=9_500)  # a single trade blew past the daily limit
    assert rm.halted is True
    assert rm.can_open_trade(9_500) is False
