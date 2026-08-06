# fx-ai-trader

An ML-based crypto futures trading bot: technical features → gradient-boosted
classifier → risk-managed order placement on **Binance Futures testnet**
(paper trading, no real money).

> This project traded forex via OANDA earlier on; it has since been fully
> migrated to Binance USDT-M Futures. The directory name is a leftover from
> that history, kept as-is to avoid churning CI paths and already-saved model
> files for no functional benefit.

## ⚠️ Read this before running anything

- **No system, with or without AI, can guarantee trading profits.** Crypto
  futures are a zero/negative-sum game after fees and funding. Retail traders
  pay the bid-ask spread and taker fees; they don't collect them.
- This project defaults to and is validated only against Binance's
  **testnet**. `execution/binance_client.py` actively refuses to place
  orders against a live account unless you explicitly set
  `CONFIRM_LIVE_TRADING=I_UNDERSTAND_THE_RISK` — and even then, nothing here
  has been validated for real money.
- **Leverage introduces liquidation risk that a simple stop-loss doesn't
  fully protect against**: at high leverage, the exchange can force-close a
  position before your own stop-loss order even triggers. Defaults here are
  deliberately conservative (`BINANCE_LEVERAGE=2`, `BINANCE_MARGIN_TYPE=ISOLATED`)
  — see "Leverage and liquidation" below before changing them.
- Always look at `python -m backtest.engine` results before trusting
  `bot.py` with even a testnet account. A model that doesn't beat costs
  out-of-sample in backtesting won't magically do better live.

## How it works

1. **`data/fetch.py`** — historical candles, live prices, and the tradeable
   symbol universe, all from Binance's **public** Futures endpoints
   (`/fapi/v1/klines`, `/fapi/v1/ticker/bookTicker`, `/fapi/v1/exchangeInfo`).
   Unlike the old OANDA integration, **none of this needs an API key** —
   only account state and order placement do — so you can train and
   backtest on real market data before you even have testnet credentials.
2. **`features/engineer.py`** — 17 technical features computed with no
   look-ahead: returns, SMA/EMA distance, RSI, rolling volatility, momentum,
   MACD, Bollinger %B and bandwidth, ATR, and session flags (Asia/London/New
   York, based on UTC hour — crypto trades 24/7, but these still capture
   real liquidity/volatility patterns tied to when major markets are open).
   `model/predict.py` reuses the exact same function so live inference can
   never silently drift from what the model was trained on.
3. **`model/train.py`** — trains one `HistGradientBoostingClassifier` **per
   symbol** (`model/saved/{symbol}_{interval}_model.joblib`) to predict
   whether that symbol's price will be higher `LABEL_HORIZON` candles ahead,
   using **walk-forward validation** (`TimeSeriesSplit`), not a random split
   — a random split would leak future data into training and produce
   misleadingly good accuracy on a time series. Also prints a **permutation
   feature importance** report (measured out-of-sample, on the last fold's
   held-out data). `train_all(symbols)` batch-trains every symbol in the
   universe, skipping (not aborting on) any symbol with too little history.
4. **`backtest/engine.py`** — `run_backtest` replays one symbol's
   walk-forward folds, simulating actual trades (taker fee + slippage cost,
   stop-loss/take-profit against intrabar highs/lows, all **percent of
   entry price** — see "Percent, not pips" below) and reports Sharpe ratio,
   max drawdown, win rate, and profit factor, all out-of-sample.
   `run_portfolio_backtest` does the same across *several* symbols sharing
   one account: it merges every symbol's candidate signals into one
   chronological timeline and replays them against a single shared risk
   manager, so the exposure caps below apply across symbols, not per symbol
   in isolation. `_periods_per_year` assumes crypto's 24/7/365 market, not
   forex's ~5-day trading week. **`backtest/plot.py`** saves either equity
   curve as a PNG under `logs/`.
