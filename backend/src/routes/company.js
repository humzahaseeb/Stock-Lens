import { Router } from 'express';
import { fetchFmpMetrics } from '../lib/fmpClient.js';
import { loadOverrides } from '../lib/overridesLoader.js';
import { loadSeedFinancials } from '../lib/seedFinancials.js';

const router = Router();

const TICKER_PATTERN = /^[A-Z0-9.]{1,10}$/;

const DISCLAIMER =
  'This is for informational purposes only and is not financial advice. ' +
  'Capital at risk — do your own research before investing.';

router.get('/company/:ticker', async (req, res) => {
  const ticker = String(req.params.ticker || '').toUpperCase();

  if (!TICKER_PATTERN.test(ticker)) {
    return res.status(400).json({
      error: 'Invalid ticker. Use 1-10 characters: letters, digits or a dot (e.g. NVDA, RR.L).',
    });
  }

  const overrides = await loadOverrides(ticker);

  let financialHealth;
  let valuation;
  let name = overrides?.name || ticker;
  let financialsSource = 'live';

  try {
    const live = await fetchFmpMetrics(ticker);
    financialHealth = live.financialHealth;
    valuation = live.valuation;
    name = live.name || name;
  } catch (liveError) {
    const seed = loadSeedFinancials(ticker);
    if (seed) {
      financialHealth = seed.financialHealth;
      valuation = seed.valuation;
      name = seed.name || name;
      financialsSource = 'seed-cache';
    } else if (!overrides) {
      return res.status(404).json({
        error: `No data available for ${ticker}: live fetch failed (${liveError.message}) and no seed/override data exists.`,
      });
    } else {
      financialHealth = { metrics: [] };
      valuation = { metrics: [] };
      financialsSource = 'unavailable';
    }
  }

  if (!overrides && financialsSource === 'unavailable') {
    return res.status(404).json({ error: `Unknown ticker: ${ticker}` });
  }

  return res.json({
    ticker,
    name,
    generatedAt: new Date().toISOString(),
    financialsSource, // 'live' | 'seed-cache' | 'unavailable' — surfaced for transparency/debugging
    businessModel: overrides?.businessModel ?? null,
    financialHealth,
    competitiveMoat: overrides?.competitiveMoat ?? null,
    valuation,
    bullCase: overrides?.bullCase ?? null,
    bearCase: overrides?.bearCase ?? null,
    analystConsensus: overrides?.analystConsensus ?? null,
    disclaimer: DISCLAIMER,
  });
});

export default router;
