import { auditCandleGaps, storedRowsToCandles } from "./historical-data-adapter.ts";
import type { StoredCandle } from "./historical-data-adapter.ts";

function row(time: string): StoredCandle {
  return { candle_open: time, open_price: "100", high_price: "102", low_price: "99", close_price: "101", volume: "10" };
}

Deno.test("converts stored decimal fields to ordered numeric candles", () => {
  const candles = storedRowsToCandles([row("2026-01-01T00:00:00.000Z"), row("2026-01-01T00:01:00.000Z")]);
  if (candles[0].open !== 100 || candles[1].time - candles[0].time !== 60_000) throw new Error("Conversion mismatch");
});

Deno.test("reports missing intervals rather than interpolating", () => {
  const candles = storedRowsToCandles([row("2026-01-01T00:00:00.000Z"), row("2026-01-01T00:03:00.000Z")]);
  const audit = auditCandleGaps(candles, 1);
  if (audit.missingIntervals !== 2) throw new Error("Expected two missing intervals");
  if (audit.invalidRows !== 0) throw new Error("Aligned gaps should not be marked invalid");
});

Deno.test("flags duplicate timestamps", () => {
  const candles = storedRowsToCandles([row("2026-01-01T00:00:00.000Z"), row("2026-01-01T00:00:00.000Z")]);
  if (auditCandleGaps(candles, 1).duplicateOrOutOfOrder !== 1) throw new Error("Expected duplicate timestamp to be flagged");
});