5. **`risk/manager.py`** — portfolio-aware: position sizing (risk a fixed %
   of balance per trade), stop-loss/take-profit as a **percentage of entry
   price**, a **per-symbol cap** (`MAX_POSITIONS_PER_INSTRUMENT`, default 1
   — don't stack trades on the same symbol), a **total-exposure cap across
   all symbols** (`MAX_TOTAL_RISK_FRACTION`, default 10%, approximated as
   `open_positions * risk_per_trade`), and a **daily-loss circuit breaker**,
   persisted to `logs/risk_state.json` so it survives across separate
   `bot.py` invocations. **Known limitation**: the exposure cap does not
   account for cross-symbol correlation — e.g. simultaneous BTCUSDT and
   ETHUSDT longs are both "crypto market up" bets, so the position count
   overstates real diversification. That's a deliberate scope cut, not an
   oversight.
6. **`execution/binance_client.py`** — HMAC-SHA256 request signing, per-symbol
   price/quantity rounding sourced from the exchange's real tick size and
   lot step (`/fapi/v1/exchangeInfo`, not a guessed convention), leverage and
   margin-type setup, and `place_market_order_with_brackets`: unlike OANDA's
   single atomic call, Binance Futures needs three separate orders (market
   entry, `STOP_MARKET` stop-loss, `TAKE_PROFIT_MARKET` take-profit) — this
   function performs all three so the rest of the codebase sees one
   operation.
7. **`bot.py`** — one run = one decision **per configured symbol**: loops
   over `data.fetch.resolve_symbols()`, and for each symbol with a trained
   model, checks the shared risk manager, runs the two optional
   OpenAI-powered filters below, fetches data, gets a signal, and places a
   bracket order on the testnet account if warranted. A symbol with no
   trained model yet is skipped silently, so partial rollout (a handful of
   symbols trained so far) works fine. Logs to `logs/trades.csv`.

### Percent, not pips

Forex has a fixed "pip" convention; crypto doesn't, because prices span
orders of magnitude (BTC ~$60,000, a small-cap token ~$0.002). Stop-loss and
take-profit distances here are **percent of entry price**
(`STOP_LOSS_PERCENT`, `TAKE_PROFIT_PERCENT`) instead — this also made
`risk/manager.py` simpler than its forex predecessor, since there's no more
per-symbol lookup needed for distance math (only for *rounding* an order to
the exchange's tick size, which lives in `execution/binance_client.py`,
sourced from the real exchange, not a guessed naming convention).

### Leverage and liquidation

Futures introduces a risk forex, as built here, never had: at high leverage,
the exchange can force-close ("liquidate") a losing position before your own
stop-loss order even triggers, at a worse price and with extra fees.
Defaults are deliberately conservative:

- `BINANCE_LEVERAGE=2` — keeps the liquidation price far from any reasonable
  stop-loss percentage.
- `BINANCE_MARGIN_TYPE=ISOLATED` — a losing position can only lose its own
  allocated margin, not the whole account balance (vs. `CROSSED`).

Raise these deliberately, with the liquidation-vs-stop-loss math re-checked
for your leverage, not as a side effect of wanting bigger positions.

### Optional: OpenAI-powered filters and reports

Three additions, all **off by default** (skipped if `OPENAI_API_KEY` is
unset) and all **additive, not required** — training, backtesting, and
trading all work without any of this:

- **`news/calendar.py`** — pauses new trades on a symbol within
  `NEWS_BLACKOUT_HOURS` (default 2h, before *or* after) of a high-impact
  economic release for its quote currency (USDT/BUSD/USDC map to "USD" —
  Fed/CPI news is exactly what's relevant to a USDT-margined position).
  **Deliberately does not use the LLM**: "is there a high-impact event soon"
  is answered directly from the calendar feed's structured fields in code.
  Asking a language model to interpret that into a decision would add
  hallucination risk to a safety gate for zero benefit.
- **`llm/sentiment.py`** — scores recent news headlines per asset (base
  crypto asset and quote currency, via GDELT's free API) into a -1..1
  sentiment via the OpenAI API, and vetoes a trade if sentiment meaningfully
  opposes the model's direction (`SENTIMENT_VETO_THRESHOLD`, default -0.5).
  Cached per asset for `SENTIMENT_CACHE_HOURS` (default 6h) so a run across
  dozens of symbols doesn't fire dozens of OpenAI calls.
- **`report.py`** — reads `logs/trades.csv` and asks the OpenAI API to turn
  the (code-computed, never LLM-guessed) counts into a plain-language
  paragraph, saved to `logs/report_{date}.txt`. Describes *activity* (what
  was opened, where), not *performance* — there's no realized P&L
  reconciliation against Binance's closed-trade history here.

**Why these are advisory filters, not model features**: adding sentiment as
an 18th input to `features/engineer.py` would require retraining every
per-symbol model, and there's no free historical news archive to validate it
out-of-sample the way the 17 technical features were. Keeping it as a live
pre-trade check sidesteps both problems and leaves the tested model
untouched.

**Fail-open by design**: if the calendar feed or an OpenAI call errors out,
`bot.py` logs it and trades anyway rather than blocking indefinitely on a
flaky free third-party feed. The real safety net — stop-loss, the daily
circuit breaker, the exposure caps — doesn't depend on either filter.

**Unverified from this environment**: `testnet.binancefuture.com`,
`fapi.binance.com`, `api.openai.com`, the ForexFactory-style calendar feed,
and GDELT are all blocked by this sandbox's network policy (confirmed
403s). Everything here is built with dependency-injectable clients and
tested against mocks (see `tests/test_binance_client.py`,
`tests/test_calendar.py`, `tests/test_sentiment.py`,
`tests/test_openai_client.py`, `tests/test_report.py`,
`tests/test_bot_integration.py`) — but the exact live response schemas and
HMAC signing behavior haven't been confirmed against the real APIs from
here. Verify connectivity and field names from your own machine before
relying on this live.

### Which symbols?

Every **USDT-margined perpetual futures** symbol Binance currently lists and
has trading enabled (`data.fetch.list_tradeable_symbols()`, filtered to
`status=="TRADING"`, `contractType=="PERPETUAL"`, `quoteAsset=="USDT"` —
this excludes COIN-margined and dated/quarterly contracts, kept out for
complexity, not because they're unsupported in principle), fetched
dynamically so it stays current automatically. Set
`BINANCE_SYMBOLS=BTCUSDT,ETHUSDT,SOLUSDT` (comma-separated) to restrict to a
specific subset instead — useful while you're still training/validating a
handful of symbols rather than committing to all of them at once.

A GitHub Actions workflow (`.github/workflows/fx-ai-trader-tests.yml` at the
repo root) runs the full test suite on every push or PR touching this
folder.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

1. Create a free Binance **Futures testnet** account:
   https://testnet.binancefuture.com — usually via "log in with GitHub", no
   separate signup. **Not** `testnet.binance.vision` — that's the separate
   Spot testnet, with its own incompatible keys.
2. Generate an HMAC-SHA-256 API key/secret from the testnet site.
3. Fill in `.env`:
   ```
   BINANCE_API_KEY=your-key
   BINANCE_API_SECRET=your-secret
   BINANCE_ENV=testnet
   ```
4. Optional, only for the news-blackout/sentiment filters and `report.py`:
   add `OPENAI_API_KEY=your-key` to `.env`. Skip this and everything else
   still works.

## Usage

### Menú interactivo en español

Si no quieres escribir comandos, corre esto y elige opciones de una lista
(entrenar, backtest, reporte, bot) — todo el texto y las interpretaciones
de resultados están en español:
```bash
.venv/bin/python menu.py
```
Es solo una envoltura sobre los comandos de abajo; no cambia ninguna lógica
de trading.

### Before you have testnet credentials: train/backtest on real data

Binance's market-data endpoints need no API key at all, so this works
immediately:
```bash
.venv/bin/python -m model.train BTCUSDT
.venv/bin/python -m backtest.engine BTCUSDT
```
Swap `BTCUSDT` for any symbol (`ETHUSDT`, `SOLUSDT`, ...). Prints
walk-forward accuracy, a feature importance report, and out-of-sample
backtest metrics — use this to sanity check the whole approach before ever
touching your testnet account (which is only needed for `bot.py` itself,
i.e. placing real testnet orders).

### Batch training and portfolio backtesting

Train every symbol in your configured universe (`BINANCE_SYMBOLS`, or every
USDT perpetual Binance offers if unset) — continues past any symbol with too
little history rather than aborting the whole batch:
```bash
.venv/bin/python -m model.train --all
```

Backtest the whole portfolio sharing one account's exposure caps, saving an
equity curve PNG under `logs/`:
```bash
.venv/bin/python -m backtest.engine --all
```

### Running the bot (requires testnet credentials)

```bash
.venv/bin/python bot.py
```

`bot.py` makes one decision per invocation, per symbol — it is **not** a
long-running process. Schedule it to run once per candle close via cron,
matching `config.BINANCE_INTERVAL` (default `1h`):
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

All tunables (interval, risk-per-trade, stop-loss/take-profit percentages,
daily loss limit, total-exposure cap, signal confidence threshold, leverage,
margin type) live in `config.py`, overridable via environment variables (see
`.env.example`) — see that file's comments for details. `BINANCE_SYMBOLS`
(comma-separated) restricts the symbol universe; price/quantity precision is
read from the exchange automatically (`execution.binance_client.get_symbol_info`)
rather than configured.

### How aggressively it trades

`SIGNAL_THRESHOLD` (default `0.53`) is the main dial: the minimum predicted
probability, either direction, before the bot acts. Lower it and the bot
trades more often, on weaker signals — **that is not the same as trading
more profitably.** On synthetic no-edge data, a lower threshold raised trade
count while total return got *worse*, not better: more trades just means
paying fees more often when there's no real edge behind the extra signals.

```bash
# empirically compare thresholds on your own (real) data before picking one
.venv/bin/python -c "
from data.fetch import fetch_candles
from backtest.engine import run_backtest
candles = fetch_candles(symbol='BTCUSDT', count=1500)
for t in (0.51, 0.53, 0.55, 0.58):
    r = run_backtest(candles, symbol='BTCUSDT', threshold=t)
    print(f'threshold={t}: n_trades={r[\"n_trades\"]} total_return={r[\"total_return\"]*100:.1f}%')
"
```

`MAX_TOTAL_RISK_FRACTION` (default `0.10`) caps how much of the account can
be at risk across all simultaneously open positions. `MAX_DAILY_LOSS_FRACTION`,
`STOP_LOSS_PERCENT`, `BINANCE_LEVERAGE`, and `BINANCE_MARGIN_TYPE` are the
actual safety rails; loosen those deliberately — they aren't meant to move
just because you want more trade frequency.
