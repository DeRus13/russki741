# Free historical OHLCV acquisition

The script `backfill-bybit-history.ts` downloads public Bybit Spot candles for BTCUSDT, ETHUSDT and SOLUSDT at 1m, 3m and 5m intervals. It is intended for research data acquisition only.

## Run

From the repository root on a machine with Deno 2 installed:

```sh
deno run --allow-net=api.bybit.com --allow-write=./data/bybit-history ki-agent-trading/v2/backfill-bybit-history.ts --years=3
```

Optional arguments:
- `--years=1` through `--years=5` (default: 3)
- `--out=./path` (default: `./data/bybit-history`)

It writes one chronological NDJSON file per symbol/timeframe. Each row records the UTC timestamp, OHLCV values, turnover and source. The exporter pages backwards, retries transient/rate-limit responses, deduplicates by candle timestamp and prints row counts, coverage, detected interval gaps and invalid-row counts.

## Safety and limits

- Public market data only; no API key is required.
- No Supabase connection, database writes, strategy execution or orders.
- Does not interpolate missing candles or hide gaps.
- It exports Spot data. Do not treat it as derivatives data or assume it includes funding rates.
- The full 3-year 1-minute dataset is large. Download and inspect one symbol/timeframe first if bandwidth or storage is limited.
- This code has been added to the draft branch and CI type-checking; do not treat it as production-validated until CI succeeds and a small live download has been independently checked.
- Before a database import or any live deployment, separately approve the target database, deduplication/upsert behavior, retention and storage budget.
