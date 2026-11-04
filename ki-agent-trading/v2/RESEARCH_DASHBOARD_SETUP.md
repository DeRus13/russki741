# Research dashboard setup (branch-only)

This page is deliberately separate from the production scanner. It is not live until the research Edge Function is deployed and configured.

## Required configuration

1. Confirm the Supabase project that owns schema `ai_agents` and table `market_candles`. The research page currently targets project ref `bajvhowasdmliztvguef`; do not deploy if that is not the owner of the historical candle table.
2. In Supabase Edge Function secrets, set `TRADING_RESEARCH_TOKEN` to a long, random access token. Do not commit the token to GitHub or put it in the HTML source.
3. Deploy only the `trading-learning-research` function to that confirmed project. It needs the project-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. The service-role key must remain server-side.
4. Verify the function with an OPTIONS request from `https://derus13.github.io`, then test: missing/wrong token returns 401; missing configured secret returns 503; a valid token with an invalid market returns 400; a valid request returns read-only research metrics.
5. Publish the GitHub Pages branch only after reviewing the PR. Until then, `research.html` is available only in this development branch.

## Limits and safeguards

- CORS is restricted to `https://derus13.github.io`.
- The endpoint requires `x-research-token` and has no token default.
- Maximum query range: 30 days for 1m, 90 days for 3m, 180 days for 5m, to avoid exhausting the Edge Function on large ranges.
- Endpoint reads candles only. It does not insert trades/signals, change settings, or place orders.
- The current stored data audit found only about 10–11 days of history in the audited series. Larger requested ranges do not create missing history; multi-year research requires the historical exporter and a separately reviewed ingestion plan.
- The current UI's default dates cover the last seven days. Use only ranges for which stored candles are known to exist.
- Do not expose or reuse the existing dashboard's control token as the research token. Generate a separate secret.

## Deployment status

No function deployment, secret configuration, database write, merge, or production change is performed by this branch setup. These require a separate, explicit approval and a successful post-deployment verification.
