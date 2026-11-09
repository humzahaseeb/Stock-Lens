# UX/UI — discipline evidence

Maps to proposal §11. Required: visual examples of design thinking plus
typical UX methods (wireframing alone isn't enough — this covers more).

## User journey
1. Land on Stock Lens → see the name, one-line pitch, and the "not financial
   advice" framing immediately (no digging to find the disclaimer).
2. Either type a ticker or click a worked example (NVDA / Rolls-Royce) — the
   quick-select buttons exist specifically so a first-time user always has a
   guaranteed-working path, per the proposal's "two worked examples" deliverable.
3. See a loading state (`aria-live` region announces "Loading…") — no silent
   waiting.
4. Land on a single scrollable page with a fixed section order: business
   model → financial health → moat → valuation → bull case → bear case →
   analyst consensus. Same order every time, so repeat use builds familiarity
   (the proposal's "Consistency" benefit).
5. Every figure shows its source + date inline, right next to the value —
   not hidden in a tooltip/footnote, so trust-checking needs zero extra clicks.
6. Fields not yet researched show an explicit amber "research needed" notice
   instead of blank space or fabricated content — honest incompleteness
   rather than a misleading-looking page.

_(Attach your own rough sketches / wireframe photos or a Miro export here —
a scanned napkin sketch of the section order counts.)_

## UX methods used
- **User journey mapping** — the flow above, mapped before any UI was built.
- **Rapid prototyping** — the working app itself iterated in small steps
  (search → one metric → full sections → polish), rather than a static mockup
  first.
- **Usability testing** — see `docs/manual-test-plan.md`: 3 testers, observed,
  timed, with a fixed task prompt.
- **Accessibility as a design method, not an afterthought** — semantic
  headings per section (`<h2>` per section, labelled via `aria-labelledby`),
  a single `<dl>` for metrics (so screen readers get label/value pairs), a
  visible focus ring on every interactive element, and an automated axe-core
  scan in CI (`e2e/tests/accessibility.spec.js`) with 0 violations found.

## UI patterns / decisions
- Minimal, single-column layout — "highlight the most important info first,
  keep things minimal" (your own stated design principle). No navigation
  chrome, no decorative imagery competing with the data.
- **Dark theme** by deliberate choice: card-based sections on a near-black
  background (`frontend/src/index.css`) reduce visual noise across a 7-section
  page and make source/date metadata recede appropriately while content pops.
  Colour tokens (positive/negative/neutral/info) are reused consistently for
  the analyst-rating pill, auto-generated-data banner, and research-needed
  banner, so colour carries meaning predictably across the whole page.
- Every text/background pairing was checked against WCAG 2.1 AA (4.5:1 for
  normal text) and is enforced by the automated axe-core scan — translucent
  (rgba) backgrounds were deliberately avoided in favour of solid colours,
  since translucency over a gradient page background made contrast
  unreliable to compute (and to guarantee) in the first version of this theme.
- Colour is never the only signal: the "research needed" notice uses an
  icon (⚠) + text + a `role="status"`, the auto-generated notice uses 🤖 + a
  `role="status"`, not just a background colour.
- Errors (`role="alert"`) and loading state (`aria-live="polite"`) are
  programmatically announced, not just visually shown.
- Universal UX principle applied: progressive disclosure isn't used here —
  everything relevant is on one page by design, since the whole point is "one
  page per company" (proposal §1).

## Across platforms
The layout is a single responsive column with no fixed pixel widths, so it
reflows on narrow (mobile) and wide (desktop) viewports without a separate
mobile design; verify this manually and note any issues found before
presenting.
