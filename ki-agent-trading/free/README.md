# KI Trading Lab (Free PWA)

A lightweight, dependency-free Progressive Web App for mobile-first trading simulation monitoring. No paid API, build step, npm packages, or subscription is required to host the static app.

## Deploy

This folder can be published with GitHub Pages at:
`https://derus13.github.io/russki741/ki-agent-trading/free/`

If GitHub Pages is not enabled for the repository, enable it in **Settings → Pages** and select the `main` branch / root. Publishing is not automatic until Pages is enabled and its deployment succeeds.

## Connect your own Supabase project

1. Open the app and choose **Einstellungen**.
2. Enter the Supabase project URL and the **public anon/publishable key**.
3. Sign in with an authorized Supabase Auth account.
4. Run **Verbindung testen**.

Never enter a `service_role` key into a browser. The app does not embed credentials. It stores the project URL, public key and email locally in the browser; the session is kept in session storage. Only use a Supabase project where the user has permission to access the intended functions.

## Safety / limitations

- Simulation monitoring only; no exchange order endpoint is called.
- The UI intentionally shows blank KPIs until it receives an API response. It does not invent performance data.
- The protected functions may use a different request/response contract; the integration is a first connection adapter and must be verified against the deployed function response.
- Offline cache is for the static shell, not live data.
- Static hosting is free within GitHub's current free-plan limits; it is not literally unlimited and depends on platform quotas.
