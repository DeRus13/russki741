import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { backtest } from "../../../ki-agent-trading/v2/learning-engine.ts";
import { TRADING_AGENT_POLICY } from "../../../ki-agent-trading/v2/trading-agent-policy.ts";
import { auditCandleGaps, storedRowsToCandles, type StoredCandle } from "../../../ki-agent-trading/v2/historical-data-adapter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEARCH_TOKEN = Deno.env.get("TRADING_RESEARCH_TOKEN") || "";
const MARKETS = new Set(["BTCUSDT", "ETHUSDT", "SOLUSDT"]);
const TIMEFRAMES = new Map([["1m", 1], ["3m", 3], ["5m", 5]]);
const PAGE_SIZE = 1000;
const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  Accept: "application/json",
  "Accept-Profile": "ai_agents",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://derus13.github.io",
  "Access-Control-Allow-Headers": "content-type, x-research-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json", "Cache-Control": "no-store" },
  });
}

async function fetchCandles(market: string, timeframe: string, from: string, to: string): Promise<StoredCandle[]> {
  const all: StoredCandle[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/market_candles`);
    url.searchParams.set("select", "candle_open,open_price,high_price,low_price,close_price,volume");
    url.searchParams.set("market", `eq.${market}`);
    url.searchParams.set("timeframe", `eq.${timeframe}`);
    url.searchParams.set("and", `(candle_open.gte.${from},candle_open.lte.${to})`);
    url.searchParams.set("order", "candle_open.asc");
    const response = await fetch(url.toString(), {
      headers: { ...headers, Range: `${offset}-${offset + PAGE_SIZE - 1}` },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Candle read failed (${response.status}): ${text.slice(0, 180)}`);
    const rows = text ? JSON.parse(text) as StoredCandle[] : [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return all;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Use POST." }, 405);
  if (!RESEARCH_TOKEN) return json({ ok: false, error: "Research endpoint is not configured: TRADING_RESEARCH_TOKEN secret is missing." }, 503);
  const suppliedToken = req.headers.get("x-research-token") || "";
  if (suppliedToken.length !== RESEARCH_TOKEN.length || suppliedToken !== RESEARCH_TOKEN) {
    return json({ ok: false, error: "Unauthorized research request." }, 401);
  }
  try {
    const body = await req.json();
    const market = String(body.market ?? "");
    const timeframe = String(body.timeframe ?? "");
    const from = String(body.from ?? "");
    const to = String(body.to ?? "");
    if (!MARKETS.has(market)) return json({ ok: false, error: "Market is not allow-listed." }, 400);
    const minutes = TIMEFRAMES.get(timeframe);
    if (!minutes) return json({ ok: false, error: "Timeframe must be 1m, 3m, or 5m." }, 400);
    if (!Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(to)) || Date.parse(from) >= Date.parse(to)) {
      return json({ ok: false, error: "Provide a valid ISO date range with from earlier than to." }, 400);
    }
    // Exclude the currently forming candle by rounding the end down to the last
    // fully closed interval. The caller still supplies the research date range.
    const now = Date.now();
    const closedToMs = Math.min(Date.parse(to), Math.floor(now / (minutes * 60_000)) * minutes * 60_000 - 1);
    if (closedToMs <= Date.parse(from)) return json({ ok: false, error: "Date range contains no closed candles." }, 400);

    const rows = await fetchCandles(market, timeframe, from, new Date(closedToMs).toISOString());
    const candles = storedRowsToCandles(rows);
    const gapAudit = auditCandleGaps(candles, minutes);
    if (gapAudit.invalidRows || gapAudit.duplicateOrOutOfOrder) {
      return json({ ok: false, error: "Data quality gate failed; no backtest run.", market, timeframe, gapAudit }, 422);
    }
    if (candles.length < 60) {
      return json({ ok: false, error: "At least 60 candles are required.", market, timeframe, gapAudit }, 422);
    }

    const result = backtest(candles);
    return json({
      ok: true,
      mode: "research_only",
      policy: TRADING_AGENT_POLICY,
      market,
      timeframe,
      requested_range: { from, to },
      observed_range: { from: new Date(candles[0].time).toISOString(), to: new Date(candles[candles.length - 1].time).toISOString() },
      gapAudit,
      metrics: result.metrics,
      blocked: result.blocked,
      blockReasons: result.blockReasons,
      notes: [...result.notes, "This endpoint is read-only: it does not write to the database, create signals, or place orders.", "Policy is returned for transparency; this endpoint only evaluates research and does not execute trades."],
    });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
