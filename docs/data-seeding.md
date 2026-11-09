# Pinning live data for the two worked examples

Stock Lens fetches most of its data live from three APIs:
- **Financial Modeling Prep (FMP)** — financial health (including trailing free cash flow), valuation, and annual/quarterly income statements
- **Finnhub** — analyst recommendation trends (consensus rating) + insider sentiment
- **Yahoo Finance** — intraday and historical stock-chart prices (may be delayed)

So the NVDA / Rolls-Royce (RR.L) demo still works reliably in front of judges
even if either API is rate-limited or down on the day, `backend/scripts/seed.js`
pins a snapshot to `backend/src/data/seedFinancials/*.json`, which the API
falls back to automatically if the live calls fail.

**This step needs your own free API keys** — it can't be done without them.
Run it, ideally the morning of/before your presentation so the dates are fresh:

```bash
cd backend
FMP_API_KEY=your-fmp-key FINNHUB_API_KEY=your-finnhub-key npm run seed
```

- FMP: sign up free at financialmodelingprep.com
- Finnhub: sign up free at finnhub.io/register (`FINNHUB_API_KEY` is optional —
  omit it and the seed script still pins FMP data, just without live analyst
  consensus; the app then falls back to the manual override placeholder for
  that field)

This writes `NVDA.json` and `RR.L.json` with live figures and today's date.
Commit those two files so the fallback snapshot ships with the repo.
The income-statement charts, Financial health panels, and Valuation cards for
these two demos currently use explicitly labeled synthetic overrides instead
of seeded statements or metrics.

## A real limitation worth knowing about: RR.L and Finnhub
Finnhub's free tier is US-market-focused. Rolls-Royce trades primarily on the
LSE (`RR.L`), which has thin-to-no coverage there, so Stock Lens looks up the
US ADR (`RYCEY`) for a live Finnhub lookup. RR.L currently uses the explicitly
labeled synthetic demo consensus in `RR.L.json` instead; it is not presented as
real analyst coverage. NVDA (a heavily-covered US mega-cap) uses the
user-provided Google Finance snapshot.

## Still to do before presenting (genuinely not automatable)
- **Analyst ratings** — pulled live from Finnhub for symbols without a curated
  override; NVDA uses the user-provided Google Finance screenshot and RR.L uses
  clearly labeled synthetic demo data. ✅
- **Bull case / bear case for NVDA** — now filled in with real, human-written
  analysis (see `backend/src/data/overrides/NVDA.json`). ⚠️ **still needs a
  real citation**: it's marked `sourcePending: true` because the specific
  claims (80% AI GPU market share, $126.7bn TTM free cash flow, 59/62
  analysts rating Buy, the Jensen Huang investigation, ~50% hyperscaler
  revenue concentration, 71–72% margin guidance) need a verifiable source
  before submitting — add the exact article/broker note/filing you used, and
  confirm in your proposal's AI declaration table whether any AI tool helped
  research or draft the wording (`aiDeclarationNote` flags this).
- **Bull case / bear case for RR.L** — still auto-generated from live
  financial + analyst data using explainable rules
  (`backend/src/lib/deriveBullBear.js`), or the placeholder if even that data
  is too sparse. Replace with your own human-written thesis the same way you
  did for NVDA, if you want the extra depth there too.
- **12-month price target** — genuinely **not available free anywhere we
  could verify** (Finnhub's price-target endpoint is paid; FMP's equivalent
  is unreliable on the free tier). If you want one, check a broker or
  financial news site yourself and add it to the override file with a real
  source + date
- **Business model / competitive moat** — inherently qualitative judgment
  calls; no API (free or paid) returns these as structured data, so they stay
  manually written

See `docs/api-schema.md` for the full field-by-field provenance table.
