/**
 * Free public Bybit Spot historical OHLCV backfill exporter.
 *
 * This script only downloads public market data and writes local NDJSON files.
 * It never connects to Supabase and never places orders.
 *
 * Run from repository root with Deno:
 *   deno run --allow-net=api.bybit.com --allow-write=./data/bybit-history \
 *     ki-agent-trading/v2/backfill-bybit-history.ts --years=3
 *
 * The exporter intentionally does not silently fill missing intervals. Audit
 * the exported files before importing them into any database.
 */
type BybitKline = [string, string, string, string, string, string, string];

type ApiResponse = {
  retCode: number;
  retMsg: string;
  result?: { list?: BybitKline[] };
};

const BASE_URL = "https://api.bybit.com/v5/market/kline";
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;
const TIMEFRAMES = [
  { label: "1m", interval: "1", ms: 60_000 },
  { label: "3m", interval: "3", ms: 180_000 },
  { label: "5m", interval: "5", ms: 300_000 },
] as const;
const PAGE_LIMIT = 1000;
const DAY_MS = 86_400_000;

function argValue(prefix: string): string | undefined {
  return Deno.args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseYears(): number {
  const raw = argValue("--years=");
  const years = raw === undefined ? 3 : Number(raw);
  if (!Number.isInteger(years) || years < 1 || years > 5) {
    throw new Error("--years must be an integer from 1 to 5");
  }
  return years;
}

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

async function fetchPage(
  symbol: string,
  interval: string,
  start: number,
  end: number,
): Promise<BybitKline[]> {
  const url = new URL(BASE_URL);
  url.search = new URLSearchParams({
    category: "spot",
    symbol,
    interval,
    start: String(start),
    end: String(end),
    limit: String(PAGE_LIMIT),
  }).toString();

  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "research-only-historical-exporter/1.0" },
      });
      if (response.status === 429 || response.status >= 500) {
        await response.body?.cancel();
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        continue;
      }
      if (!response.ok) {
        throw new Error(`Bybit HTTP ${response.status} for ${symbol}/${interval}`);
      }
      const body = await response.json() as ApiResponse;
      if (body.retCode !== 0) {
        throw new Error(`Bybit API ${body.retCode}: ${body.retMsg}`);
      }
      return body.result?.list ?? [];
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
  }
  throw new Error(`Could not fetch ${symbol}/${interval}: ${String(lastError)}`);
}

async function exportSeries(
  symbol: string,
  timeframe: typeof TIMEFRAMES[number],
  startMs: number,
  endMs: number,
  outputDir: string,
): Promise<void> {
  const unique = new Map<number, BybitKline>();
  let cursorEnd = endMs;
  let pages = 0;

  while (cursorEnd >= startMs) {
    const page = await fetchPage(symbol, timeframe.interval, startMs, cursorEnd);
    pages++;
    if (page.length === 0) break;

    let oldest = Number.POSITIVE_INFINITY;
    for (const row of page) {
      const timestamp = Number(row[0]);
      if (!Number.isFinite(timestamp) || timestamp < startMs || timestamp > endMs) continue;
      oldest = Math.min(oldest, timestamp);
      unique.set(timestamp, row);
    }

    if (!Number.isFinite(oldest) || oldest <= startMs) break;
    const nextCursor = oldest - 1;
    if (nextCursor >= cursorEnd) {
      throw new Error(`Pagination made no progress for ${symbol}/${timeframe.label}`);
    }
    cursorEnd = nextCursor;

    // Be gentle to the free public endpoint.
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (pages > 5000) throw new Error("Safety stop: unexpectedly high page count");
  }

  const rows = [...unique.values()].sort((a, b) => Number(a[0]) - Number(b[0]));
  const expectedIntervals = Math.max(0, Math.floor((endMs - startMs) / timeframe.ms));
  const firstTs = rows.length ? Number(rows[0][0]) : null;
  const lastTs = rows.length ? Number(rows[rows.length - 1][0]) : null;
  let gaps = 0;
  for (let i = 1; i < rows.length; i++) {
    const delta = Number(rows[i][0]) - Number(rows[i - 1][0]);
    if (delta !== timeframe.ms) gaps++;
  }

  await Deno.mkdir(outputDir, { recursive: true });
  const file = `${outputDir}/${symbol}_${timeframe.label}.ndjson`;
  const lines = rows.map((row) => JSON.stringify({
    symbol,
    timeframe: timeframe.label,
    timestamp_ms: Number(row[0]),
    timestamp_utc: iso(Number(row[0])),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    turnover: Number(row[6]),
    source: "Bybit V5 public Spot API",
  }));
  await Deno.writeTextFile(file, lines.length ? lines.join("\n") + "\n" : "");

  const invalid = rows.filter((row) => {
    const o = Number(row[1]), h = Number(row[2]), l = Number(row[3]), c = Number(row[4]);
    const v = Number(row[5]);
    return ![o, h, l, c, v].every(Number.isFinite) ||
      o <= 0 || h <= 0 || l <= 0 || c <= 0 || v < 0 ||
      h < Math.max(o, c, l) || l > Math.min(o, c, h);
  }).length;

  console.log(JSON.stringify({
    symbol,
    timeframe: timeframe.label,
    pages,
    rows: rows.length,
    firstUtc: firstTs === null ? null : iso(firstTs),
    lastUtc: lastTs === null ? null : iso(lastTs),
    expectedIntervals,
    observedMissingIntervals: gaps,
    invalidRows: invalid,
    output: file,
  }));
}

async function main(): Promise<void> {
  const years = parseYears();
  const outputDir = argValue("--out=") ?? "./data/bybit-history";
  const endMs = Math.floor(Date.now() / 60_000) * 60_000 - 1;
  const startMs = endMs - years * 365 * DAY_MS;

  console.log(JSON.stringify({
    mode: "PUBLIC_DATA_EXPORT_ONLY",
    years,
    startUtc: iso(startMs),
    endUtc: iso(endMs),
    symbols: SYMBOLS,
    timeframes: TIMEFRAMES.map((t) => t.label),
    outputDir,
    databaseWrites: false,
    orders: false,
  }));

  for (const symbol of SYMBOLS) {
    for (const timeframe of TIMEFRAMES) {
      await exportSeries(symbol, timeframe, startMs, endMs, outputDir);
    }
  }
  console.log("Export finished. Review missing intervals and invalidRows before any import.");
}

if (import.meta.main) {
  await main();
}
