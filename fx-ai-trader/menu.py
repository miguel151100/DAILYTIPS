"""Menu interactivo en español para fx-ai-trader.

Pensado para alguien que no programa: en vez de recordar comandos como
`python -m model.train BTCUSDT`, corres `python menu.py` y eliges opciones
de una lista. Envuelve las funciones existentes (model/train.py,
backtest/engine.py, report.py, bot.py) -- no cambia ninguna lógica de
trading, solo la forma de invocarla y de leer sus resultados.
"""
from __future__ import annotations

import sys

import config

SEPARADOR = "-" * 60


def _pedir_simbolo(por_defecto: str = "BTCUSDT") -> str:
    entrada = input(f"Símbolo de Binance Futures [{por_defecto}]: ").strip().upper()
    return entrada or por_defecto


def _pedir_confirmacion(mensaje: str) -> bool:
    respuesta = input(f"{mensaje} (escribe SI para confirmar): ").strip().upper()
    return respuesta == "SI"


def _interpretar_entrenamiento(fold_metrics: list[dict]) -> None:
    promedio = sum(m["accuracy"] for m in fold_metrics) / len(fold_metrics)
    print(f"\nPrecisión promedio (walk-forward): {promedio:.4f}  (0.50 = tirar una moneda)")
    if promedio <= 0.50:
        print(
            "⚠️  El modelo NO muestra ventaja real sobre adivinar al azar. "
            "Esto no es un error del sistema -- es una señal honesta de que, con esta "
            "configuración, no hay patrón explotable todavía."
        )
    elif promedio < 0.53:
        print(
            "⚠️  Ligeramente por encima de adivinar al azar, pero muy poco margen. "
            "Corre igual el backtest antes de sacar conclusiones -- la precisión sola "
            "no dice si ganarías dinero una vez contando comisiones y slippage."
        )
    else:
        print(
            "✅  Por encima de adivinar al azar con algo de margen. Sigue siendo obligatorio "
            "correr el backtest antes de confiar en esto -- la precisión no incluye comisiones, "
            "slippage, ni el tamaño de las ganancias/pérdidas."
        )


def _interpretar_backtest(resultados: dict) -> None:
    print(f"\nOperaciones simuladas: {resultados['n_trades']}")
    print(f"Tasa de acierto: {resultados['win_rate']:.1%}")
    print(f"Factor de ganancia (profit factor): {resultados['profit_factor']:.3f}  (>1 = gana más de lo que pierde)")
    print(f"Sharpe: {resultados['sharpe']:.2f}")
    print(f"Retorno total: {resultados['total_return']:.1%}")
    print(f"Máxima caída (drawdown): {resultados['max_drawdown']:.1%}")
    print(f"Capital final (desde $10,000): ${resultados['final_equity']:,.2f}")

    print()
    if resultados["total_return"] <= 0 or resultados["profit_factor"] < 1:
        print(
            "❌  Resultado negativo: con estos parámetros, esta estrategia habría PERDIDO "
            "dinero en el periodo probado. No se recomienda pasar a testnet/bot.py todavía."
        )
    else:
        print(
            "✅  Resultado positivo en este periodo probado. Aun así, un backtest positivo "
            "no garantiza resultados futuros -- probarlo primero en testnet (dinero simulado) "
            "antes de considerar dinero real."
        )


def entrenar_un_simbolo() -> None:
    from data.fetch import fetch_candles
    from model.train import run

    simbolo = _pedir_simbolo()
    print(f"\nDescargando velas de Binance para {simbolo} y entrenando el modelo...")
    try:
        velas = fetch_candles(symbol=simbolo, count=1500)
        fold_metrics = run(velas, simbolo)
    except Exception as e:
        print(f"\n❌  No se pudo entrenar: {e}")
        return
    _interpretar_entrenamiento(fold_metrics)


def entrenar_todos_los_simbolos() -> None:
    from data.fetch import resolve_symbols
    from model.train import train_all

    simbolos = resolve_symbols()
    print(f"\nEntrenando {len(simbolos)} símbolos: {', '.join(simbolos)}")
    if not _pedir_confirmacion("Esto puede tardar varios minutos. ¿Continuar?"):
        print("Cancelado.")
        return
    resultados = train_all(simbolos)
    exitosos = [s for s, r in resultados.items() if not isinstance(r, str)]
    fallidos = [s for s, r in resultados.items() if isinstance(r, str)]
    print(f"\nEntrenados con éxito: {len(exitosos)}  |  Saltados: {len(fallidos)}")
    if fallidos:
        print(f"Saltados: {', '.join(fallidos)}")


