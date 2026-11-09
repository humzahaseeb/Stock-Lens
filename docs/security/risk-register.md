# Security — risk register

Maps to proposal §12. "Physical" security isn't applicable (this is
software), so the focus is: data trust, secrets, and basic web app hygiene.

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | FMP API key leaks (committed to git, or exposed to the browser) | Medium | High — quota abuse/revocation | Key only ever read server-side via `process.env.FMP_API_KEY`; `.env` is gitignored repo-wide; frontend never sees the key (calls go through our own backend) | ✅ Mitigated |
| 2 | Stale/wrong financial data misleads a user | High (free data sources) | High | Every figure carries `source` + `asOf`; unresearched fields are explicitly flagged `needsResearch` rather than silently blank or guessed | ✅ Mitigated |
| 3 | Tool is mistaken for financial advice | Low–Medium | High (reputational/user harm) | Disclaimer is backend-supplied (can't be stripped client-side) and rendered at the top of every summary; covered by an e2e assertion | ✅ Mitigated |
| 4 | Ticker input used to probe/abuse the backend or an upstream API | Low | Medium | Strict allow-list validation (`^[A-Z0-9.]{1,10}$`) before any lookup; rejected with 400 before touching FMP or the filesystem | ✅ Mitigated |
| 5 | Someone hammers the API and burns the FMP free-tier daily quota | Medium | Medium (demo stops working) | Per-IP rate limiting (30 req/min) on `/api/*`; FMP responses cached ~6h server-side; seed/cache fallback keeps the two demo tickers working even if the quota is blown | ✅ Mitigated |
| 6 | Vulnerable dependency in either app | Low–Medium | Varies | `npm audit` run on both `backend` and `frontend` (see latest run below); re-run before presenting | ⏳ Re-check before 16 Nov |
| 7 | Analyst consensus/bull-bear case content presented as fact when actually AI-drafted | Medium | High (judging integrity) | These fields are **not** AI-generated — left as `TODO_RESEARCH_REQUIRED` placeholders for you to fill in with your own sourced research | ✅ By design |

## Dependency audit
Run before presenting (dates/results will change as dependencies update):
```bash
cd backend && npm audit
cd ../frontend && npm audit
cd ../e2e && npm audit
```
Record the output/date here once run close to 16 Nov.

## Data & privacy
No user accounts, no personal data collected or stored — the only inputs are
a ticker string, which isn't personal data. No cookies/tracking added.
