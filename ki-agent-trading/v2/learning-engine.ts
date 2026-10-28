/**
 * Research-only trading learning engine.
 * Pure functions: no network, secrets, database writes, or order execution.
 * Designed for deterministic backtests and paper-trading experiments.
 */

export type Candle = {
  time: number; // Unix milliseconds; candle open time
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type EngineConfig = {
  startingBalance: number;
  riskPerTradePct: number; // default 0.25; hard-capped at 0.5
  maxDrawdownPct: number; // hard-capped at 10
  feeBpsPerSide: number;
  slippageBpsPerSide: number;
  rewardRisk: number;
  warmupCandles: number;
};

export type Trade = {
  side: "long" | "short";
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnl: number;
  fees: number;
  netPnl: number;
  reason: "stop_loss" | "take_profit" | "time_exit" | "end_of_data";
  equityAfter: number;
};

export type BacktestMetrics = {
  trades: number;
  wins: number;
  losses: number;
  winRate: number | null;
  netPnl: number;
  returnPct: number;
  profitFactor: number | null;
  maxDrawdownPct: number;
  averageTrade: number | null;
  feesPaid: number;
  endingBalance: number;
  sampleAdequate: boolean;
};

export type BacktestResult = {
  mode: "research_only";
  trades: Trade[];
  metrics: BacktestMetrics;
  blocked: boolean;
  blockReasons: string[];
  notes: string[];
};

const DEFAULTS: EngineConfig = {
  startingBalance: 10_000,
  riskPerTradePct: 0.25,
  maxDrawdownPct: 10,
  feeBpsPerSide: 5,
  slippageBpsPerSide: 2,
  rewardRisk: 1.8,
  warmupCandles: 30,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function validateCandles(candles: Candle[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(candles) || candles.length < 60) {
    errors.push("At least 60 candles are required for a basic research run.");
    return errors;
  }
  let previous = -Infinity;
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    if (![c.time, c.open, c.high, c.low, c.close, c.volume].every(Number.isFinite)) {
      errors.push(`Candle ${i} contains non-finite values.`);
      break;
    }
    if (c.time <= previous) errors.push("Candle timestamps must be unique and ascending.");
    if (c.low <= 0 || c.open <= 0 || c.high <= 0 || c.close <= 0) {
      errors.push(`Candle ${i} has a non-positive price.`);
      break;
    }
    if (c.high < Math.max(c.open, c.close, c.low) || c.low > Math.min(c.open, c.close, c.high)) {
      errors.push(`Candle ${i} has inconsistent OHLC values.`);
      break;
    }
    if (c.volume < 0) {
      errors.push(`Candle ${i} has negative volume.`);
      break;
    }
    previous = c.time;
  }
  return [...new Set(errors)];
}

export function ema(values: number[], period: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  if (period < 1 || values.length < period) return out;
  const alpha = 2 / (period + 1);
  let current = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = current;
  for (let i = period; i < values.length; i++) {
    current = values[i] * alpha + current * (1 - alpha);
    out[i] = current;
  }
  return out;
}

export function rsi(values: number[], period = 14): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    gains += Math.max(0, change);
    losses += Math.max(0, -change);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(0, change)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(0, -change)) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function atr(candles: Candle[], period = 14): Array<number | null> {
  const out: Array<number | null> = Array(candles.length).fill(null);
  if (candles.length <= period) return out;
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const prevClose = i ? candles[i - 1].close : candles[i].close;
    tr.push(Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - prevClose),
      Math.abs(candles[i].low - prevClose),
    ));
  }
  let current = tr.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
  out[period] = current;
  for (let i = period + 1; i < candles.length; i++) {
    current = (current * (period - 1) + tr[i]) / period;
    out[i] = current;
  }
  return out;
}

