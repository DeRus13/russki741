# DeRus13 KI-Trading-Agent (Demo-Prototyp)

Ein einfacher, sicherer Startpunkt für den geplanten KI-Trading-Agenten. Dieses Projekt ist im **Simulationsmodus** und sendet keine Orders an Bybit.

## Aktueller Umfang
- Responsive Dashboard für BTC, ETH und SOL
- Interne, lokale Demo-Signale und simulierte Trades
- Risikolimit als sichtbare Konfiguration: maximaler Drawdown 10 %
- Statusanzeige für Bybit-Demo-API und Nachrichten-Feeds
- Keine API-Schlüssel im Browser, keine echte Orderausführung

## Start
Öffne `index.html` in einem Browser oder veröffentliche den Ordner über eine geeignete GitHub-Pages-Konfiguration.

## Vor echtem Demo-Handel erforderlich
1. Einen serverseitigen API-Proxy (z. B. Cloudflare Worker) verwenden.
2. Bybit-Demo-Schlüssel ausschließlich als Worker-Secrets speichern.
3. API-Verbindung, Signaturen, Zeitstempel und Fehlermeldungen testen.
4. Serverseitige Positionsgrößen, Stop-Loss und Drawdown-Grenzen erzwingen.
5. Erst nach verifizierten Tests Demo-Orders aktivieren.

## Geplante Integrationen
- Bybit Demo API (noch nicht verbunden)
- Nachrichten-/Makroanalyse (noch nicht verbunden)
- Supabase für persistente Einstellungen und Protokolle (noch nicht verbunden)

**Wichtig:** Die Marktwerte und Signale im Prototyp sind synthetische Beispieldaten, keine Live-Kurse und keine Anlageempfehlung.
