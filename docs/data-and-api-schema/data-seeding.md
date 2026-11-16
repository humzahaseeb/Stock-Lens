# Seeding live API fallback snapshots

Stock Lens integrates three market-data providers, but the two worked examples
also use curated overrides. The values currently displayed are a mixture:

- **Financial Modeling Prep (FMP)** — financial health (including trailing free cash flow), valuation, and annual/quarterly income statements
- **Finnhub** — analyst recommendation trends (consensus rating) + insider sentiment
- **Yahoo Finance** — intraday and historical stock-chart prices (may be delayed)

For NVDA and RR, the Financial health, Valuation and income-statement chart
panels currently show synthetic illustrative values instead of company
reported results. RR's analyst ratings and targets are also synthetic. NVDA's
analyst ratings and targets were entered from the user-provided Google Finance
screenshot. These override live/seed values in those sections. Yahoo Finance
supplies the stock-price chart and may delay quotes.

The seeding script writes FMP financial/valuation metrics, quarterly cash flow
and annual/quarterly income statements. FMP is required; Finnhub is optional
and adds consensus/insider sentiment to the seed snapshot. The API can fall
back to those snapshots when live FMP/Finnhub calls fail. Yahoo chart data is
fetched separately and cached briefly; it is not included in the seed files.

```bash
cd backend
FMP_API_KEY=your-fmp-key FINNHUB_API_KEY=your-finnhub-key npm run seed
```

- FMP: sign up free at financialmodelingprep.com
- Finnhub: sign up at finnhub.io/register; omit `FINNHUB_API_KEY` to seed FMP
  data only.

This writes `NVDA.json` and `RR.L.json` with fetched values and their dates.
The overrides still take precedence for the synthetic demo panels described
above, and the UI marks them with a “Synthetic demo data” source/date footer.
Running the seed script does not turn those displayed figures into real
financial results.

## A real limitation worth knowing about: RR and Finnhub
Finnhub's free tier is US-market-focused. Rolls-Royce trades primarily on the
LSE (`RR.L` at the data-source level), so the Finnhub client maps the app's
public `RR` ticker to the US ADR (`RYCEY`). The Rolls-Royce worked example
currently uses its synthetic analyst override instead of live Finnhub
consensus. NVDA's displayed analyst ratings and targets were entered from the
user-provided Google Finance screenshot; they are not refreshed from Finnhub
while the curated override is active.

## Presentation notes
- Describe synthetic figures as illustrative UI demo data, not actual company
  financial results or analyst forecasts.
- NVDA analyst values came from the user-provided Google Finance screenshot;
  verify the specific claims and citations before presenting them as sourced
  research.
- Yahoo Finance chart history and quotes may be delayed; do not call them
  guaranteed real-time data.
- Business model and competitive moat are manually curated qualitative
  content; review their citations and dates.
- Automated suites passed on 15 Nov 2026 (see `docs/testing.md`); dependency
  audits reported zero vulnerabilities on 16 Nov 2026 (see
  `docs/security/risk-register.md`). Three-user usability sessions and the
  manual accessibility checklist are still outstanding.

See [api-schema.md](./api-schema.md) for the full field-by-field provenance table.
