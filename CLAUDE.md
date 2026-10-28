# Claude Code / Claude.ai project guide

## Project
- Repository: `DeRus13/russki741`
- Trading research branch: `feat/trading-learning-engine-20261028`
- Pull request: https://github.com/DeRus13/russki741/pull/2
- Supabase project ref: `bajvhowasdmliztvguef`
- Research Edge Function: `trading-learning-research`
- Research UI: `ki-agent-trading/v2/research.html`

## Operating rules
1. Research and paper trading only. Never enable live orders, leverage, exchange trading credentials, or automated strategy promotion.
2. Never commit secrets, access tokens, service-role keys, or user credentials. Do not ask the user to paste secrets into chat.
3. Do not merge PRs, deploy GitHub Pages, change production settings, or make destructive DB changes without explicit confirmation.
4. Preserve existing production files and booking/studio systems. Make changes on the feature branch and use a PR.
5. Prefer free tools and public market data. No paid API subscriptions or paid browser automation.
6. Treat backtest results as research, not evidence of guaranteed profitability. Validate with tests, out-of-sample data, fees, slippage, and data-quality checks.

## Current status (2026-10-28)
- The Edge Function is deployed and ACTIVE, version 1.
- It expects the Supabase secret `TRADING_RESEARCH_TOKEN`. The secret has not yet been confirmed as configured.
- The static research UI asks the user to enter that token for a single HTTPS request; it does not save it to local storage. Never hardcode the token in the HTML or Git history.
- The function reads `ai_agents.market_candles`, performs a backtest, and should not write database rows or place orders.
- The existing candle database currently contains only about 11 days of data for BTCUSDT, ETHUSDT, and SOLUSDT across 1m/3m/5m. For multi-year testing, use the documented public Bybit historical exporter and an explicit, reviewed import workflow; do not assume the history is already loaded.
- GitHub Actions tests previously passed on the feature branch; rerun them after any code changes.
- Production `main` and the published Pages dashboard have not been changed by this feature branch.

## Next operational checks
1. Confirm `TRADING_RESEARCH_TOKEN` exists as a Supabase Edge Function secret, without revealing its value.
2. Invoke the function with no token and verify it rejects the request; then test with the token privately without logging it.
3. Verify the REST query can read the intended `ai_agents.market_candles` schema and that the response includes a truthful coverage/gap audit.
4. Review the backtest engine for accounting, drawdown, and exit-simulation correctness; add regression tests before treating results as decision-grade.
5. Test the UI and error states. Keep the endpoint restricted to research-only behavior.
6. Report exactly what was verified, what failed, and what remains blocked. Never claim a test passed without observed evidence.

## Claude setup
To give Claude access, the repository owner must connect GitHub from Claude's own Settings / Integrations (or enable the GitHub repository in Claude Code). Grant access only to this repository if the UI offers repository-level selection. This file provides context; it does not itself grant account permissions or access to Supabase secrets.
