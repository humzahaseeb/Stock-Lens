# Security — risk register

This is a software project, so the main risks are leaked API keys, bad or
stale data, abusive requests, and users mistaking the page for financial advice.

| # | Risk | Likelihood | Impact | What we do about it | Status |
|---|---|---|---|---|---|
| 1 | FMP or Finnhub API keys leak from the repo or browser | Medium | High — someone could use the keys and burn their quota | Keys stay in backend environment variables. The frontend calls our backend, not FMP or Finnhub directly. Yahoo chart requests use a public endpoint and need no key. | ✅ Mitigated |
| 2 | Stale data or demo figures are mistaken for real results | High | High | Live data shows a source/date. Synthetic example values say “Synthetic demo data”; they are illustrations, not company results. Yahoo quotes may be delayed. | ⚠️ Disclose the limits |
| 3 | A user mistakes the summary for financial advice | Low–Medium | High | The API returns a disclaimer, shown at the top of each summary. An E2E test checks that it appears. | ✅ Mitigated |
| 4 | A bad ticker is used to probe the backend or upstream APIs | Low | Medium | The backend validates ticker input before making API calls or loading an override file; invalid input gets a 400 response. | ✅ Mitigated |
| 5 | Too many requests hit API limits, or an upstream provider goes down | Medium | Medium — live data or charts may stop working | The backend limits requests to 30 per IP per minute and caches provider responses. It uses seed/override data when possible; if the stock chart is unavailable, it shows an error instead of made-up prices. | ✅ Fallbacks in place; providers can still be unavailable |
| 6 | A vulnerable package is used | Low–Medium | Varies | On 16 Nov 2026, `npm audit` reported 0 vulnerabilities in backend, frontend, and E2E packages. Run it again after dependency changes or before release. | ✅ Audited 16 Nov 2026 |
| 7 | Manually entered or synthetic analyst figures look like verified research | Medium | High | NVDA and RR ratings/targets are synthetic. The UI labels synthetic data, and synthetic analyst data is not used to generate bull/bear points. | ⚠️ Explain in the demo |
| 8 | A data provider changes its limits or stops working | Medium | Medium | FMP, Finnhub, and Yahoo Finance have separate client modules. Financial data can fall back to seed/override values. Stock-chart errors are shown to the user. | ✅ Fallbacks in place |

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
There are no accounts or tracking. The app doesn't store personal data; it
receives a ticker symbol to look up a company.
