import { Router } from 'express';
import { fetchFmpMetrics } from '../lib/fmpClient.js';
import { loadOverrides } from '../lib/overridesLoader.js';
import { loadSeedFinancials } from '../lib/seedFinancials.js';
import { fetchAnalystConsensus, fetchInsiderSentiment } from '../lib/finnhubClient.js';
import { resolveFinnhubSymbol } from '../lib/tickerAliases.js';
import { deriveBullBear } from '../lib/deriveBullBear.js';

const router = Router();

const TICKER_PATTERN = /^[A-Z0-9.]{1,10}$/;

const DISCLAIMER =
  'This is for informational purposes only and is not financial advice. ' +
  'Capital at risk — do your own research before investing.';

async function getConsensusAndInsiderSentiment(ticker, seed) {
  const { symbol: finnhubSymbol, note: aliasNote } = resolveFinnhubSymbol(ticker);

  let consensus = null;
  let consensusSource = 'live';
  try {
    consensus = await fetchAnalystConsensus(finnhubSymbol);
    if (!consensus) {
      consensusSource = 'unavailable'; // Finnhub has no coverage for this symbol
    }
  } catch {
    if (seed?.consensus) {
      consensus = seed.consensus;
      consensusSource = 'seed-cache';
    } else {
      consensusSource = 'unavailable';
    }
  }
  if (consensus && aliasNote) {
    consensus = { ...consensus, aliasNote };
  }

  let insiderSentiment = null;
  try {
    insiderSentiment = await fetchInsiderSentiment(finnhubSymbol);
  } catch {
    insiderSentiment = seed?.insiderSentiment ?? null;
  }

  return { consensus, consensusSource, insiderSentiment };
}

router.get('/company/:ticker', async (req, res) => {
  const ticker = String(req.params.ticker || '').toUpperCase();

  if (!TICKER_PATTERN.test(ticker)) {
    return res.status(400).json({
      error: 'Invalid ticker. Use 1-10 characters: letters, digits or a dot (e.g. NVDA, RR.L).',
    });
  }

  const overrides = await loadOverrides(ticker);
  const seed = loadSeedFinancials(ticker);

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

  const { consensus, consensusSource, insiderSentiment } = await getConsensusAndInsiderSentiment(ticker, seed);

  const derived = deriveBullBear({ financialHealth, valuation, consensus, insiderSentiment });

  return res.json({
    ticker,
    name,
    generatedAt: new Date().toISOString(),
    financialsSource, // 'live' | 'seed-cache' | 'unavailable' — surfaced for transparency/debugging
    consensusSource, // 'live' | 'seed-cache' | 'unavailable'
    businessModel: overrides?.businessModel ?? null,
    financialHealth,
    competitiveMoat: overrides?.competitiveMoat ?? null,
    valuation,
    bullCase: derived.bullCase ?? overrides?.bullCase ?? null,
    bearCase: derived.bearCase ?? overrides?.bearCase ?? null,
    analystConsensus: consensus ?? overrides?.analystConsensus ?? null,
    insiderSentiment,
    disclaimer: DISCLAIMER,
  });
});

export default router;
