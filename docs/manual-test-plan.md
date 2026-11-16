# Manual & Usability Test Plan — Stock Lens

This is the "by hand" testing evidence (Testing discipline): real people using
the tool while observed, plus an accessibility checklist. Unit tests
(`backend/test`, `frontend/src/test`) and e2e automation (`e2e/tests`) cover
"each part on its own" and "the whole thing, end to end" — see
[docs/testing.md](./testing.md) for how all three types fit together.

## How to run this
1. Run both apps (`backend`: `npm run dev`, `frontend`: `npm run dev`).
2. Find 3 users who haven't seen the tool before (matches success
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
| N1 | Search a known example via the quick-select button | Click "NVIDIA (NVDA)" | Company, price chart, Business model, Financial health, income statement, Competitive moat, Valuation, bull/bear, analyst ratings/forecast and disclaimer render | | |
| N2 | Search a known example by typing the ticker | Type `NVDA`, click Analyse | Same summary as N1 | | |
| N3 | Switch between the two worked examples | View NVDA, then click "Rolls-Royce (RR)" | Rolls-Royce summary shows ticker `RR`, replaces NVDA's, and leaves no stale data | | |
| N4 | Read the disclaimer | View any summary | Tester can correctly restate that it's not financial advice, unprompted | | |
| N5 | Understand data provenance | View live and synthetic sections | Tester can distinguish live/source-dated values from the “Synthetic demo data” footer and explain synthetic figures are not actuals | | |
| N6 | Change stock-chart range | Select 1D, 5D, 1M, 6M, YTD, 1Y, 5Y and Max | Chart reloads; the 5D x-axis uses day/date labels and the price-change caption describes the selected range | | |
| N7 | Switch income-statement period | Select Annual, then Quarterly | Chart bars and period labels update; synthetic source/date appears once in its footer | | |
| N8 | Learn a financial term | Hover, keyboard-focus, and click a metric info control | A concise definition appears and is accessible without a mouse | | |

### Edge cases
| # | Scenario | Steps | Expected result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| E1 | Unknown ticker | Type `ZZZZ`, click Analyse | Clear error message, no crash/blank page | | |
| E2 | Empty submission | Click Analyse with an empty input | Button is disabled / no request sent | | |
| E3 | Lowercase / mixed-case ticker | Type `nvda` | Still resolves to NVDA | | |
| E4 | Invalid characters | Type `NV DA!` | Friendly validation error, not a raw server error | | |
| E5 | Backend unreachable | Stop the backend, then search | Frontend shows an error message, not an infinite spinner | | |
| E6 | Live chart unavailable | Block the Yahoo Finance request or disconnect network, then load a chart | Clear chart error appears; no fabricated stock prices are shown | | |
| E7 | Demo data provenance | View NVDA/RR financial health and valuation | “Synthetic demo data” source/date is visible once at each section bottom and tester understands values are illustrative | | |

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
