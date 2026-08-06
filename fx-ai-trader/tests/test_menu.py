import pytest

from menu import OPCIONES, _interpretar_backtest, _interpretar_entrenamiento, _mostrar_comparacion_accuracy


def test_interpretar_entrenamiento_sin_ventaja(capsys):
    _interpretar_entrenamiento([{"accuracy": 0.48}, {"accuracy": 0.47}])
    salida = capsys.readouterr().out
    assert "NO muestra ventaja" in salida


def test_interpretar_entrenamiento_con_ventaja(capsys):
    _interpretar_entrenamiento([{"accuracy": 0.58}, {"accuracy": 0.56}])
    salida = capsys.readouterr().out
    assert "Por encima de adivinar al azar" in salida


def test_interpretar_backtest_negativo(capsys):
    _interpretar_backtest(
        {
            "n_trades": 100,
            "win_rate": 0.33,
            "profit_factor": 0.5,
            "sharpe": -10.0,
            "total_return": -0.5,
            "max_drawdown": 0.6,
            "final_equity": 5000.0,
        }
    )
    salida = capsys.readouterr().out
    assert "PERDIDO" in salida


def test_interpretar_backtest_positivo(capsys):
    _interpretar_backtest(
        {
            "n_trades": 100,
            "win_rate": 0.55,
            "profit_factor": 1.4,
            "sharpe": 1.2,
            "total_return": 0.2,
            "max_drawdown": 0.1,
            "final_equity": 12000.0,
        }
    )
    salida = capsys.readouterr().out
    assert "positivo" in salida.lower()
    assert "PERDIDO" not in salida


def test_comparacion_accuracy_ordena_de_mejor_a_peor(capsys):
    resultados = {
        "BTCUSDT": [{"accuracy": 0.48}, {"accuracy": 0.47}],
        "ETHUSDT": [{"accuracy": 0.55}, {"accuracy": 0.57}],
        "SOLUSDT": "not enough data",
    }
    _mostrar_comparacion_accuracy(resultados, ["BTCUSDT", "ETHUSDT"])
    salida = capsys.readouterr().out
    assert salida.index("ETHUSDT") < salida.index("BTCUSDT")
    assert "ETHUSDT es el más prometedor" in salida


def test_comparacion_accuracy_ninguno_supera_umbral(capsys):
    resultados = {"BTCUSDT": [{"accuracy": 0.48}], "ETHUSDT": [{"accuracy": 0.49}]}
    _mostrar_comparacion_accuracy(resultados, ["BTCUSDT", "ETHUSDT"])
    salida = capsys.readouterr().out
    assert "Ningún símbolo superó 0.53" in salida


def test_comparacion_accuracy_sin_exitosos_no_imprime_nada(capsys):
    _mostrar_comparacion_accuracy({}, [])
    salida = capsys.readouterr().out
    assert salida == ""


def test_opciones_del_menu_tienen_descripcion_y_funcion():
    assert len(OPCIONES) == 6
    for clave, (descripcion, funcion) in OPCIONES.items():
        assert isinstance(descripcion, str) and descripcion
        assert callable(funcion)
