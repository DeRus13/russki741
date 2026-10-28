# Historical data readiness audit

Audit date: 2026-10-28 (read-only query of Supabase `ai_agents.market_candles`).

## Observed coverage

| Market | Timeframe | Rows | First candle (UTC) | Last candle (UTC) |
|---|---:|---:|---|---|
| BTCUSDT | 1m | 15,078 | 2026-10-17 21:14 | 2026-10-28 08:38 |
| BTCUSDT | 3m | 5,048 | 2026-10-17 20:15 | 2026-10-28 08:36 |
| BTCUSDT | 5m | 3,041 | 2026-10-17 19:15 | 2026-10-28 08:35 |
| ETHUSDT | 1m | 15,079 | 2026-10-17 21:14 | 2026-10-28 08:39 |
| ETHUSDT | 3m | 5,049 | 2026-10-17 20:15 | 2026-10-28 08:39 |
| ETHUSDT | 5m | 3,041 | 2026-10-17 19:15 | 2026-10-28 08:35 |
| SOLUSDT | 1m | 15,079 | 2026-10-17 21:14 | 2026-10-28 08:39 |
| SOLUSDT | 3m | 5,049 | 2026-10-17 20:15 | 2026-10-28 08:39 |
| SOLUSDT | 5m | 3,041 | 2026-10-17 19:15 | 2026-10-28 08:35 |

No null OHLC fields were reported in the inspected groups.

## Conclusion

The currently stored dataset spans about 10–11 days, not multiple years. It is suitable for checking the ingestion pipeline and basic smoke tests, but not for claiming a durable strategy edge, market-regime robustness, or reliable out-of-sample profitability.

## Required before any strategy promotion

1. Acquire multi-year OHLCV history from a documented source and preserve the source/time zone.
2. Audit duplicate timestamps, missing intervals, candle continuity, zero/invalid prices, and exchange maintenance gaps.
3. Use chronological train/validation/test periods and walk-forward evaluation; do not shuffle time-series data.
4. Model measured trading fees, spread, slippage, funding (where applicable), and gap risk.
5. Compare against simple baselines and report net returns, trade count, profit factor, and drawdown including open-position mark-to-market.
6. Run paper trading and require a human review. A positive backtest is not a guarantee of future returns.

## Safety status

This audit was read-only. No database rows, schema, edge functions, risk settings, or live trading settings were changed. No orders were placed.
