# Agile — discipline evidence

How this build used an Agile process, mapped to proposal §10.

## Process
Kanban, not scrum (no fixed-length iterations inside the single build week —
a continuous pull-based flow fit better for a solo, short sprint).

**Columns**: Backlog → In Progress → Done (plus a Blocked column for anything
waiting on something outside the repo, e.g. your own analyst research).

> ⚠ This repo's commit history and the todo list below are a **supporting
> record** of the work — they are not a substitute for your real kanban board
> (e.g. Jira, as noted in the proposal). Take screenshots of your actual board
> over time for the Agile evidence pack; recreate/import these cards there.

## Backlog (current implementation status)
| Card | Status | Notes |
|---|---|---|
| Scaffold monorepo (frontend + backend) + API schema | Done | Defined the contract before building either side, to let both proceed independently |
| Backend: FMP/Finnhub clients, Yahoo Finance chart proxy, manual overrides and unified routes | Implemented | Yahoo chart data may be delayed; several worked-example metrics are synthetic fixtures |
| Frontend: search and structured one-page summary | Implemented | CEO is in Business model; metric definitions are available through info controls |
| Frontend: stock-price chart | Implemented | 1D–Max ranges, price change and quote stats |
| Frontend: annual/quarterly income-statement chart | Implemented | Revenue and net income series; NVDA/RR.L chart data is synthetic |
| Financial health and valuation panels | Implemented | NVDA/RR.L values are synthetic demo data; other tickers use live/seed FMP data where available |
| Automated unit, component, e2e and accessibility coverage | Tests exist; latest changes not rerun | Recent chart/demo-data changes need regression runs before presenting |
| Manual/usability test plan | Done (plan) — pending: run with 3 real testers | |
| Evidence-pack documentation | In progress | Docs updated to describe current implementation; attach actual evidence artifacts |
| Security review/risk register | Documented | Re-check risks and dependency audit before presenting |
| Two worked examples | Implemented with limitations | NVDA and RR.L; synthetic data is illustrative, not factual company financials |
| Capture actual Agile board screenshots and complete retrospective | **Pending — needs owner input** | Do not invent board history or retrospective findings |

## How I planned, tracked and adapted
- Pulled one card at a time, smallest-safe-step order (schema → backend →
  frontend → reliability → tests → docs), so there was always a working,
  testable increment rather than a big-bang integration at the end.
- Adapted scope: analyst consensus/price targets were originally assumed
  available from the free API; once that looked risky in practice, the card
  was split between sourced live data, user-provided data, and synthetic demo
  fixtures. Synthetic metrics remain illustrative and must not be presented as
  actual company results.

## Retrospective (fill in after the build week)
- What worked well: _Fill in from your own experience._
- What didn't: _Fill in from your own experience._
- What I'd do differently with more time: _Fill in from your own experience._
