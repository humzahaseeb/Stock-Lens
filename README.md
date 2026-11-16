# Stock Lens

A one-page stock research tool for everyday investors. For any company,
Stock Lens pulls together business model, financial health, competitive
moat, valuation, bull/bear case, analyst ratings and a price-target forecast
into one consistently structured page. It also includes stock-price and
annual/quarterly income-statement charts.

**This is informational only — not financial advice. Capital at risk.**

> Built for the BBC Champion Sprint challenge. See [`docs/`](./docs) for the
> discipline evidence pack (Product, Agile, UX/UI, Security, Testing).

## How it's built
- `backend/` — Node/Express API combining three data sources:
  [Financial Modeling Prep](https://financialmodelingprep.com) for financial
  statements and cash flow, [Finnhub](https://finnhub.io) for analyst
  recommendations and insider sentiment, and Yahoo Finance for chart prices
  (which may be delayed). Bull/bear content and worked-example data use
  sourced manual overrides or explicitly labeled synthetic demo values.
- `frontend/` — React (Vite) single-page app: search a ticker, see the
  one-page summary, interactive price chart, income-statement charts, and
  metric explanations.
- `e2e/` — Playwright end-to-end tests + an axe-core accessibility scan.

## Requirements
- Node.js 20+ and npm
- (Optional but recommended) a free [Financial Modeling Prep API
  key](https://financialmodelingprep.com) for live financial data
- (Optional) a free [Finnhub API key](https://finnhub.io/register) for live
  analyst consensus + insider sentiment
- Yahoo Finance chart requests require internet access; no API key is used.
- NVDA and Rolls-Royce financial-health, valuation, income-chart, and Rolls-Royce
  analyst snapshot values are synthetic demo fixtures, not actual reported data.

## Setup
```bash
# From the repo root
cd backend && npm install && cp .env.example .env && cd ..
cd frontend && npm install && cp .env.example .env && cd ..
cd e2e && npm install && npx playwright install chromium && cd ..
```

If you have API keys, put them in `backend/.env` (`FMP_API_KEY=...`,
`FINNHUB_API_KEY=...`). These provide live data for fields not replaced by a
curated demo override.

## Running the app
```bash
# Terminal 1
cd backend && npm run dev     # http://localhost:4000

# Terminal 2
cd frontend && npm run dev    # http://localhost:5173
```
Open http://localhost:5173, then click one of the two worked examples
("NVIDIA (NVDA)" / "Rolls-Royce (RR)") or type any ticker. `RR` is the public
app ticker; the LSE data-source symbol remains `RR.L`.

### Running without API keys
The two worked examples have override data and can render without FMP/Finnhub
keys. The price chart still needs internet access to request Yahoo Finance;
if unavailable, it shows an error rather than fabricated prices. Other tickers
need live API data or a seeded snapshot. Unknown tickers with no data return a
clear 404.

## Running the tests
```bash
cd backend  && npm test   # unit tests (Vitest) — FMP/Finnhub parsing, bull/bear derivation, overrides, routes
cd frontend && npm test   # component tests (Vitest + React Testing Library)
cd e2e      && npm test   # Playwright e2e + accessibility (axe-core)
                          # (auto-starts both dev servers; stop any already
                          # running on :4000 / :5173 first if you hit a conflict)
```
See [`docs/testing.md`](./docs/testing.md) for the test strategy and last
recorded results, and [`docs/manual-test-plan.md`](./docs/manual-test-plan.md)
for the manual/usability test plan.

## Evidence pack
- [`docs/product.md`](./docs/product.md) — problem, MVP scope, backlog, success criteria
- [`docs/agile.md`](./docs/agile.md) — process, current backlog and outstanding evidence
- [`docs/ux.md`](./docs/ux.md) — user journey, UX methods, UI decisions
- [`docs/security/risk-register.md`](./docs/security/risk-register.md) — risks and mitigations
- [`docs/testing.md`](./docs/testing.md) — test strategy and latest results
- [`docs/manual-test-plan.md`](./docs/manual-test-plan.md) — manual/usability test cases
