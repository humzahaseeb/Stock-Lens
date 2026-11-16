# UX/UI — discipline evidence

Maps to proposal §11.

## User journey
1. Land on Stock Lens → see the name, one-line pitch, and the "not financial
   advice" framing immediately (no digging to find the disclaimer).
2. Either type a ticker or click a worked example (NVDA / Rolls-Royce) — the
   quick-select buttons exist specifically so a first-time user always has a
   guaranteed-working path, per the proposal's "two worked examples" deliverable.
3. See a loading state (`aria-live` region announces "Loading…") — no silent
   waiting.
4. See a Yahoo Finance stock-price chart with 1D, 5D, 1M–Max range controls, quote
   statistics, a timestamp, and a disclosure that the public feed may be delayed.
5. Continue through the fixed one-page sections: Business model (CEO appears
   above the business description), Financial health, annual/quarterly income
   statement, Competitive moat, Valuation, Bull case, Bear case, and analyst
   ratings/12-month forecast.
6. Live metric rows include source/date; synthetic worked-example sections show
   one “Synthetic demo data” source/date footer. These values are illustrative,
   not actual reported financials or analyst data.
7. Missing live chart data shows an error state rather than a fabricated price.

## Visual design evidence
- [Draw.io UX sketch — PNG export](screenshots/ux-design/Copy%20of%20Stock-lens-ux.drawio.png)
- [Editable Draw.io source](screenshots/ux-design/Stock-lens-ux.drawio.drawio)

This is an early rough layout sketch, not a polished visual design. It contains
placeholder text. The user-testing sessions have not yet been completed, so
the sketch should not be described as user-validated.

## UX methods used
- **User journey mapping** — used the flow above to structure the search-to-summary experience.
- **Rapid prototyping** — the working app itself iterated in small steps
  (search → one metric → full sections → polish), rather than a static mockup
  first.
- **Usability testing plan** — see `docs/manual-test-plan.md` for the 3-tester
  prompt and results sheets. The sessions still need to be run and recorded;
  do not describe them as completed before then.
- **Accessibility as a design method, not an afterthought** — semantic
  headings per section (`<h2>` per section, labelled via `aria-labelledby`),
  definition lists for metric label/value pairs, a
  visible focus ring on every interactive element, and an automated axe-core
  scan (`e2e/tests/accessibility.spec.js`); the 15 Nov 2026 scan found 0
  violations. The manual accessibility checklist remains to be completed.

## UI patterns / decisions
- Minimal, single-column summary with a compact stock chart and expandable
  metric definitions — supports learning without adding navigation or hiding
  the research sections.
- **Dark theme** by deliberate choice: card-based sections on a near-black
  background (`frontend/src/index.css`) provides consistent cards across the
  research sections and charts.
  Colour tokens (positive/negative/neutral/info) are reused consistently for
  the analyst-rating pill, auto-generated-data banner, and research-needed
  banner, so colour carries meaning predictably across the whole page.
- Every text/background pairing was checked against WCAG 2.1 AA (4.5:1 for
  normal text) and is enforced by the automated axe-core scan — translucent
  (rgba) backgrounds were deliberately avoided in favour of solid colours,
  since translucency over a gradient page background made contrast
  unreliable to compute (and to guarantee) in the first version of this theme.
- Colour is never the only signal: notices include text and status roles, and
  metric explanations have keyboard-focusable and clickable info controls.
- Errors (`role="alert"`) and loading state (`aria-live="polite"`) are
  programmatically announced, not just visually shown.
- Universal UX principle applied: progressive disclosure isn't used here —
  everything relevant is on one page by design, since the whole point is "one
  page per company" (proposal §1).

## Across platforms
The layout is a single responsive column with no fixed pixel widths, so it
reflows on narrow (mobile) and wide (desktop) viewports without a separate
mobile design. Manual narrow-width and 200% zoom checks are listed in
`docs/manual-test-plan.md`.
