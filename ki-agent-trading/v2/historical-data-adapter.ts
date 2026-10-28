/**
 * Read-only adapter helpers for ai_agents.market_candles.
 * No network, database writes, or execution.
 */

import type { Candle } from "./learning-engine.ts";

export type StoredCandle = {
  candle_open: string;
  open_price: string | number;
  high_price: string | number;
  low_price: string | number;
  close_price: string | number;
  volume: string | number;
};

export type GapAudit = {
  rows: number;
  invalidRows: number;
  duplicateOrOutOfOrder: number;
  expectedIntervalMs: number;
  missingIntervals: number;
  firstTime: number | null;
  lastTime: number | null;
};

export function storedRowsToCandles(rows: StoredCandle[]): Candle[] {
  return rows.map(row => ({
    time: Date.parse(row.candle_open),
    open: Number(row.open_price),
    high: Number(row.high_price),
    low: Number(row.low_price),
    close: Number(row.close_price),
    volume: Number(row.volume),
  }));
}

/**
 * Audits timestamp continuity for fixed-minute candles. Gaps are reported,
 * never silently filled or interpolated.
 */
export function auditCandleGaps(candles: Candle[], timeframeMinutes: number): GapAudit {
  const expectedIntervalMs = timeframeMinutes * 60_000;
  let invalidRows = 0;
  let duplicateOrOutOfOrder = 0;
  let missingIntervals = 0;
  let previous = -Infinity;

  for (const candle of candles) {
    if (![candle.time, candle.open, candle.high, candle.low, candle.close, candle.volume].every(Number.isFinite)) {
      invalidRows++;
      continue;
    }
    if (candle.time <= previous) duplicateOrOutOfOrder++;
    if (previous !== -Infinity && candle.time > previous) {
      const delta = candle.time - previous;
      if (delta % expectedIntervalMs !== 0) invalidRows++;
      else missingIntervals += Math.max(0, delta / expectedIntervalMs - 1);
    }
    previous = candle.time;
  }

  return {
    rows: candles.length,
    invalidRows,
    duplicateOrOutOfOrder,
    expectedIntervalMs,
    missingIntervals,
    firstTime: candles.length ? candles[0].time : null,
    lastTime: candles.length ? candles[candles.length - 1].time : null,
  };
}
