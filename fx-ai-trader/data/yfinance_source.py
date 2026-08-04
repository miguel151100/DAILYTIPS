"""Alternative historical data source using Yahoo Finance (via yfinance).

Unlike data/fetch.py (which requires an OANDA account), this needs no
credentials at all -- useful for training/backtesting against real market
data before an OANDA practice account is set up. Yahoo's intraday data is
limited to roughly the last 730 days, and is not a perfect substitute for a
broker feed (it isn't tick-accurate and has occasional gaps), but it's real
EUR/USD price action, not synthetic data.
"""
import pandas as pd
import yfinance as yf

_YF_SYMBOL = {
    "EUR_USD": "EURUSD=X",
    "GBP_USD": "GBPUSD=X",
    "USD_JPY": "USDJPY=X",
}


def fetch_candles(instrument: str = "EUR_USD", interval: str = "1h", period: str = "730d") -> pd.DataFrame:
    """Fetch OHLC candles from Yahoo Finance for an OANDA-style instrument
    name (e.g. "EUR_USD"), returned in the same schema as data.fetch.fetch_candles:
    a DataFrame indexed by UTC time with open/high/low/close/volume columns.
    """
    symbol = _YF_SYMBOL.get(instrument, instrument)
    raw = yf.download(
        symbol, interval=interval, period=period, auto_adjust=False, progress=False, multi_level_index=False
    )
    if raw.empty:
        raise RuntimeError(
            f"Yahoo Finance returned no data for {symbol} (interval={interval}, period={period}). "
            "Intraday history is limited to ~730 days and rate limits can also cause empty responses."
        )

    df = raw.rename(columns=str.lower)[["open", "high", "low", "close", "volume"]].copy()
    df.index = pd.to_datetime(df.index, utc=True)
    df.index.name = "time"
    return df.sort_index()


if __name__ == "__main__":
    df = fetch_candles()
    print(df.tail())
    print(f"fetched {len(df)} candles, {df.index[0]} -> {df.index[-1]}")
