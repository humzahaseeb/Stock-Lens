# Pinning live data for the two worked examples

Stock Lens fetches most of its data live from three APIs:
- **Financial Modeling Prep (FMP)** — financial health (including trailing free cash flow), valuation, and annual/quarterly income statements
- **Finnhub** — analyst recommendation trends (consensus rating) + insider sentiment
- **Yahoo Finance** — intraday and historical stock-chart prices (may be delayed)

The seeding script can write FMP financial/valuation metrics, quarterly cash
flow and annual/quarterly income statements, plus Finnhub consensus/insider
sentiment when a key is available. The API can use these seed snapshots if
live FMP/Finnhub calls fail. Yahoo chart data is fetched separately and cached
briefly; it is not included in the seed files.

**This step needs your own free API keys** — it can't be done without them.
Run it, ideally the morning of/before your presentation so the dates are fresh:

```bash
cd backend
FMP_API_KEY=your-fmp-key FINNHUB_API_KEY=your-finnhub-key npm run seed
```

- FMP: sign up free at financialmodelingprep.com
- Finnhub: sign up free at finnhub.io/register (`FINNHUB_API_KEY` is optional —
  omit it and the script still pins FMP data, without live consensus. NVDA and
  RR.L curated analyst overrides continue to take precedence in the worked
  examples.

This writes `NVDA.json` and `RR.L.json` with fetched values and their dates.
The committed demo overrides currently take precedence for selected worked-
example fields, so running the seed script does not make all demo panels real.
In particular, both examples use synthetic Financial health, Valuation, and
income-statement chart fixtures. RR.L analyst ratings/targets are also
synthetic. These have a “Synthetic demo data” source/date footer and are not
actual reported results or analyst forecasts.

## A real limitation worth knowing about: RR.L and Finnhub
Finnhub's free tier is US-market-focused. Rolls-Royce trades primarily on the
LSE (`RR.L`), so the Finnhub client maps it to the US ADR (`RYCEY`). The RR.L
worked example currently uses its synthetic analyst override instead of live
Finnhub consensus. NVDA's displayed analyst ratings and targets were entered
from the user-provided Google Finance screenshot; they are not refreshed from
Finnhub while the curated override is active.

## Before presenting
- Verify each manually entered rating, forecast and narrative claim against a
  source that directly supports it; a homepage link or screenshot label may
  not substantiate every claim.
- Decide whether to replace synthetic financial-health, valuation and
  income-statement values with actual reported values. If retained, describe
  them only as UI demo fixtures.
- Yahoo Finance chart history and current quotes may be delayed; do not promise
  real-time exchange data.
- Business model and competitive moat are qualitative and remain manually
  curated; review their citations and dates.
- Run the three usability sessions and current automated tests; see
  `docs/manual-test-plan.md` and `docs/testing.md`.

See `docs/api-schema.md` for the full field-by-field provenance table.
