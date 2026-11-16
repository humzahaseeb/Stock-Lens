# Security — risk register

Maps to proposal §12. "Physical" security isn't applicable (this is
software), so the focus is: data trust, secrets, and basic web app hygiene.

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | FMP/Finnhub credentials leak (committed to git, or exposed to the browser) | Medium | High — quota abuse/revocation | Credentials are read server-side via environment variables; frontend requests go through the backend. Yahoo chart requests use a public endpoint and no key. | ✅ Mitigated |
| 2 | Stale, inaccurate, or synthetic data is mistaken for current fact | High (free/public sources and demo fixtures) | High | Live/seeded values carry source/date. NVDA/RR.L demo financial health, valuation, income statements, and RR.L analyst snapshot identify “Synthetic demo data” in the section footer; they are illustrative, not actuals. Yahoo quotes may be delayed. Verify/replace figures before presenting as factual research. | ⚠️ Disclosed; factual demo data still needs replacement/verification |
| 3 | Tool is mistaken for financial advice | Low–Medium | High (reputational/user harm) | Disclaimer is backend-supplied (can't be stripped client-side) and rendered at the top of every summary; covered by an e2e assertion | ✅ Mitigated |
| 4 | Ticker input used to probe/abuse the backend or an upstream API | Low | Medium | Strict allow-list validation (`^[A-Z0-9.]{1,10}$`) before any lookup; rejected with 400 before touching FMP, Finnhub, or the filesystem | ✅ Mitigated |
| 5 | Excessive requests exhaust upstream data limits or availability | Medium | Medium (live data/chart stops working) | Per-IP rate limiting (30 req/min) on `/api/*`; FMP/Finnhub use server cache; Yahoo chart requests use range-dependent short TTLs. Worked-example overrides/seed data allow the summary to render without financial API keys; the live stock chart may fail and shows an error. | ✅ Mitigated; upstream availability remains |
| 6 | Vulnerable dependency in an app | Low–Medium | Varies | `npm audit` run in backend, frontend and e2e on 16 Nov 2026; all three reported 0 vulnerabilities. Re-run after dependency changes or before release. | ✅ Audited 16 Nov 2026 |
| 7 | Analyst data/targets are presented as verified research when manually entered or fabricated | Medium | High (judging integrity) | NVDA ratings/targets were entered from a user-provided screenshot; RR.L consensus is synthetic. Synthetic fields have a source/date footer, and fabricated consensus is excluded from generated bull/bear analysis. Verify citations and disclose demo limitations. | ⚠️ Requires presenter disclosure |
| 8 | Third-party APIs change terms, rate limits, or availability | Medium | Medium | Integrations are isolated in `fmpClient.js`, `finnhubClient.js`, and `yahooFinanceClient.js`; financial calls can use seeded data/overrides, and chart failure is surfaced rather than replaced with fake prices. | ✅ Degrades gracefully |

## Dependency audit
Run after dependency changes or before release:
```bash
cd backend && npm audit
cd ../frontend && npm audit
cd ../e2e && npm audit
```
Latest run: 16 Nov 2026 — backend 0 vulnerabilities, frontend 0
vulnerabilities, e2e 0 vulnerabilities.

## Data & privacy
No user accounts, no personal data collected or stored — the only inputs are
a ticker string, which isn't personal data. No cookies/tracking added.
