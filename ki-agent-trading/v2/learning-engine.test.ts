import {
  assessCandidate,
  atr,
  backtest,
  ema,
  rsi,
  validateCandles,
  type Candle,
} from "./learning-engine.ts";

function fixture(count = 180): Candle[] {
  const candles: Candle[] = [];
  let close = 100;
  for (let i = 0; i < count; i++) {
    // Deterministic gentle trend plus a repeatable oscillation.
    close = 100 + i * 0.12 + Math.sin(i / 3) * 1.7;
    const open = close - Math.sin(i) * 0.35;
    candles.push({
      time: 1_700_000_000_000 + i * 60_000,
      open,
      high: Math.max(open, close) + 0.4,
      low: Math.min(open, close) - 0.4,
      close,
      volume: 100 + (i % 17),
    });
  }
  return candles;
}

Deno.test("validates ordered OHLCV candles", () => {
  if (validateCandles(fixture()).length !== 0) throw new Error("Expected valid fixture");
  const bad = fixture();
  bad[10].low = bad[10].high + 1;
  if (!validateCandles(bad).some(x => x.includes("inconsistent OHLC"))) {
    throw new Error("Expected inconsistent OHLC to be rejected");
  }
});

Deno.test("EMA, RSI and ATR return aligned arrays", () => {
  const candles = fixture();
  const closes = candles.map(c => c.close);
  if (ema(closes, 9).length !== candles.length) throw new Error("EMA length mismatch");
  if (rsi(closes, 14).length !== candles.length) throw new Error("RSI length mismatch");
  if (atr(candles, 14).length !== candles.length) throw new Error("ATR length mismatch");
  if (ema(closes, 9)[8] === null) throw new Error("EMA should initialize at period - 1");
});

Deno.test("backtest is research-only and never creates an execution instruction", () => {
  const result = backtest(fixture());
  if (result.mode !== "research_only") throw new Error("Unexpected mode");
  if (!Array.isArray(result.trades)) throw new Error("Expected trade ledger");
  if (result.trades.some(t => !Number.isFinite(t.netPnl))) throw new Error("Invalid PnL");
  if (!result.notes.some(n => n.includes("no orders are sent"))) throw new Error("Safety note missing");
});

Deno.test("candidate gate rejects weak or insufficient samples", () => {
  const poor = {
    trades: 10, wins: 4, losses: 6, winRate: 0.4, netPnl: -25, returnPct: -0.25,
    profitFactor: 0.7, maxDrawdownPct: 2, averageTrade: -2.5, feesPaid: 5,
    endingBalance: 9_975, sampleAdequate: false,
  };
  const result = assessCandidate(poor, poor);
  if (result.eligibleForPaperReview) throw new Error("Poor candidate must not pass");
  if (!result.reasons.length) throw new Error("Expected rejection reasons");
});
