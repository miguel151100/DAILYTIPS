import pytest

from menu import OPCIONES, _interpretar_backtest, _interpretar_entrenamiento


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


def test_opciones_del_menu_tienen_descripcion_y_funcion():
    assert len(OPCIONES) == 6
    for clave, (descripcion, funcion) in OPCIONES.items():
        assert isinstance(descripcion, str) and descripcion
        assert callable(funcion)
