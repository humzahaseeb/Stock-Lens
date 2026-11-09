# Security — risk register

Maps to proposal §12. "Physical" security isn't applicable (this is
software), so the focus is: data trust, secrets, and basic web app hygiene.

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | FMP/Finnhub API keys leak (committed to git, or exposed to the browser) | Medium | High — quota abuse/revocation | Keys only ever read server-side via `process.env.FMP_API_KEY` / `FINNHUB_API_KEY`; `.env` is gitignored repo-wide; frontend never sees either key (calls go through our own backend) | ✅ Mitigated |
| 2 | Stale/wrong financial or consensus data misleads a user | High (free data sources) | High | Every figure carries `source` + `asOf`; unresearched/unavailable fields are explicitly flagged (`needsResearch`, or a clear `priceTargetNote`) rather than silently blank or guessed | ✅ Mitigated |
| 3 | Tool is mistaken for financial advice | Low–Medium | High (reputational/user harm) | Disclaimer is backend-supplied (can't be stripped client-side) and rendered at the top of every summary; covered by an e2e assertion | ✅ Mitigated |
| 4 | Ticker input used to probe/abuse the backend or an upstream API | Low | Medium | Strict allow-list validation (`^[A-Z0-9.]{1,10}$`) before any lookup; rejected with 400 before touching FMP, Finnhub, or the filesystem | ✅ Mitigated |
| 5 | Someone hammers the API and burns the FMP/Finnhub free-tier daily quota | Medium | Medium (demo stops working) | Per-IP rate limiting (30 req/min) on `/api/*`; both APIs' responses cached ~6h server-side; seed/cache fallback keeps the two demo tickers working even if a quota is blown | ✅ Mitigated |
| 6 | Vulnerable dependency in either app | Low–Medium | Varies | `npm audit` run on `backend`, `frontend`, and `e2e` (see latest run below); re-run before presenting | ⏳ Re-check before 16 Nov |
| 7 | Bull/bear case or analyst consensus presented as fact when actually fabricated/AI-hallucinated | Medium | High (judging integrity) | Analyst ratings are pulled live from Finnhub except NVDA's manually supplied Google Finance snapshot and RR.L's conspicuously labeled synthetic demo data. RR.L's fabricated consensus is excluded from auto-derived bull/bear content. NVDA's targets are from the user-provided screenshot; other targets remain unavailable because no free API provides them. | ✅ By design |
| 8 | Third-party API (FMP or Finnhub) changes its free-tier terms or is discontinued | Low–Medium | Medium | Each integration is isolated in its own client module (`fmpClient.js`, `finnhubClient.js`) behind the same route-level try/catch + seed-cache + override fallback chain, so losing one source degrades gracefully rather than breaking the app | ✅ Mitigated |

## Dependency audit
Run before presenting (dates/results will change as dependencies update):
```bash
cd backend && npm audit
cd ../frontend && npm audit
cd ../e2e && npm audit
```
Record the output/date here once run close to 16 Nov. Last run during
development: 0 vulnerabilities across all three apps.

## Data & privacy
No user accounts, no personal data collected or stored — the only inputs are
a ticker string, which isn't personal data. No cookies/tracking added.
