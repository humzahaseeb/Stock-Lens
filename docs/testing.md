# Testing — discipline evidence

Maps to proposal §13 and the "evidence · the minimum per discipline" slide
(unit, e2e automation, manual — plus accessibility as "beyond the obvious").

## Each part on its own (unit tests)
- **Backend** (`backend/test`, run via `cd backend && npm test`): 14 tests —
  FMP response parsing, provenance (`source`/`asOf`) on every metric, overrides
  loading/merging, route validation (400/404 paths), live-vs-seed-cache
  fallback behaviour.
- **Frontend** (`frontend/src/test`, run via `cd frontend && npm test`): 10
  tests — `NarrativeCard` (filled-in / needs-research / missing states),
  `MetricList` (populated / empty), `CompanySummary` (all 7 sections render),
  `App` (search → render workflow, error handling).

Latest local run: **24/24 unit tests passing** (14 backend + 10 frontend).

## The whole thing, end to end (automation)
`e2e/tests/workflow.spec.js` (Playwright, run via `cd e2e && npm test`):
full user workflow for both worked examples (NVDA, Rolls-Royce) — search,
render all 7 sections, disclaimer visible — plus an unknown-ticker error path.

Latest local run: **5/5 e2e tests passing** (3 workflow + 2 accessibility,
see below).

## By hand (manual / real people)
`docs/manual-test-plan.md` — a written test plan with normal + edge-case test
cases and a fixed task prompt, to be run with 3 real testers before
presenting. **Not yet executed — this requires real people and is your job,
not something that can be automated or faked.**

## Beyond the obvious (accessibility)
`e2e/tests/accessibility.spec.js` — automated axe-core/WCAG scan on both the
empty search screen and a fully-rendered summary. Latest run: **0 violations
detected** on either screen. This is paired with the manual accessibility
checklist in `docs/manual-test-plan.md` (keyboard-only flow, screen reader,
contrast, zoom) since automated scans don't catch everything.

## Known gaps to close before presenting
- [ ] Run the manual usability sessions (3 testers) and record results
- [ ] Re-run `npm audit` in all three apps close to the presentation date
- [ ] Re-run `npm run seed` (backend) with a real FMP key so seed-cache dates are fresh
