# Agile — discipline evidence

How this build used an Agile process, mapped to proposal §10.

## Process
I worked in a time-boxed sprint and tracked 12 tickets on a Jira board, moving
work through Prioritised, In Progress, and Done. I captured board snapshots to
show progress and adapted the work as data-source limitations became clear.

The Jira board screenshots below document the backlog and status changes over
time. Keep the board accessible to the judges if they need to inspect it.

## Backlog (current implementation status)
| Card | Status | Notes |
|---|---|---|
| Scaffold monorepo (frontend + backend) + API schema | Done | Defined the contract before building either side, to let both proceed independently |
| Backend: FMP/Finnhub clients, Yahoo Finance chart proxy, manual overrides and unified routes | Implemented | Yahoo chart data may be delayed; several worked-example metrics are synthetic fixtures |
| Frontend: search and structured one-page summary | Implemented | CEO is in Business model; metric definitions are available through info controls |
| Frontend: stock-price chart | Implemented | 1D–Max ranges, price change and quote stats |
| Frontend: annual/quarterly income-statement chart | Implemented | Revenue and net income series; NVDA/RR.L chart data is synthetic |
| Financial health and valuation panels | Implemented | NVDA/RR.L values are synthetic demo data; other tickers use live/seed FMP data where available |
| Automated unit, component, e2e and accessibility coverage | Passed  | 40 backend + 27 frontend tests; 5 e2e tests; 0 axe violations |
| Manual/usability test plan | Done (plan) — pending: run with 3 real testers | |
| Evidence-pack documentation | In progress | Board and UX screenshots are linked below and in `docs/ux.md`; real tester evidence and retrospective remain to add |
| Security review/risk register | Documented | Re-check risks and dependency audit before presenting |
| Two worked examples | Implemented with limitations | NVDA and RR.L; synthetic data is illustrative, not factual company financials |
| Run manual usability sessions with 3 testers and record findings | **Pending — needs real people** | |

## Jira board snapshots
- [board created, no cards yet](screenshots/Board/Screenshot%202026-11-14%20at%204.10.30%E2%80%AFam.png)
- [12 work items in the backlog](screenshots/Board/Screenshot%202026-11-14%20at%204.18.21%E2%80%AFam.png)
- [items prioritized on the board](screenshots/Board/Screenshot%202026-11-14%20at%204.19.28%E2%80%AFam.png)
- [cards moved into workflow columns](screenshots/Board/Screenshot%202026-11-14%20at%204.19.43%E2%80%AFam.png)
- [work in progress and completed cards](screenshots/Board/Screenshot%202026-11-14%20at%204.20.03%E2%80%AFam.png)
- [final board with all 12 cards marked done](screenshots/Board/Screenshot%202026-11-14%20at%206.59.03%E2%80%AFpm.png)

## How I planned, tracked and adapted
- Pulled one card at a time, smallest-safe-step order (schema → backend →
  frontend → reliability → tests → docs), so there was always a working,
  testable increment rather than a big-bang integration at the end.
- Adapted scope: analyst consensus/price targets were originally assumed
  available from the free API; once that looked risky in practice, the card
  was split between sourced live data, user-provided data, and synthetic demo
  fixtures. Synthetic metrics remain illustrative and must not be presented as
  actual company results.

## Retrospective
- **What worked well:** Breaking the work into small Jira tickets helped me
  build the summary incrementally. The automated test suites caught issues in
  source handling, chart fixtures and accessibility before the final review.
- **What didn't:** Free data sources did not cover every field reliably, so
  some worked-example values are synthetic. I also did not complete the planned
  three-user usability sessions.
- **What I'd do differently:** Validate API coverage and data quality at the
  start, recruit testers earlier, and reserve time for manual usability and
  accessibility checks before marking evidence work complete.
