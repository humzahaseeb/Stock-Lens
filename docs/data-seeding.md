# Pinning live data for the two worked examples

Stock Lens fetches financial health + valuation metrics live from Financial
Modeling Prep (FMP) when `FMP_API_KEY` is set. So the NVDA / Rolls-Royce (RR.L)
demo still works reliably in front of judges even if FMP is rate-limited or
down on the day, `backend/scripts/seed.js` pins a snapshot to
`backend/src/data/seedFinancials/*.json`, which the API falls back to
automatically if the live call fails.

**This step needs your own FMP API key** (free tier, sign up at
financialmodelingprep.com) — it can't be done without one. Run it, ideally the
morning of/before your presentation so the dates are fresh:

```bash
cd backend
FMP_API_KEY=your-real-key npm run seed
```

This writes `NVDA.json` and `RR.L.json` with live figures and today's date.
Commit those two files so the fallback snapshot ships with the repo.

## Still to do before presenting (not automatable — your own research)
The manual override files (`backend/src/data/overrides/NVDA.json` and
`RR.L.json`) have `TODO_RESEARCH_REQUIRED` placeholders for:
- Bull case / bear case (your own read of the investment thesis)
- Analyst consensus rating + 12-month price target

Each placeholder has a `researchNote` describing exactly what to fill in, and
expects a real `source` URL + `asOf` date once done — that's the "data is
trustworthy" success criterion from the proposal. These are intentionally
left for you rather than generated, since forming that view yourself is part
of what's being judged.
