# Stock Lens — API Response Schema

`GET /api/company/:ticker` returns one JSON object: a one-page company summary.
Every data point is wrapped with its **source** and **asOf** (last-checked) date so a
user can judge how fresh it is — this is the core trust mechanism of the product
(see proposal success criterion: "the data is trustworthy").

```jsonc
{
  "ticker": "NVDA",
  "name": "NVIDIA Corporation",
  "generatedAt": "2026-11-09T12:00:00.000Z",

  "businessModel": {
    "summary": "Plain-English description of how the company makes money.",
    "source": "https://...",
    "asOf": "2026-11-01"
  },

  "financialHealth": {
    "metrics": [
      { "label": "Revenue (TTM)", "value": "...", "source": "FMP", "asOf": "2026-11-09" },
      { "label": "Net margin", "value": "...", "source": "FMP", "asOf": "2026-11-09" },
      { "label": "Debt / Equity", "value": "...", "source": "FMP", "asOf": "2026-11-09" }
    ]
  },

  "competitiveMoat": {
    "summary": "Narrative description of durable advantages.",
    "source": "https://...",
    "asOf": "2026-11-01"
  },

  "valuation": {
    "metrics": [
      { "label": "P/E (TTM)", "value": "...", "source": "FMP", "asOf": "2026-11-09" },
      { "label": "EPS (TTM)", "value": "...", "source": "FMP", "asOf": "2026-11-09" },
      { "label": "Market cap", "value": "...", "source": "FMP", "asOf": "2026-11-09" }
    ]
  },

  "bullCase": {
    "points": ["...", "..."],
    "source": "https://...",
    "asOf": "2026-11-01"
  },

  "bearCase": {
    "points": ["...", "..."],
    "source": "https://...",
    "asOf": "2026-11-01"
  },

  "analystConsensus": {
    "rating": "Buy | Hold | Sell",
    "priceTarget12m": "...",
    "currency": "USD",
    "source": "https://...",
    "asOf": "2026-11-01"
  },

  "disclaimer": "This is for informational purposes only and is not financial advice. Capital at risk — do your own research before investing."
}
```

## Field provenance

| Section | Source | Notes |
|---|---|---|
| `financialHealth`, `valuation` | Financial Modeling Prep (live, free tier) | Cached server-side (see `backend/src/lib/cache.js`) to respect rate limits and keep `asOf` accurate. |
| `businessModel`, `competitiveMoat`, `bullCase`, `bearCase`, `analystConsensus` | Manually curated, per company (`backend/src/data/overrides/*.json`) | FMP's free tier does not reliably expose analyst consensus/price targets, and narrative fields need human judgement. Each entry is dated and sourced by hand. |

## Error responses
`GET /api/company/:ticker` returns `404` with `{ "error": "..." }` if the ticker is
unknown to both FMP and the manual overrides, and `400` if the ticker fails input
validation (must be 1–10 uppercase letters/dots, e.g. `NVDA`, `RR.L`).
