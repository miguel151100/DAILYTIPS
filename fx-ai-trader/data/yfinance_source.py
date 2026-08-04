"""Alternative historical data source using Yahoo Finance (via yfinance).

Unlike data/fetch.py (which requires an OANDA account), this needs no
credentials at all -- useful for training/backtesting against real market
data before an OANDA practice account is set up. Yahoo's intraday data is
limited to roughly the last 730 days, and is not a perfect substitute for a
broker feed (it isn't tick-accurate and has occasional gaps), but it's real
price action, not synthetic data.
"""
import pandas as pd
import yfinance as yf


def _to_yahoo_ticker(instrument: str) -> str:
    """OANDA-style "XXX_YYY" -> Yahoo's "XXXYYY=X" convention, which covers
    essentially any FX pair (majors, minors, most exotics) Yahoo also lists.
    An instrument with no underscore is assumed to already be a raw ticker
    and is passed through unchanged."""
    if "_" in instrument:
        return instrument.replace("_", "") + "=X"
    return instrument


def fetch_candles(instrument: str = "EUR_USD", interval: str = "1h", period: str = "730d") -> pd.DataFrame:
    """Fetch OHLC candles from Yahoo Finance for an OANDA-style instrument
    name (e.g. "EUR_USD", "USD_MXN", "GBP_JPY"), returned in the same schema
    as data.fetch.fetch_candles: a DataFrame indexed by UTC time with
    open/high/low/close/volume columns.
    """
    symbol = _to_yahoo_ticker(instrument)
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
