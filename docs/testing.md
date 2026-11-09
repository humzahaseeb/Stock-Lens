# Testing — discipline evidence

Maps to proposal §13 and the "evidence · the minimum per discipline" slide
(unit, e2e automation, manual — plus accessibility as "beyond the obvious").

## Each part on its own (unit tests)
- **Backend** (`backend/test`, run via `cd backend && npm test`): covers FMP
  metrics, annual/quarterly income statements, trailing free cash flow, Yahoo
  chart normalization/ranges, Finnhub parsing, route validation, provenance,
  and override/fallback behavior.
- **Frontend** (`frontend/src/test`, run via `cd frontend && npm test`): covers
  search/summary sections, financial metric tooltips, analyst/forecast cards,
  annual/quarterly chart switching, and stock-chart states/ranges.

The previously recorded 39/39 unit-test pass predates recent stock-chart,
financial-chart, synthetic-demo-data, and UI changes. **Current code has not
been rerun through the test suites**, so that result is historical, not a
verification of the current revision.

## The whole thing, end to end (automation)
`e2e/tests/workflow.spec.js` (Playwright, run via `cd e2e && npm test`):
search workflow for both examples, company summary/stock-chart headings,
disclaimer, and unknown-ticker handling.

The previously recorded 5/5 e2e pass also predates the latest UI changes and
must be rerun before claiming the current build passes.

## By hand (manual / real people)
`docs/manual-test-plan.md` — a written test plan with normal + edge-case test
cases and a fixed task prompt, to be run with 3 real testers before
presenting. **Not yet executed — this requires real people and is your job,
not something that can be automated or faked.**

## Beyond the obvious (accessibility)
`e2e/tests/accessibility.spec.js` — automated axe-core/WCAG scan on both the
empty search screen and a fully-rendered summary. The historical baseline
reported 0 violations; rerun it against the current UI. This is paired with the
manual accessibility checklist in `docs/manual-test-plan.md` (keyboard-only
flow, screen reader, contrast, zoom) since automated scans don't catch
everything.

## Known gaps to close before presenting
- [ ] Run current backend, frontend and e2e suites and record actual results
- [ ] Run the manual usability sessions (3 testers) and record results
- [ ] Complete the manual keyboard, screen-reader, contrast and zoom checklist
- [ ] Re-run `npm audit` in all three apps close to the presentation date
- [ ] Replace or clearly present synthetic NVDA/RR.L financial and valuation
      fixtures as illustrative UI data, not actual company results
- [ ] Verify manual citations and dates for analyst/narrative content
- [ ] Check Yahoo quote delay/availability and explain that it is not guaranteed
      real-time
