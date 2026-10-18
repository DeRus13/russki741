# DeRus13 KI-Trading-Agent

Responsive dashboard for the existing Supabase trading-agent backend. The initial mode is **simulation only**; this project does not place any real orders.

## Dashboard

- Frontend: `ki-agent-trading/index.html`
- Protected read-only Edge Function: `agent-dashboard-summary`
- Supabase project ref: `bajvhowasdmliztvguef`
- Markets: BTCUSDT, ETHUSDT, SOLUSDT
- Risk configuration is read from the backend; current configured maximum drawdown is 10%
- Real orders and withdrawals remain disabled

## Authentication and access

The browser uses only the public Supabase publishable key. It never contains the service-role key or Bybit API secret.

Sign in with the existing Supabase Auth account that is allow-listed in `ai_agents.dashboard_access`. The Edge Function checks the user session and allow-list before returning summarized data. Do not add broad public read policies to the `ai_agents` schema.

## Publish with GitHub Pages

In the GitHub repository settings, open **Pages** and select **Deploy from a branch**, branch `main`, folder `/(root)`. After GitHub Pages finishes publishing, open:

`https://derus13.github.io/russki741/ki-agent-trading/`

If GitHub Pages has not been enabled yet, the page will not be available at that URL until the repository owner enables it.

## Connected backend data

The dashboard reads agent registry status, current risk settings, recent signals, market candles, news entries, recent run status and a sampled simulation summary through the protected Edge Function. The page does not start a scan or execute trades.

## Safety notes

- Dashboard mode is read-only.
- Current backend configuration is `simulation_only`.
- `real_orders_enabled` is false and `withdrawals_enabled` is false.
- Stored signals are experimental rule-based research results, not validated investment advice.
- Bybit Demo-account authentication is not claimed as connected just because public market candles are available.
- Keep every Bybit API key/secret exclusively in server-side function/Worker secrets. Never commit them to this repository.
