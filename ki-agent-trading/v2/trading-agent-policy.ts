/**
 * Persistent operating policy for the trading research agent.
 * This is a research/paper-trading policy, not a promise of profitability.
 * Keep live order execution disabled unless separately approved by the owner.
 */
export const TRADING_AGENT_POLICY = {
  version: "2026-10-28.1",
  purpose: "Improve risk-adjusted net performance through reproducible research, not by increasing trade frequency.",
  mode: "research_and_paper_only",
  liveOrdersEnabled: false,
  startingVirtualBalance: 10_000,
  quoteCurrency: "USDT",
  markets: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  supportedTimeframes: ["1m", "3m", "5m"],
  scanCadenceMinutes: 1,
  strategyEvaluationCadenceMinutes: 5,
  risk: {
    targetRiskPerTradePct: 0.25,
    hardMaxRiskPerTradePct: 0.5,
    maxDrawdownPct: 10,
    leverageAllowed: false,
    overlappingPositionsAllowed: false,
    stopAfterDrawdownLimit: true,
  },
  research: {
    requireClosedCandles: true,
    requireChronologicalData: true,
    rejectInvalidOrDuplicateCandles: true,
    neverInterpolateMissingCandles: true,
    includeFeesAndSlippage: true,
    optimizeOnTrainingDataOnly: true,
    requireUntouchedOutOfSampleEvaluation: true,
    requireWalkForwardEvaluation: true,
    requireMultipleMarketRegimes: true,
    requirePaperTradingBeforePromotion: true,
    requireMinimumSampleAdequacy: true,
    evaluateNetExpectancyAndDrawdownNotWinRateAlone: true,
    recordStrategyVersionDataRangeAndConfig: true,
    autoPromoteStrategies: false,
  },
  decisionRules: [
    "Do not trade on an unclosed candle.",
    "Do not treat a backtest result as proof of future profitability.",
    "Do not approve a candidate solely because its win rate is high.",
    "Reject candidates whose apparent edge disappears after fees and slippage.",
    "Reject or pause research when candle quality, history coverage, or sample size is inadequate.",
    "Prefer stable out-of-sample net expectancy and controlled drawdown over maximum gross return.",
    "Keep a reproducible trade ledger and explain each entry, exit, cost, and risk decision.",
    "When stop-loss and take-profit could both be hit in one candle, use the conservative stop-first assumption.",
    "Never place real orders, enable leverage, or alter production settings automatically.",
  ],
  promotionGates: {
    requirePositiveOutOfSampleNetExpectancy: true,
    requireProfitFactorAboveOneAfterCosts: true,
    requireDrawdownWithinLimit: true,
    requireWalkForwardStability: true,
    requirePaperTradingReview: true,
    humanApprovalRequired: true,
  },
} as const;

export type TradingAgentPolicy = typeof TRADING_AGENT_POLICY;
