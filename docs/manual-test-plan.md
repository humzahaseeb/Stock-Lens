# Manual & Usability Test Plan — Stock Lens

This is the "by hand" testing evidence (Testing discipline): real people using
the tool while observed, plus an accessibility checklist. Unit tests
(`backend/test`, `frontend/src/test`) and e2e automation (`e2e/tests`) cover
"each part on its own" and "the whole thing, end to end" — see
[docs/testing.md](./testing.md) for how all three types fit together.

## How to run this
1. Run both apps (`backend`: `npm run dev`, `frontend`: `npm run dev`).
2. Recruit 3 testers who haven't seen the tool before (matches success
   criterion: "a new user completes a company analysis without any help").
3. Sit with each tester, give them **only** the opening task prompt below, and
   fill in one copy of the results table per tester. Don't help unless they're
   completely stuck — note it if you do.
4. Time them. Success criterion: completes the task, understands what the
   data means, in under 30 minutes.

## Opening task prompt (read aloud / give in writing)
> "This tool helps research a company before investing. Please look up
> NVIDIA, and tell me: what does the business do, is it financially healthy,
> and what do analysts think of it? Talk out loud as you go."

## Test cases

### Normal scenarios
| # | Scenario | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| N1 | Search a known example via the quick-select button | Click "NVIDIA (NVDA)" | Full summary renders with all 7 sections + disclaimer | | |
| N2 | Search a known example by typing the ticker | Type `NVDA`, click Analyse | Same summary as N1 | | |
| N3 | Switch between the two worked examples | View NVDA, then click "Rolls-Royce (RR.L)" | Rolls-Royce summary replaces NVDA's, no stale data left on screen | | |
| N4 | Read the disclaimer | View any summary | Tester can correctly restate that it's not financial advice, unprompted | | |
| N5 | Understand data freshness | View any metric | Tester notices/explains the source + date shown next to each figure | | |

### Edge cases
| # | Scenario | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| E1 | Unknown ticker | Type `ZZZZ`, click Analyse | Clear error message, no crash/blank page | | |
| E2 | Empty submission | Click Analyse with an empty input | Button is disabled / no request sent | | |
| E3 | Lowercase / mixed-case ticker | Type `nvda` | Still resolves to NVDA | | |
| E4 | Invalid characters | Type `NV DA!` | Friendly validation error, not a raw server error | | |
| E5 | Backend unreachable | Stop the backend, then search | Frontend shows an error message, not an infinite spinner | | |
| E6 | Field still needs research | View bull/bear case or analyst consensus before you've filled them in | Tester sees an obvious "research needed" notice, not blank/broken content | | |

## Accessibility checklist (manual, alongside the axe-core automated scan)
- [ ] Full flow completable using keyboard only (Tab/Shift+Tab/Enter), with a visible focus ring at every step
- [ ] Screen reader (VoiceOver/NVDA) announces the page title, section headings, and loading/error states
- [ ] Text has sufficient colour contrast (spot-check disclaimer banner and research-needed banner)
- [ ] Page remains usable at 200% browser zoom
- [ ] No content relies on colour alone to convey meaning (e.g. the "needs research" warning has an icon + text, not just a colour)

## Recording results
For each tester, record: completion time, task success (Y/N), any point they
got stuck, and a direct quote if useful. Keep this evidence (notes, screen
recording, or screenshots) for the final presentation's Testing section.
