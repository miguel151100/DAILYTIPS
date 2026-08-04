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

# --- Instrument / timeframe ---
INSTRUMENT = os.environ.get("FX_INSTRUMENT", "EUR_USD")
GRANULARITY = os.environ.get("FX_GRANULARITY", "H1")  # OANDA candle granularity
LABEL_HORIZON = 4  # predict direction N candles ahead

# --- Model ---
MODEL_PATH = MODEL_DIR / f"{INSTRUMENT}_{GRANULARITY}_model.joblib"
SIGNAL_THRESHOLD = 0.58  # min predicted probability (either direction) to act on a signal

# --- Risk management ---
RISK_PER_TRADE = 0.01       # fraction of account balance risked per trade
STOP_LOSS_PIPS = 20
TAKE_PROFIT_PIPS = 40
MAX_DAILY_LOSS_FRACTION = 0.03  # circuit breaker: stop trading for the day past this drawdown
MAX_OPEN_POSITIONS = 1

# --- Backtest costs (approximate, EUR_USD typical) ---
SPREAD_PIPS = 1.2
SLIPPAGE_PIPS = 0.3
PIP_SIZE = 0.0001
