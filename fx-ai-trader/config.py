"""Central configuration for the FX trading bot."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model" / "saved"
LOG_DIR = BASE_DIR / "logs"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

# --- OANDA API ---
OANDA_API_TOKEN = os.environ.get("OANDA_API_TOKEN", "")
OANDA_ACCOUNT_ID = os.environ.get("OANDA_ACCOUNT_ID", "")
OANDA_ENV = os.environ.get("OANDA_ENV", "practice")  # "practice" or "live" -- never default to live
OANDA_HOSTS = {
    "practice": "https://api-fxpractice.oanda.com",
    "live": "https://api-fxtrade.oanda.com",
}
OANDA_BASE_URL = OANDA_HOSTS[OANDA_ENV]

# --- Instrument universe / timeframe ---
# FX_INSTRUMENTS: optional comma-separated override (e.g. "EUR_USD,GBP_JPY").
# Left unset, data.fetch.resolve_instruments() uses every currency pair OANDA
# itself offers -- read there (not here) to avoid a circular import with
# data/fetch.py.
GRANULARITY = os.environ.get("FX_GRANULARITY", "H1")  # OANDA candle granularity
LABEL_HORIZON = 4  # predict direction N candles ahead

# --- Model ---
# min predicted probability (either direction) to act on a signal. Lower =
# trades more often, on weaker signals -- NOT the same as "wins more often".
# On synthetic no-edge data, dropping this from 0.58 to 0.51 raised trade
# count ~47% (1597 -> 2354) while total return got worse, not better (-86.8%
# -> -92.4%): more trades just means paying the spread more often when there
# is no real edge behind the extra signals. Re-run that same comparison
# (backtest.engine with different `threshold` values) against real data
# before trusting a lowered default -- synthetic data can't tell you the
# right number, only that "lower != better" isn't automatic.
SIGNAL_THRESHOLD = float(os.environ.get("FX_SIGNAL_THRESHOLD", "0.53"))


def model_path_for(instrument: str, granularity: str = GRANULARITY):
    return MODEL_DIR / f"{instrument}_{granularity}_model.joblib"


def pip_size_for(instrument: str) -> float:
    """Standard FX convention: pip = 0.01 when the quote currency is JPY
    (USD_JPY, EUR_JPY, GBP_JPY, ...), else 0.0001. Getting this wrong silently
    makes every stop-loss/take-profit/position-size calculation for a JPY
    pair wrong by a factor of 100."""
    return 0.01 if instrument.endswith("_JPY") else 0.0001


def price_precision_for(instrument: str) -> int:
    """Decimal places OANDA expects when quoting a price for this instrument:
    3 for JPY pairs (e.g. 150.123), 5 for everything else (e.g. 1.10234).
    Sending the wrong precision on an order gets it rejected."""
    return 3 if instrument.endswith("_JPY") else 5


# --- Risk management ---
# All of these are env-tunable so "more aggressive" or "more conservative"
# is a .env edit, not a code change. STOP_LOSS_PIPS / TAKE_PROFIT_PIPS /
# MAX_DAILY_LOSS_FRACTION are the actual safety rails (they cap how much a
# single trade or a single day can lose) -- loosen those deliberately, not
# as a side effect of wanting more trade frequency.
RISK_PER_TRADE = float(os.environ.get("FX_RISK_PER_TRADE", "0.01"))  # fraction of balance risked per trade
STOP_LOSS_PIPS = float(os.environ.get("FX_STOP_LOSS_PIPS", "20"))
TAKE_PROFIT_PIPS = float(os.environ.get("FX_TAKE_PROFIT_PIPS", "40"))
MAX_DAILY_LOSS_FRACTION = float(os.environ.get("FX_MAX_DAILY_LOSS_FRACTION", "0.03"))
MAX_POSITIONS_PER_INSTRUMENT = int(os.environ.get("FX_MAX_POSITIONS_PER_INSTRUMENT", "1"))
# total risk across ALL simultaneously open positions, approximated as
# (number of open positions * risk_per_trade) since every position is sized
# to risk the same fraction of balance. Does NOT account for cross-pair
# correlation (e.g. EUR/USD and GBP/USD longs both being USD-exposure bets) --
# a deliberate simplification, not an oversight; see README. Raised from the
# original 5% default to 10% so a lower SIGNAL_THRESHOLD (more qualifying
# signals across the portfolio) can actually act on more of them concurrently
# instead of the old cap throttling it straight back down.
MAX_TOTAL_RISK_FRACTION = float(os.environ.get("FX_MAX_TOTAL_RISK_FRACTION", "0.10"))

# --- Backtest costs (approximate, majors typical -- see pip_size_for for
# the one thing that does vary meaningfully by pair) ---
SPREAD_PIPS = 1.2
SLIPPAGE_PIPS = 0.3

# --- OpenAI (news-blackout + sentiment advisory filters, plain-language
# reports -- see llm/ and news/). These are additive risk filters layered on
# top of the trading bot, not part of the ML model's features: none of them
# are required for model.train / backtest / bot.py's core loop to work. ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
NEWS_BLACKOUT_HOURS = float(os.environ.get("FX_NEWS_BLACKOUT_HOURS", "2"))
SENTIMENT_VETO_THRESHOLD = float(os.environ.get("FX_SENTIMENT_VETO_THRESHOLD", "-0.5"))
SENTIMENT_CACHE_HOURS = float(os.environ.get("FX_SENTIMENT_CACHE_HOURS", "6"))
SENTIMENT_CACHE_PATH = LOG_DIR / "sentiment_cache.json"
