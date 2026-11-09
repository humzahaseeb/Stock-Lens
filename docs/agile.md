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

## Backlog (as actually built, in order)
| Card | Status | Notes |
|---|---|---|
| Scaffold monorepo (frontend + backend) + API schema | Done | Defined the contract before building either side, to let both proceed independently |
| Backend: FMP client, manual overrides, unified API route | Done | |
| Backend: unit tests | Done | 14 tests, each part tested separately |
| Frontend: search UI + one-page summary components | Done | |
| Frontend: component tests | Done | 10 tests |
| Reliability: seed/cache fallback for demo tickers | Done (infra) — pending: run `npm run seed` with a real API key before presenting | |
| E2E + accessibility tests (Playwright + axe-core) | Done | 5 tests, 0 WCAG violations detected |
| Manual/usability test plan | Done (plan) — pending: run with 3 real testers | |
| Evidence pack docs | Done | this folder |
| Security hardening pass | Done | see `security/risk-register.md` |
| Root README / runbook | Done | |
| Fill in bull/bear case + analyst consensus for both companies | **Pending — your own research** | flagged `needsResearch: true` in the data files |
| Run manual usability sessions with 3 testers | **Pending — needs real people** | |

## How I planned, tracked and adapted
- Pulled one card at a time, smallest-safe-step order (schema → backend →
  frontend → reliability → tests → docs), so there was always a working,
  testable increment rather than a big-bang integration at the end.
- Adapted scope: analyst consensus/price targets were originally assumed
  available from the free API; once that looked risky in practice, the card
  was split so the architecture change (manual override + "needs research"
  flag) happened immediately rather than being discovered late.

## Retrospective (fill in after the build week)
- What worked well:
- What didn't:
- What I'd do differently with more time: (this feeds proposal/presentation
  section "With more time…")
