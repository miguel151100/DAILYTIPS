import config


def test_pip_size_for_jpy_pairs_is_100x_larger():
    assert config.pip_size_for("USD_JPY") == 0.01
    assert config.pip_size_for("EUR_JPY") == 0.01
    assert config.pip_size_for("GBP_JPY") == 0.01


def test_pip_size_for_non_jpy_pairs_is_standard():
    assert config.pip_size_for("EUR_USD") == 0.0001
    assert config.pip_size_for("GBP_USD") == 0.0001
    assert config.pip_size_for("USD_MXN") == 0.0001


def test_price_precision_matches_pip_size_convention():
    assert config.price_precision_for("USD_JPY") == 3
    assert config.price_precision_for("EUR_USD") == 5


def test_model_path_for_is_unique_per_instrument_and_granularity():
    eur_path = config.model_path_for("EUR_USD", "H1")
    jpy_path = config.model_path_for("USD_JPY", "H1")
    eur_h4_path = config.model_path_for("EUR_USD", "H4")

    assert eur_path != jpy_path
    assert eur_path != eur_h4_path
    assert "EUR_USD" in str(eur_path)
    assert "H1" in str(eur_path)


def test_model_path_for_defaults_to_configured_granularity():
    assert config.model_path_for("EUR_USD") == config.model_path_for("EUR_USD", config.GRANULARITY)
