import config


def test_model_path_for_is_unique_per_symbol_and_interval():
    btc_path = config.model_path_for("BTCUSDT", "1h")
    eth_path = config.model_path_for("ETHUSDT", "1h")
    btc_4h_path = config.model_path_for("BTCUSDT", "4h")

    assert btc_path != eth_path
    assert btc_path != btc_4h_path
    assert "BTCUSDT" in str(btc_path)
    assert "1h" in str(btc_path)


def test_model_path_for_defaults_to_configured_interval():
    assert config.model_path_for("BTCUSDT") == config.model_path_for("BTCUSDT", config.BINANCE_INTERVAL)


def test_risk_distances_are_percentages_not_fixed_amounts():
    # sanity-check these read as fractions (e.g. 0.015 = 1.5%), not stray
    # leftover pip-scale numbers (e.g. 20) from the forex version
    assert 0 < config.STOP_LOSS_PERCENT < 1
    assert 0 < config.TAKE_PROFIT_PERCENT < 1


def test_leverage_and_margin_type_defaults_are_conservative():
    # low leverage keeps the liquidation price far from any reasonable stop;
    # ISOLATED margin caps a losing position's damage to its own margin
    assert config.BINANCE_LEVERAGE <= 5
    assert config.BINANCE_MARGIN_TYPE == "ISOLATED"


def test_binance_env_defaults_to_testnet():
    assert config.BINANCE_ENV == "testnet"
    assert "testnet" in config.BINANCE_BASE_URL
