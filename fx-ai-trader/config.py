"""Central configuration for the crypto futures trading bot."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model" / "saved"
LOG_DIR = BASE_DIR / "logs"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

# --- Binance Futures API ---
BINANCE_API_KEY = os.environ.get("BINANCE_API_KEY", "")
BINANCE_API_SECRET = os.environ.get("BINANCE_API_SECRET", "")
BINANCE_ENV = os.environ.get("BINANCE_ENV", "testnet")  # "testnet" or "live" -- never default to live
BINANCE_HOSTS = {
    "testnet": "https://testnet.binancefuture.com",
    "live": "https://fapi.binance.com",
}
BINANCE_BASE_URL = BINANCE_HOSTS[BINANCE_ENV]

# --- Symbol universe / timeframe ---
# BINANCE_SYMBOLS: optional comma-separated override (e.g. "BTCUSDT,ETHUSDT").
# Left unset, data.fetch.resolve_symbols() uses every USDT-margined perpetual
# Binance itself lists -- read there (not here) to avoid a circular import.
BINANCE_INTERVAL = os.environ.get("BINANCE_INTERVAL", "1h")  # Binance kline interval
LABEL_HORIZON = 4  # predict direction N candles ahead

# --- Model ---
# min predicted probability (either direction) to act on a signal. Lower =
# trades more often, on weaker signals -- NOT the same as "wins more often".
# On synthetic no-edge data, dropping this raised trade count while total
# return got worse, not better: more trades just means paying fees more
# often when there is no real edge behind the extra signals. Re-run that
# same comparison (backtest.engine with different `threshold` values)
# against real data before trusting a lowered default.
SIGNAL_THRESHOLD = float(os.environ.get("SIGNAL_THRESHOLD", "0.53"))


def model_path_for(symbol: str, interval: str = BINANCE_INTERVAL):
    return MODEL_DIR / f"{symbol}_{interval}_model.joblib"


# --- Risk management ---
# All of these are env-tunable so "more aggressive" or "more conservative"
# is a .env edit, not a code change. STOP_LOSS_PERCENT / TAKE_PROFIT_PERCENT /
# MAX_DAILY_LOSS_FRACTION are the actual safety rails (they cap how much a
# single trade or a single day can lose) -- loosen those deliberately, not
# as a side effect of wanting more trade frequency.
#
# Percent-of-entry-price, not pips: crypto prices span orders of magnitude
# (BTC ~$60,000, a small-cap token ~$0.002) so a fixed price distance like
# forex's "pip" doesn't generalize -- a percentage does.
RISK_PER_TRADE = float(os.environ.get("RISK_PER_TRADE", "0.01"))  # fraction of balance risked per trade
STOP_LOSS_PERCENT = float(os.environ.get("STOP_LOSS_PERCENT", "0.015"))   # 1.5%
TAKE_PROFIT_PERCENT = float(os.environ.get("TAKE_PROFIT_PERCENT", "0.03"))  # 3%
MAX_DAILY_LOSS_FRACTION = float(os.environ.get("MAX_DAILY_LOSS_FRACTION", "0.03"))
MAX_POSITIONS_PER_INSTRUMENT = int(os.environ.get("MAX_POSITIONS_PER_INSTRUMENT", "1"))
# total risk across ALL simultaneously open positions, approximated as
# (number of open positions * risk_per_trade) since every position is sized
# to risk the same fraction of balance. Does NOT account for cross-symbol
# correlation (e.g. BTCUSDT and ETHUSDT longs both being "crypto market up"
# bets) -- a deliberate simplification, not an oversight; see README.
MAX_TOTAL_RISK_FRACTION = float(os.environ.get("MAX_TOTAL_RISK_FRACTION", "0.10"))

# --- Leverage / margin (futures-specific -- forex, as built here, never had
# a liquidation mechanism to worry about; futures does). Low leverage keeps
# the liquidation price far from any reasonable stop-loss, and ISOLATED
# margin means a losing position can only lose its own allocated margin, not
# the whole account. Raise these deliberately, not by accident. ---
BINANCE_LEVERAGE = int(os.environ.get("BINANCE_LEVERAGE", "2"))
BINANCE_MARGIN_TYPE = os.environ.get("BINANCE_MARGIN_TYPE", "ISOLATED")  # "ISOLATED" or "CROSSED"

# --- Backtest costs (Binance Futures taker fee + assumed slippage, both as
# a fraction of price -- see STOP_LOSS_PERCENT above for why percent-based) ---
TAKER_FEE_PERCENT = float(os.environ.get("TAKER_FEE_PERCENT", "0.0004"))  # 0.04%, standard tier
SLIPPAGE_PERCENT = float(os.environ.get("SLIPPAGE_PERCENT", "0.0005"))    # 0.05%

# --- OpenAI (news-blackout + sentiment advisory filters, plain-language
# reports -- see llm/ and news/). These are additive risk filters layered on
# top of the trading bot, not part of the ML model's features: none of them
# are required for model.train / backtest / bot.py's core loop to work. ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
NEWS_BLACKOUT_HOURS = float(os.environ.get("NEWS_BLACKOUT_HOURS", "2"))
SENTIMENT_VETO_THRESHOLD = float(os.environ.get("SENTIMENT_VETO_THRESHOLD", "-0.5"))
SENTIMENT_CACHE_HOURS = float(os.environ.get("SENTIMENT_CACHE_HOURS", "6"))
SENTIMENT_CACHE_PATH = LOG_DIR / "sentiment_cache.json"