def correr_backtest() -> None:
    from backtest.engine import run_backtest
    from backtest.plot import plot_equity_curve
    from data.fetch import fetch_candles

    simbolo = _pedir_simbolo()
    print(f"\nDescargando velas de Binance para {simbolo} y corriendo el backtest...")
    try:
        velas = fetch_candles(symbol=simbolo, count=1500)
        resultados = run_backtest(velas, symbol=simbolo)
    except Exception as e:
        print(f"\n❌  No se pudo correr el backtest: {e}")
        return
    _interpretar_backtest(resultados)

    ruta = config.LOG_DIR / f"{simbolo}_equity_curve.png"
    plot_equity_curve(resultados["equity_curve"], ruta)
    print(f"\nGráfico de la curva de capital guardado en: {ruta}")


def correr_backtest_portafolio() -> None:
    from backtest.engine import run_portfolio_backtest
    from backtest.plot import plot_equity_curve
    from data.fetch import fetch_candles, resolve_symbols

    simbolos = resolve_symbols()
    print(f"\nDescargando velas para {len(simbolos)} símbolos y corriendo el backtest de portafolio...")
    if not _pedir_confirmacion("Esto puede tardar varios minutos. ¿Continuar?"):
        print("Cancelado.")
        return
    try:
        datos_por_simbolo = {s: fetch_candles(symbol=s, count=1500) for s in simbolos}
        resultados = run_portfolio_backtest(datos_por_simbolo)
    except Exception as e:
        print(f"\n❌  No se pudo correr el backtest de portafolio: {e}")
        return
    _interpretar_backtest(resultados)

    ruta = config.LOG_DIR / "portfolio_equity_curve.png"
    plot_equity_curve(resultados["equity_curve"], ruta)
    print(f"\nGráfico de la curva de capital guardado en: {ruta}")


def ver_reporte() -> None:
    from report import generate_report, save_report

    print("\nGenerando resumen de operaciones registradas (requiere OPENAI_API_KEY)...")
    try:
        texto = generate_report()
    except Exception as e:
        print(f"\n❌  No se pudo generar el reporte: {e}")
        return
    print(f"\n{texto}\n")
    ruta = save_report(texto)
    print(f"Guardado en: {ruta}")


def correr_bot_una_vez() -> None:
    from bot import run_once

    print(
        f"\n⚠️  Esto va a colocar operaciones REALES en tu cuenta de Binance Futures "
        f"({config.BINANCE_ENV}). Requiere BINANCE_API_KEY/BINANCE_API_SECRET configuradas "
        f"y un modelo ya entrenado para cada símbolo."
    )
    if config.BINANCE_ENV == "live":
        print("🚨  BINANCE_ENV=live -- esto es DINERO REAL, no testnet.")
    if not _pedir_confirmacion("¿Seguro que quieres ejecutar el bot ahora?"):
        print("Cancelado.")
        return
    try:
        run_once()
    except Exception as e:
        print(f"\n❌  Error al correr el bot: {e}")
        return
    print("\nListo. Revisa logs/trades.csv para ver qué se abrió (si algo se abrió).")


OPCIONES = {
    "1": ("Entrenar el modelo para un símbolo", entrenar_un_simbolo),
    "2": ("Entrenar el modelo para TODOS los símbolos", entrenar_todos_los_simbolos),
    "3": ("Correr backtest de un símbolo", correr_backtest),
    "4": ("Correr backtest de portafolio (todos los símbolos)", correr_backtest_portafolio),
    "5": ("Ver reporte de operaciones (en español, vía OpenAI)", ver_reporte),
    "6": ("Ejecutar el bot ahora (testnet/live según .env)", correr_bot_una_vez),
}


def mostrar_menu() -> None:
    print(SEPARADOR)
    print("fx-ai-trader -- menú interactivo")
    print(SEPARADOR)
    for clave, (descripcion, _) in OPCIONES.items():
        print(f"  {clave}) {descripcion}")
    print("  0) Salir")
    print(SEPARADOR)


def main() -> None:
    print("Bienvenido. Todo lo que hagas aquí es en el entorno configurado en tu archivo .env")
    print(f"(actualmente: BINANCE_ENV={config.BINANCE_ENV})\n")
    while True:
        mostrar_menu()
        eleccion = input("Elige una opción: ").strip()
        if eleccion == "0":
            print("Hasta luego.")
            return
        opcion = OPCIONES.get(eleccion)
        if not opcion:
            print("Opción inválida, intenta de nuevo.\n")
            continue
        _, funcion = opcion
        try:
            funcion()
        except KeyboardInterrupt:
            print("\nInterrumpido.")
        except Exception as e:
            print(f"\n❌  Error inesperado: {e}")
        print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nHasta luego.")
        sys.exit(0)
