# Product — discipline evidence

How product thinking shaped Stock Lens, mapped to the proposal's Product
section (10) and success criteria (6).

## Problem & user
See proposal §2–3. One-line version: everyday investors have to piece
research together from several different sites/mediums and tend to fixate on
one signal (e.g. an analyst Buy rating) while missing the rest. Stock Lens
gives a single, consistently-structured page per company instead.

## MVP scope — must-have vs nice-to-have
| Must-have (MVP) | Later / additional scope |
|---|---|
| One ticker search → one-page summary | Multi-company side-by-side comparison |
| Business model, financial health, moat, valuation, bull/bear, and analyst-rating/target sections | User accounts / saved companies |
| 2 worked examples (NVDA, Rolls-Royce), with synthetic fields explicitly sourced as demo data | Multiple analyst-source aggregation |
| Clear "not financial advice" disclaimer | Streaming/websocket live prices |
| Accessible, keyboard-navigable UI | Internationalisation |
| Graceful handling of unknown tickers / API failure | |
| Stock-price chart and annual/quarterly revenue/net-income chart | |

Reasoning for the cut: the proposal's own deliverables (two worked examples,
not a general-purpose live product) and the "finish something" rule mean
depth on one ticker flow matters more than breadth of features.

## Prioritised backlog (mirrors the Agile kanban board)
1. API contract (`docs/api-schema.md`) — defined first so frontend/backend
   could be built against a stable shape.
2. Backend: FMP/Finnhub clients, Yahoo Finance chart proxy, manual overrides
   and summary/chart API routes.
3. Frontend: ticker search, structured summary, stock-price chart, income
   statement chart, and metric definitions.
4. Reliability: per-source caching, seeded fallback, and explicit unavailable
   states. Synthetic demo fixtures are identified as synthetic.
5. Testing: unit → component → e2e/accessibility → manual/usability.
6. Evidence pack docs (this folder), with Jira board and UX sketch evidence
   linked in `docs/agile.md` and `docs/ux.md`; user-testing results remain to add.

## Success criteria — progress (see proposal §6 for full list)
| Criterion | Status |
|---|---|
| New user completes an analysis unaided | To verify via `docs/manual-test-plan.md` with 3 testers |
| Analysis is quick (<30 min) | To verify via manual test plan timing |
| Data is trustworthy (sourced + dated) | ⚠️ Provenance/dates and synthetic-demo labels are shown, but NVDA/RR.L financial health, valuation, income-chart values and RR.L analyst snapshot are fabricated UI fixtures. They demonstrate the layout; they do not establish factual accuracy. Yahoo Finance prices may be delayed. |
| Tool is not financial advice | ✅ Disclaimer rendered on every summary, backend-supplied so it can't be removed client-side |

## Decisions this shaped
- Why a fixed section order instead of a flexible/custom one: consistency
  was the #1 stated benefit (proposal §4) — a rigid structure is the point.
- Why multiple sources (FMP, Finnhub, Yahoo Finance) instead of one: no single
  source covers financials, analyst data, and chart prices — see
  `docs/api-schema.md` for the full field-by-field provenance and what we
  verified was/wasn't actually free before building against it.
- Why chart tabs and metric explanations were added: they help people inspect
  historical context and learn terminology without hiding the one-page summary.
- Why the chart feed is described as possibly delayed: Yahoo's public chart
  endpoint is not a guaranteed real-time market-data service.
- Why demo financial values are labeled synthetic: fabricated values can
  illustrate the UI but must not be mistaken for real reported financials.
