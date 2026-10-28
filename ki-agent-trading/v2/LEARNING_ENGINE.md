# Trading Learning Engine — research-only integration

## Status
This branch adds a pure TypeScript research module. It is not wired into the live dashboard, Supabase Edge Functions, or any order executor. Nothing deploys automatically.

## What is included
- Candle validation for ordered OHLCV data.
- EMA, RSI and ATR calculations.
- A baseline EMA(9/21) + RSI strategy with next-candle-open entry.
- Conservative stop/target collision handling, configurable fees and slippage, no leverage, no overlapping positions, and a drawdown stop.
- Trade-level ledger and metrics: net PnL, win rate, profit factor, fees, average trade and max drawdown.
- Chronological split helper and basic candidate gates for out-of-sample evaluation.
- Read-only historical candle conversion and gap audit in `historical-data-adapter.ts`.
- Persistent machine-readable operating policy in `trading-agent-policy.ts`: virtual balance 10,000 USDT, BTC/ETH/SOL Spot research, 1-minute scan and 5-minute evaluation targets, 0.25% target risk (0.5% hard cap), 10% drawdown ceiling, no leverage/overlapping positions, cost-aware out-of-sample and walk-forward gates, and manual approval before any promotion.
- Draft `supabase/functions/trading-learning-research/index.ts`: allow-listed market/timeframe, paginated read-only candle fetch, closed-candle cutoff, quality gate, research metrics response, and policy returned alongside results; no database writes or orders.

## Safety and limitations
- Research-only; no exchange API, secrets, database writes, or order execution.
- No profitability is asserted. The baseline is a test harness, not a validated edge.
- Input candles must be sorted ascending and contain OHLCV values. Use only closed candles.
- A strategy must be tested on separate time periods and multiple market regimes. Tune only on the training period; evaluate on untouched out-of-sample data; then use walk-forward tests.
- Fee/slippage defaults are illustrative and must be replaced with measured values. Funding, market impact, partial fills and higher-timeframe confirmation are not implemented in this first module.
- The persistent policy is returned by the research endpoint for transparency; this does not mean the existing live dashboard or scanner consumes it yet.
- Do not auto-promote candidates or switch real orders on. Existing 10% drawdown cap and simulation-only controls must remain authoritative.

## Suggested integration sequence
1. The read-only adapter and draft research endpoint now exist on this branch; they still require CI and runtime validation before any deployment.
2. Ensure the history spans multiple years where the venue provides it, with pagination, gap checks, duplicate checks, timezone normalization, and source metadata.
3. Run backtests offline/research-only and save run metadata, configuration, candle range, code version and metrics to a dedicated experiment ledger. Do not overload `learning_notes` with every candle or trade.
4. Compare strategies on identical train/test windows, then run rolling walk-forward evaluation.
5. Paper-trade the candidate and compare expected vs actual fills, fees and slippage.
6. Only after independent review, propose a change for approval. No automatic code modification, deployment, or real-money execution.

## Existing project findings
The current `market-scanner-ingest` Edge Function stores 1m, 3m and 5m candles with a limit of 30 per fetch and emits a simple SMA-based signal. That is not enough history for multi-year testing. The current `agent-self-review` writes unvalidated notes but does not train or validate a model. The current `strategy-evaluator` summarizes recent signals/news; it does not perform a historical backtest. The adapter and endpoint are drafted on the branch but are not deployed or wired into the existing scanner. CI/runtime validation and multi-year data acquisition remain outstanding.

## Acceptance criteria before any deployment
- Unit tests for indicators, OHLC validation, fees, stop/target handling, drawdown guard and split integrity.
- No look-ahead: signals from candle i can enter no earlier than candle i+1.
- Backtest costs include fees and slippage; funding added for perpetuals.
- Independent out-of-sample and walk-forward results are reproducible.
- No secret values in logs; simulation-only remains enforced.
