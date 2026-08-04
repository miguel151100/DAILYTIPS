# fx-ai-trader

An ML-based FX trading bot: technical features → gradient-boosted classifier
→ risk-managed order placement on an **OANDA practice (demo) account**.

## ⚠️ Read this before running anything

- **No system, with or without AI, can guarantee trading profits.** Forex is
  a zero/negative-sum game after spread and commissions. Retail traders pay
  the bid-ask spread; they don't collect it (that's the broker's business,
  not this bot's).
- This project defaults to and is validated only against OANDA's **practice**
  (paper trading) environment. `execution/oanda_client.py` actively refuses
  to place orders against a live account unless you explicitly set
  `CONFIRM_LIVE_TRADING=I_UNDERSTAND_THE_RISK` — and even then, nothing here
  has been validated for real money.
- Always look at `python -m backtest.engine` results before trusting
  `bot.py` with even a demo account. A model that doesn't beat costs
  out-of-sample in backtesting won't magically do better live.

## How it works

1. **`data/fetch.py`** — historical candles and live prices from the OANDA
   v20 REST API (needs an account). **`data/yfinance_source.py`** is a
   credential-free alternative for historical data (Yahoo Finance, ~730 days
   of intraday history) so you can train/backtest before an OANDA account
   exists — not tick-accurate and not used for live prices or order
   execution, just for getting real (not synthetic) data early.
2. **`features/engineer.py`** — 17 technical features computed with no
   look-ahead: returns, SMA/EMA distance, RSI, rolling volatility, momentum,
   MACD, Bollinger %B and bandwidth, ATR, and FX session flags (Asia/London/
   New York, based on UTC hour — sessions deliberately overlap since the
   London/NY overlap is real and typically the most volatile part of the
   day). `model/predict.py` reuses the exact same function so live inference
   can never silently drift from what the model was trained on.
3. **`model/train.py`** — trains a `HistGradientBoostingClassifier` to
   predict whether price will be higher `LABEL_HORIZON` candles ahead, using
   **walk-forward validation** (`TimeSeriesSplit`), not a random split — a
   random split would leak future data into training and produce
   misleadingly good accuracy on a time series. Also prints a **permutation
   feature importance** report (measured out-of-sample, on the last fold's
   held-out data) so you can see what the model actually relies on, rather
   than trusting it blindly.
4. **`backtest/engine.py`** — replays the same walk-forward folds, but
   simulates actual trades (with spread + slippage cost, stop-loss /
   take-profit against intrabar highs/lows) and reports Sharpe ratio, max
   drawdown, win rate, and profit factor — all strictly out-of-sample.
   **`backtest/plot.py`** saves the equity curve as a PNG
   (`logs/equity_curve.png`) so you can see the trajectory, not just the
   summary numbers.
5. **`risk/manager.py`** — position sizing (risk a fixed % of balance per
   trade), stop-loss/take-profit levels, and a **daily-loss circuit
   breaker** that halts new trades for the rest of the day once losses
   exceed `MAX_DAILY_LOSS_FRACTION`. Its state is persisted to
   `logs/risk_state.json` so the breaker survives across separate `bot.py`
   invocations (see below).
6. **`bot.py`** — one run = one decision at a candle close: fetch data →
   signal → risk check → order on the practice account → log to
   `logs/trades.csv`.

A GitHub Actions workflow (`.github/workflows/fx-ai-trader-tests.yml` at the
repo root) runs the full test suite on every push or PR touching this
folder.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

1. Create a free OANDA **practice** account: https://www.oanda.com/
2. Generate a personal access token (My Account → Manage API Access).
3. Fill in `.env`:
   ```
   OANDA_API_TOKEN=your-token
   OANDA_ACCOUNT_ID=your-practice-account-id
   OANDA_ENV=practice
   ```

## Usage

### Before you have an OANDA account: train/backtest on real data via Yahoo Finance

```bash
.venv/bin/python -c "
from data.yfinance_source import fetch_candles
from model.train import run
run(fetch_candles())
"
```
This trains on real EUR/USD price history with no signup required. Prints
walk-forward accuracy and a feature importance report. Use this to sanity
check the whole approach before ever touching OANDA.

### Once you have OANDA credentials

Train the model on historical data and see walk-forward accuracy + feature
importance:
```bash
.venv/bin/python -m model.train
```

Run the out-of-sample backtest (do this before ever running `bot.py`) and
save an equity curve chart to `logs/equity_curve.png`:
```bash
.venv/bin/python -m backtest.engine
```

Run the bot once (requires a trained model and valid `.env`):
```bash
.venv/bin/python bot.py
```

`bot.py` makes one decision per invocation — it is **not** a long-running
process. Schedule it to run once per candle close via cron, matching
`config.GRANULARITY` (default `H1`, i.e. hourly):
```cron
0 * * * *  cd /path/to/fx-ai-trader && .venv/bin/python bot.py >> logs/bot.log 2>&1
```

Run tests:
```bash
.venv/bin/python -m pytest tests/ -q
```

## Configuration

All tunables (instrument, timeframe, risk-per-trade, stop-loss/take-profit
pip distances, daily loss limit, signal confidence threshold) live in
`config.py`, overridable via environment variables — see that file for
details.
