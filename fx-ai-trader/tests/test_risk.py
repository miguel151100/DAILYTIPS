import pytest

from risk.manager import RiskManager


def test_position_size_scales_with_balance_and_uses_correct_pip_size():
    rm = RiskManager(starting_balance=10_000, risk_per_trade=0.01, stop_loss_pips=20)
    # risking 1% of 10,000 = 100, over a 20-pip (0.0020) stop -> 50,000 units
    assert rm.position_size(10_000, "EUR_USD") == pytest.approx(50_000)
    assert rm.position_size(20_000, "EUR_USD") == pytest.approx(100_000)
    # JPY pairs use pip=0.01 (100x larger than 0.0001) -> 100x fewer units for the same risk
    assert rm.position_size(10_000, "USD_JPY") == pytest.approx(500)


def test_stop_loss_and_take_profit_prices_long_and_short():
    rm = RiskManager(starting_balance=10_000, stop_loss_pips=20, take_profit_pips=40)
    entry = 1.1000

    assert rm.stop_loss_price(entry, "long", "EUR_USD") == pytest.approx(1.0980)
    assert rm.take_profit_price(entry, "long", "EUR_USD") == pytest.approx(1.1040)
    assert rm.stop_loss_price(entry, "short", "EUR_USD") == pytest.approx(1.1020)
    assert rm.take_profit_price(entry, "short", "EUR_USD") == pytest.approx(1.0960)


def test_jpy_pair_uses_100x_larger_pip_distance():
    rm = RiskManager(starting_balance=10_000, stop_loss_pips=20)
    entry = 150.00

    # 20 pips at 0.01/pip = 0.20, not 0.0020
    assert rm.stop_loss_price(entry, "long", "USD_JPY") == pytest.approx(149.80)


def test_max_positions_per_instrument_blocks_stacking_the_same_pair():
    rm = RiskManager(starting_balance=10_000, max_positions_per_instrument=1)
    assert rm.can_open_trade(10_000, "EUR_USD") is True
    rm.register_open("EUR_USD")
    assert rm.can_open_trade(10_000, "EUR_USD") is False
    # a different pair is unaffected by EUR_USD's cap
    assert rm.can_open_trade(10_000, "GBP_USD") is True

    rm.register_close("EUR_USD", 10_000)
    assert rm.can_open_trade(10_000, "EUR_USD") is True


def test_total_exposure_cap_limits_positions_across_all_pairs():
    rm = RiskManager(starting_balance=10_000, risk_per_trade=0.01, max_total_risk_fraction=0.03)
    # cap allows 3 concurrent positions (3 * 1% = 3%) across ANY pairs
    rm.register_open("EUR_USD")
    rm.register_open("GBP_USD")
    assert rm.can_open_trade(10_000, "USD_JPY") is True
    rm.register_open("USD_JPY")
    # a 4th position anywhere would push total risk to 4% > 3% cap
    assert rm.can_open_trade(10_000, "AUD_USD") is False
    assert rm.total_open_positions() == 3


def test_daily_loss_circuit_breaker_halts_trading_across_all_pairs():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    assert rm.can_open_trade(9_800, "EUR_USD") is True
    assert rm.can_open_trade(9_650, "EUR_USD") is False
    assert rm.halted is True
    # the halt blocks every instrument, not just the one being checked when it tripped
    assert rm.can_open_trade(9_900, "GBP_USD") is False


def test_start_new_day_resets_circuit_breaker():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    rm.can_open_trade(9_600, "EUR_USD")  # trips the breaker
    assert rm.halted is True

    rm.start_new_day(9_600)
    assert rm.halted is False
    assert rm.can_open_trade(9_600, "EUR_USD") is True


def test_register_close_can_trigger_breaker_after_a_losing_trade():
    rm = RiskManager(starting_balance=10_000, max_daily_loss_fraction=0.03)
    rm.register_open("EUR_USD")
    rm.register_close("EUR_USD", balance=9_500)  # a single trade blew past the daily limit
    assert rm.halted is True
    assert rm.can_open_trade(9_500, "GBP_USD") is False
