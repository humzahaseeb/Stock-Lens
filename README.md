# Stock Lens

A one-page stock research tool for everyday investors. For any company,
Stock Lens pulls together business model, financial health, competitive
moat, valuation, bull/bear case and analyst consensus into a single,
consistently structured page — every figure shown with its source and the
date it was checked.

**This is informational only — not financial advice. Capital at risk.**

> Built for the BBC Champion Sprint challenge. See [`docs/`](./docs) for the
> discipline evidence pack (Product, Agile, UX/UI, Security, Testing) and
> [`docs/api-schema.md`](./docs/api-schema.md) for the API contract.

## How it's built
- `backend/` — Node/Express API combining two free data sources:
  [Financial Modeling Prep](https://financialmodelingprep.com) for financial
  health + valuation, and [Finnhub](https://finnhub.io) for real analyst
  recommendation trends (consensus rating) + insider sentiment. Bull/bear
  case bullets are auto-generated from that live data using explainable
  rules (no free API writes analyst-style prose). Business model and
  competitive moat are manually curated, sourced-and-dated overrides
  (`backend/src/data/overrides`) since those are genuine qualitative
  judgment calls — see [`docs/api-schema.md`](./docs/api-schema.md) for the
  full breakdown of what's live vs. manual and why.
- `frontend/` — React (Vite) single-page app: search a ticker, see the
  one-page summary.
- `e2e/` — Playwright end-to-end tests + an axe-core accessibility scan.

## Requirements
- Node.js 20+ and npm
- (Optional but recommended) a free [Financial Modeling Prep API
  key](https://financialmodelingprep.com) for live financial data
- (Optional) a free [Finnhub API key](https://finnhub.io/register) for live
  analyst consensus + insider sentiment
- The app still runs and demos correctly without either key (see "Running
  without API keys" below).

## Setup
```bash
# From the repo root
cd backend && npm install && cp .env.example .env && cd ..
cd frontend && npm install && cp .env.example .env && cd ..
cd e2e && npm install && npx playwright install chromium && cd ..
```

If you have API keys, put them in `backend/.env` (`FMP_API_KEY=...`,
`FINNHUB_API_KEY=...`).

## Running the app
```bash
# Terminal 1
cd backend && npm run dev     # http://localhost:4000

# Terminal 2
cd frontend && npm run dev    # http://localhost:5173
```
Open http://localhost:5173, then click one of the two worked examples
("NVIDIA (NVDA)" / "Rolls-Royce (RR.L)") or type any ticker.

### Running without API keys
The app **does not require** either key to demo: it falls back to a pinned
seed snapshot (`backend/src/data/seedFinancials`, once generated — see
[`docs/data-seeding.md`](./docs/data-seeding.md)) or, failing that, to the
manually curated override data alone. Unknown tickers with no override/seed
data return a clear 404 rather than a broken page.

## Running the tests
```bash
cd backend  && npm test   # unit tests (Vitest) — FMP/Finnhub parsing, bull/bear derivation, overrides, routes
cd frontend && npm test   # component tests (Vitest + React Testing Library)
cd e2e      && npm test   # Playwright e2e + accessibility (axe-core)
                          # (auto-starts both dev servers; stop any already
                          # running on :4000 / :5173 first if you hit a conflict)
```
See [`docs/testing.md`](./docs/testing.md) for what each layer covers and the
latest pass counts, and [`docs/manual-test-plan.md`](./docs/manual-test-plan.md)
for the manual/usability test plan to run with real testers.

## Before presenting (checklist)
- [ ] `cd backend && FMP_API_KEY=... FINNHUB_API_KEY=... npm run seed` — pins
      fresh live data for NVDA/RR.L (see [`docs/data-seeding.md`](./docs/data-seeding.md))
- [ ] Check whether the `TODO_RESEARCH_REQUIRED` fallback placeholders in
      `backend/src/data/overrides/{NVDA,RR.L}.json` are still being used
      (e.g. no Finnhub coverage for RR.L's ADR) — if so, fill them in with
      your own sourced, dated research; a real 12-month price target also
      needs adding this way since no free API provides one
- [ ] Run the manual usability sessions in
      [`docs/manual-test-plan.md`](./docs/manual-test-plan.md) with 3 testers
- [ ] Re-run `npm audit` in `backend`, `frontend`, and `e2e`
- [ ] Re-run all three test suites above and confirm they're green

## Evidence pack
- [`docs/product.md`](./docs/product.md) — problem, MVP scope, backlog, success criteria
- [`docs/agile.md`](./docs/agile.md) — process, backlog-as-built, retro
- [`docs/ux.md`](./docs/ux.md) — user journey, UX methods, UI decisions
- [`docs/security/risk-register.md`](./docs/security/risk-register.md) — risks and mitigations
- [`docs/testing.md`](./docs/testing.md) — test strategy and latest results
- [`docs/manual-test-plan.md`](./docs/manual-test-plan.md) — manual/usability test cases
- [`docs/api-schema.md`](./docs/api-schema.md) — API response contract
- [`docs/data-seeding.md`](./docs/data-seeding.md) — how/why the demo data is pinned
