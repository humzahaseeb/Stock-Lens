# Product — discipline evidence

How product thinking shaped Stock Lens, mapped to the proposal's Product
section (10) and success criteria (6).

## Problem & user
See proposal §2–3. One-line version: everyday investors have to piece
research together from several different sites/mediums and tend to fixate on
one signal (e.g. an analyst Buy rating) while missing the rest. Stock Lens
gives a single, consistently-structured page per company instead.

## MVP scope — must-have vs nice-to-have
| Must-have (MVP) | Nice-to-have (out of scope for the sprint) |
|---|---|
| One ticker search → one-page summary | Multi-company side-by-side comparison |
| All 6 content sections (business model, financial health, moat, valuation, bull/bear, analyst consensus), each sourced + dated | Historical charts / trend lines |
| 2 fully worked examples (NVDA, Rolls-Royce) | User accounts / saved companies |
| Clear "not financial advice" disclaimer | Live price updates / websockets |
| Accessible, keyboard-navigable UI | Multiple analyst-source aggregation |
| Graceful handling of unknown tickers / API failure | Internationalisation |

Reasoning for the cut: the proposal's own deliverables (two worked examples,
not a general-purpose live product) and the "finish something" rule mean
depth on one ticker flow matters more than breadth of features.

## Prioritised backlog (mirrors the Agile kanban board)
1. API contract (`docs/api-schema.md`) — defined first so frontend/backend
   could be built against a stable shape.
2. Backend: FMP live client + manual overrides + merge route.
3. Frontend: search + one-page summary UI, accessible by default.
4. Reliability: seed/cache fallback so the demo works without live network.
5. Testing: unit → e2e → manual/accessibility (in that order, cheapest first).
6. Evidence pack docs (this folder).

## Success criteria — progress (see proposal §6 for full list)
| Criterion | Status |
|---|---|
| New user completes an analysis unaided | To verify via `docs/manual-test-plan.md` with 3 testers |
| Analysis is quick (<30 min) | To verify via manual test plan timing |
| Data is trustworthy (sourced + dated) | ✅ Every metric/narrative field carries `source` + `asOf`; fields not yet researched are explicitly flagged rather than silently blank |
| Tool is not financial advice | ✅ Disclaimer rendered on every summary, backend-supplied so it can't be removed client-side |

## Decisions this shaped
- Why a fixed 7-section layout instead of a flexible/custom one: consistency
  was the #1 stated benefit (proposal §4) — a rigid structure is the point.
- Why a combination of two free APIs (FMP + Finnhub) instead of one: no single
  free API covers financials, valuation, *and* analyst consensus — see
  `docs/api-schema.md` for the full field-by-field provenance and what we
  verified was/wasn't actually free before building against it.
- Why bull/bear case is auto-generated from data rather than manually written
  or AI-invented: no free API provides genuine analyst-written thesis prose,
  and inventing one (by hand or by AI) would fail the "data is trustworthy"
  criterion. Deriving it from real, cited numbers keeps every claim
  traceable — see `backend/src/lib/deriveBullBear.js`.
- Why the 12-month price target stays blank rather than guessed: verified
  (via Finnhub's own API spec) that this specific data point requires a paid
  plan everywhere we checked — showing an honest "not available" beats a
  plausible-looking but fabricated number.