function metrics(trades: Trade[], startBalance: number, equityCurve: number[], feesPaid: number): BacktestMetrics {
  const wins = trades.filter(t => t.netPnl > 0);
  const losses = trades.filter(t => t.netPnl < 0);
  const grossWins = wins.reduce((s, t) => s + t.netPnl, 0);
  const grossLosses = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
  let peak = startBalance;
  let maxDd = 0;
  for (const equity of equityCurve) {
    peak = Math.max(peak, equity);
    if (peak > 0) maxDd = Math.max(maxDd, (peak - equity) / peak * 100);
  }
  const endingBalance = equityCurve.length ? equityCurve[equityCurve.length - 1] : startBalance;
  const netPnl = endingBalance - startBalance;
  return {
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: trades.length ? wins.length / trades.length : null,
    netPnl,
    returnPct: startBalance ? netPnl / startBalance * 100 : 0,
    profitFactor: grossLosses > 0 ? grossWins / grossLosses : (grossWins > 0 ? null : 0),
    maxDrawdownPct: maxDd,
    averageTrade: trades.length ? netPnl / trades.length : null,
    feesPaid,
    endingBalance,
    sampleAdequate: trades.length >= 100,
  };
}

/**
 * Simple EMA trend + RSI confirmation research strategy.
 * Signals use candle i close; simulated entry is next candle open (never same-close).
 * Intrabar stop/target ambiguity is handled conservatively: stop wins if both touched.
 * This is a baseline for comparison, not a claim of profitability.
 */
export function backtest(candles: Candle[], overrides: Partial<EngineConfig> = {}): BacktestResult {
  const config = { ...DEFAULTS, ...overrides };
  config.riskPerTradePct = clamp(config.riskPerTradePct, 0.01, 0.5);
  config.maxDrawdownPct = clamp(config.maxDrawdownPct, 0.1, 10);
  config.rewardRisk = clamp(config.rewardRisk, 1, 4);
  config.feeBpsPerSide = clamp(config.feeBpsPerSide, 0, 100);
  config.slippageBpsPerSide = clamp(config.slippageBpsPerSide, 0, 100);

  const errors = validateCandles(candles);
  if (errors.length || config.startingBalance <= 0) {
    return {
      mode: "research_only", trades: [],
      metrics: metrics([], Math.max(0, config.startingBalance), [], 0),
      blocked: true, blockReasons: [...errors, ...(config.startingBalance <= 0 ? ["Starting balance must be positive."] : [])],
      notes: ["No trades were simulated because validation failed."],
    };
  }

  const closes = candles.map(c => c.close);
  const fast = ema(closes, 9);
  const slow = ema(closes, 21);
  const momentum = rsi(closes, 14);
  const ranges = atr(candles, 14);
  const trades: Trade[] = [];
  const equityCurve: number[] = [config.startingBalance];
  let equity = config.startingBalance;
  let feesPaid = 0;
  let peak = equity;
  let blockedByDrawdown = false;
  const roundTripBps = (config.feeBpsPerSide + config.slippageBpsPerSide) * 2;
  const warmup = Math.max(config.warmupCandles, 30);

  for (let i = warmup; i < candles.length - 1; i++) {
    peak = Math.max(peak, equity);
    const dd = peak > 0 ? (peak - equity) / peak * 100 : 100;
    if (dd >= config.maxDrawdownPct) {
      blockedByDrawdown = true;
      break;
    }
    const f = fast[i], s = slow[i], r = momentum[i], a = ranges[i];
    if (f === null || s === null || r === null || a === null || a <= 0) continue;

    let side: "long" | "short" | null = null;
    if (f > s && candles[i].close > s && r >= 50 && r <= 70) side = "long";
    if (f < s && candles[i].close < s && r <= 50 && r >= 30) side = "short";
    if (!side) continue;

    const entryCandle = candles[i + 1];
    const entry = entryCandle.open * (side === "long" ? 1 + (config.slippageBpsPerSide / 10_000) : 1 - (config.slippageBpsPerSide / 10_000));
    const stopDistance = Math.max(a * 1.5, entry * 0.001);
    const stop = side === "long" ? entry - stopDistance : entry + stopDistance;
    const target = side === "long" ? entry + stopDistance * config.rewardRisk : entry - stopDistance * config.rewardRisk;
    const riskCash = equity * config.riskPerTradePct / 100;
    const quantity = Math.min(riskCash / stopDistance, equity / entry); // no leverage; notional <= equity
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    let exit = entry;
    let reason: Trade["reason"] = "end_of_data";
    let exitIndex = candles.length - 1;
    for (let j = i + 1; j < candles.length; j++) {
      const c = candles[j];
      const stopTouched = side === "long" ? c.low <= stop : c.high >= stop;
      const targetTouched = side === "long" ? c.high >= target : c.low <= target;
      if (stopTouched) {
        exit = stop;
        reason = "stop_loss";
        exitIndex = j;
        break;
      }
      if (targetTouched) {
        exit = target;
        reason = "take_profit";
        exitIndex = j;
        break;
      }
      // Re-evaluate signals only at closed bars; conservative baseline time exit after 5 bars.
      if (j >= i + 5) {
        exit = c.close;
        reason = "time_exit";
        exitIndex = j;
        break;
      }
    }
    exit *= side === "long" ? 1 - config.slippageBpsPerSide / 10_000 : 1 + config.slippageBpsPerSide / 10_000;
    const grossPnl = (exit - entry) * quantity * (side === "long" ? 1 : -1);
    const fees = (entry + exit) * quantity * config.feeBpsPerSide / 10_000;
    const netPnl = grossPnl - fees;
    equity += netPnl;
    feesPaid += fees;
    const trade: Trade = {
      side, entryTime: entryCandle.time, exitTime: candles[exitIndex].time,
      entryPrice: entry, exitPrice: exit, quantity, grossPnl, fees, netPnl, reason, equityAfter: equity,
    };
    trades.push(trade);
    equityCurve.push(equity);
    i = exitIndex; // no overlapping positions in this baseline
    if (equity <= 0) {
      blockedByDrawdown = true;
      break;
    }
  }

  const m = metrics(trades, config.startingBalance, equityCurve, feesPaid);
  const notes = [
    "Research-only baseline; no orders are sent and no database is written.",
    "Entry occurs at the next candle open after a signal to reduce look-ahead bias.",
    "If stop and target are both touched in one candle, stop loss is assumed first.",
    "Fees and slippage are configurable estimates; replace them with measured venue data before relying on results.",
    "This single-timeframe baseline does not yet incorporate higher-timeframe confirmation, funding, partial fills, or market impact.",
    "Require walk-forward and out-of-sample validation; at least 100 trades is a minimum diagnostic, not proof of an edge.",
  ];
  return {
    mode: "research_only", trades, metrics: m,
    blocked: blockedByDrawdown || m.maxDrawdownPct >= config.maxDrawdownPct,
    blockReasons: blockedByDrawdown ? ["Drawdown guard reached; simulation stopped."] : [],
    notes,
  };
}

