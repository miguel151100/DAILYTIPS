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
   v20 REST API (needs an account), plus `list_tradeable_instruments()` /
   `resolve_instruments()` for the instrument universe (see "Which currency
   pairs" below). **`data/yfinance_source.py`** is a credential-free
   alternative for historical data (Yahoo Finance, ~730 days of intraday
   history) for any pair (`instrument.replace("_","")+"=X"` — works for
   virtually any OANDA-style pair Yahoo also lists) so you can train/backtest
   before an OANDA account exists — not tick-accurate and not used for live
   prices or order execution, just for getting real (not synthetic) data early.
2. **`features/engineer.py`** — 17 technical features computed with no
   look-ahead: returns, SMA/EMA distance, RSI, rolling volatility, momentum,
   MACD, Bollinger %B and bandwidth, ATR, and FX session flags (Asia/London/
   New York, based on UTC hour — sessions deliberately overlap since the
   London/NY overlap is real and typically the most volatile part of the
   day). `model/predict.py` reuses the exact same function so live inference
   can never silently drift from what the model was trained on.
3. **`model/train.py`** — trains one `HistGradientBoostingClassifier` **per
   currency pair** (`model/saved/{instrument}_{granularity}_model.joblib`) to
   predict whether that pair's price will be higher `LABEL_HORIZON` candles
   ahead, using **walk-forward validation** (`TimeSeriesSplit`), not a random
   split — a random split would leak future data into training and produce
   misleadingly good accuracy on a time series. Also prints a **permutation
   feature importance** report (measured out-of-sample, on the last fold's
   held-out data). `train_all(instruments)` batch-trains every pair in the
   universe, skipping (not aborting on) any pair with too little history.
4. **`backtest/engine.py`** — `run_backtest` replays one pair's walk-forward
   folds, simulating actual trades (spread + slippage cost, stop-loss /
   take-profit against intrabar highs/lows, and the **correct pip size for
   that pair** — JPY-quoted pairs use 0.01, not 0.0001) and reports Sharpe
   ratio, max drawdown, win rate, and profit factor, all out-of-sample.
   `run_portfolio_backtest` does the same across *several* pairs sharing one
   account: it merges every pair's candidate signals into one chronological
   timeline and replays them against a single shared risk manager, so the
   exposure caps below apply across pairs, not per pair in isolation.
   **`backtest/plot.py`** saves either equity curve as a PNG under `logs/`.
5. **`risk/manager.py`** — now portfolio-aware: position sizing (risk a
   fixed % of balance per trade, pip-size-correct per instrument),
   stop-loss/take-profit levels, a **per-instrument cap**
   (`MAX_POSITIONS_PER_INSTRUMENT`, default 1 — don't stack trades on the
   same pair), a **total-exposure cap across all pairs**
   (`MAX_TOTAL_RISK_FRACTION`, default 5%, approximated as
   `open_positions * risk_per_trade`), and the same **daily-loss circuit
   breaker** as before (now portfolio-wide), persisted to
   `logs/risk_state.json` so it survives across separate `bot.py`
   invocations. **Known limitation**: the exposure cap does not account for
   cross-pair correlation — e.g. simultaneous EUR/USD and GBP/USD longs are
   both USD-exposure bets, so the position count overstates real
   diversification. That's a deliberate scope cut, not an oversight.
6. **`bot.py`** — one run = one decision **per configured pair**: loops over
   `data.fetch.resolve_instruments()`, and for each pair with a trained model,
   checks the shared risk manager, runs the two optional OpenAI-powered
   filters below, fetches data, gets a signal, and places an order on the
   practice account if warranted. A pair with no trained model yet is
   skipped silently, so partial rollout (a handful of pairs trained so far)
   works fine. Logs to `logs/trades.csv`.

### Optional: OpenAI-powered filters and reports

Three additions, all **off by default** (skipped if `OPENAI_API_KEY` is
unset) and all **additive, not required** -- training, backtesting, and
trading all work without any of this:

- **`news/calendar.py`** -- pauses new trades on a pair within
  `NEWS_BLACKOUT_HOURS` (default 2h, before *or* after) of a high-impact
  economic release for either of its currencies. **Deliberately does not use
  the LLM**: "is there a high-impact event soon" is answered directly from
  the calendar feed's structured fields in code. Asking a language model to
  interpret that into a decision would add hallucination risk to a safety
  gate for zero benefit.
- **`llm/sentiment.py`** -- scores recent news headlines per currency (via
  GDELT's free API) into a -1..1 sentiment via the OpenAI API, and vetoes a
  trade if sentiment meaningfully opposes the model's direction
  (`SENTIMENT_VETO_THRESHOLD`, default -0.5). Cached per currency for
  `SENTIMENT_CACHE_HOURS` (default 6h) so a run across dozens of pairs
  doesn't fire dozens of OpenAI calls.
- **`report.py`** -- reads `logs/trades.csv` and asks the OpenAI API to turn
  the (code-computed, never LLM-guessed) counts into a plain-language
  paragraph, saved to `logs/report_{date}.txt`. Describes *activity*
  (what was opened, where), not *performance* -- there's no realized P&L
  reconciliation against OANDA's closed-trade history here.

**Why these are advisory filters, not model features**: adding sentiment as
an 18th input to `features/engineer.py` would require retraining every
per-pair model, and there's no free historical news archive to validate it
out-of-sample the way the 17 technical features were. Keeping it as a live
pre-trade check sidesteps both problems and leaves the tested model
untouched.

**Fail-open by design**: if the calendar feed or an OpenAI call errors out,
`bot.py` logs it and trades anyway rather than blocking indefinitely on a
flaky free third-party feed. The real safety net -- stop-loss, the daily
circuit breaker, the exposure caps -- doesn't depend on either filter.

**Unverified from this environment**: `api.openai.com`, the ForexFactory-style
calendar feed, and GDELT are all blocked by this sandbox's network policy
(confirmed 403s), the same situation as Yahoo Finance above. All three are
built with dependency-injectable clients and tested against mocks (see
`tests/test_calendar.py`, `tests/test_sentiment.py`,
`tests/test_openai_client.py`, `tests/test_report.py`) -- but the exact live
response schemas haven't been confirmed against the real APIs from here.
Verify connectivity and field names from your own machine before relying on
this live.

### Which currency pairs?

"Every currency in the world" isn't something any retail broker actually
offers — most of the ~180 ISO currencies aren't freely convertible or have no
liquid retail FX market. What this bot supports is **every currency pair
OANDA itself lists** (`data.fetch.list_tradeable_instruments()`, filtered to
`type=="CURRENCY"` on your account — typically ~68-70 pairs: majors, minors,
and a good number of exotics), fetched dynamically so it stays current
automatically. Set `FX_INSTRUMENTS=EUR_USD,GBP_JPY,USD_MXN` (comma-separated)
to restrict to a specific subset instead — useful while you're still
training/validating a handful of pairs rather than committing to all of them
at once.

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
4. Optional, only for the news-blackout/sentiment filters and `report.py`:
   add `OPENAI_API_KEY=your-key` to `.env`. Skip this and everything else
   still works.

## Usage

### Before you have an OANDA account: train/backtest on real data via Yahoo Finance

```bash
.venv/bin/python -c "
from data.yfinance_source import fetch_candles
from model.train import run
run(fetch_candles('EUR_USD'), 'EUR_USD')
"
```
Swap `'EUR_USD'` for any pair (`'GBP_JPY'`, `'USD_MXN'`, ...). This trains on
real price history with no signup required and prints walk-forward accuracy
plus a feature importance report — use it to sanity check the whole approach
before ever touching OANDA.

### Once you have OANDA credentials

Train one pair and see walk-forward accuracy + feature importance:
```bash
.venv/bin/python -m model.train EUR_USD
```

Train every pair in your configured universe (`FX_INSTRUMENTS`, or every pair
OANDA offers if unset) — continues past any pair with too little history
rather than aborting the whole batch:
```bash
.venv/bin/python -m model.train --all
```

Backtest one pair, or the whole portfolio sharing one account's exposure
caps, saving an equity curve PNG under `logs/` either way:
```bash
.venv/bin/python -m backtest.engine EUR_USD
.venv/bin/python -m backtest.engine --all
```

Run the bot once (loops over every pair with a trained model; requires valid
`.env`):
```bash
.venv/bin/python bot.py
```

`bot.py` makes one decision per invocation, per pair — it is **not** a
long-running process. Schedule it to run once per candle close via cron,
matching `config.GRANULARITY` (default `H1`, i.e. hourly):
```cron
0 * * * *  cd /path/to/fx-ai-trader && .venv/bin/python bot.py >> logs/bot.log 2>&1
```

Generate a plain-language summary of `logs/trades.csv` (requires
`OPENAI_API_KEY`):
```bash
.venv/bin/python report.py
```

Run tests:
```bash
.venv/bin/python -m pytest tests/ -q
```

## Configuration

All tunables (timeframe, risk-per-trade, stop-loss/take-profit pip distances,
daily loss limit, total-exposure cap, signal confidence threshold) live in
`config.py`, overridable via environment variables (see `.env.example`) —
see that file's comments for details. `FX_INSTRUMENTS` (comma-separated)
restricts the pair universe; pip size and price precision are computed
per-instrument automatically (`config.pip_size_for`, `config.price_precision_for`)
rather than configured.

### How aggressively it trades

`FX_SIGNAL_THRESHOLD` (default `0.53`) is the main dial: the minimum
predicted probability, either direction, before the bot acts. Lower it and
the bot trades more often, on weaker signals -- **that is not the same as
trading more profitably.** On synthetic no-edge data, dropping the threshold
from 0.58 to 0.51 raised trade count ~47% while total return got *worse*
(-86.8% → -92.4%): more trades just means paying the spread more often when
there's no real edge behind the extra signals.

```bash
# empirically compare thresholds on your own (real) data before picking one
.venv/bin/python -c "
from data.fetch import fetch_candles
from backtest.engine import run_backtest
candles = fetch_candles(instrument='EUR_USD', count=5000)
for t in (0.51, 0.53, 0.55, 0.58):
    r = run_backtest(candles, instrument='EUR_USD', threshold=t)
    print(f'threshold={t}: n_trades={r[\"n_trades\"]} total_return={r[\"total_return\"]*100:.1f}%')
"
```

`FX_MAX_TOTAL_RISK_FRACTION` (default `0.10`) caps how much of the account
can be at risk across all simultaneously open positions -- raised alongside
the lower threshold so more qualifying signals can actually be acted on
instead of the old, tighter cap throttling them straight back down.
`FX_MAX_DAILY_LOSS_FRACTION` and the stop-loss/take-profit pip distances are
the actual safety rails; loosen those deliberately; they aren't meant to
move just because you want more trade frequency.
