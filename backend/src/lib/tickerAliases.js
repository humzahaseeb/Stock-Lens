/**
 * Finnhub's free tier is US-market-focused: analyst recommendation trends
 * and insider sentiment have thin or no coverage for non-US primary
 * listings. For tickers we know have a US ADR with real coverage, we look
 * up the ADR's data instead and label it clearly as such in the response —
 * better than silently showing nothing for a company that does have real,
 * free analyst data available, just under a different symbol.
 */
export const FINNHUB_TICKER_ALIASES = {
  'RR.L': { symbol: 'RYCEY', note: 'Shown for the Rolls-Royce US ADR (RYCEY) — Finnhub\'s free tier has limited LSE coverage.' },
};

export function resolveFinnhubSymbol(ticker) {
  return FINNHUB_TICKER_ALIASES[ticker] ?? { symbol: ticker, note: null };
}