/** Chronological split: earlier data for development, later data for untouched evaluation. */
export function chronologicalSplit<T>(items: T[], trainFraction = 0.7): { train: T[]; test: T[] } {
  const fraction = clamp(trainFraction, 0.5, 0.9);
  const splitAt = Math.floor(items.length * fraction);
  return { train: items.slice(0, splitAt), test: items.slice(splitAt) };
}

/** A candidate is not automatically promoted; this only reports basic gates. */
export function assessCandidate(train: BacktestMetrics, test: BacktestMetrics): {
  eligibleForPaperReview: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (train.trades < 100) reasons.push("Training sample has fewer than 100 trades.");
  if (test.trades < 50) reasons.push("Out-of-sample sample has fewer than 50 trades.");
  if (train.netPnl <= 0) reasons.push("Training net PnL is not positive after modeled costs.");
  if (test.netPnl <= 0) reasons.push("Out-of-sample net PnL is not positive after modeled costs.");
  if (train.profitFactor === null || train.profitFactor < 1.1) reasons.push("Training profit factor is below 1.10 or undefined.");
  if (test.profitFactor === null || test.profitFactor < 1.1) reasons.push("Out-of-sample profit factor is below 1.10 or undefined.");
  if (train.maxDrawdownPct > 10 || test.maxDrawdownPct > 10) reasons.push("Drawdown exceeds the 10% research guard.");
  if (test.returnPct < train.returnPct * 0.25) reasons.push("Out-of-sample return is materially weaker than training; investigate overfitting.");
  return { eligibleForPaperReview: reasons.length === 0, reasons };
}
