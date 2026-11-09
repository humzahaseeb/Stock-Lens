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

async function getConsensusAndInsiderSentiment(ticker, seed, useManualConsensus = false) {
  const { symbol: finnhubSymbol, note: aliasNote } = resolveFinnhubSymbol(ticker);

  let consensus = null;
  let consensusSource = useManualConsensus ? 'manual-override' : 'live';
  if (!useManualConsensus) {
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

function pickNarrative(override, derived) {
  // Real, human-curated content (needsResearch === false) always wins — it's
  // richer than the auto-derived heuristic bullets. Auto-derived data is the
  // next best thing when there's no human content yet. The placeholder
  // (needsResearch: true) is the last resort so the UI never shows nothing.
  if (override && override.needsResearch === false) return override;
  if (derived) return derived;
  return override ?? null;
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
  let ceo = overrides?.ceo ?? null;
  let ceoSource = null;
  let ceoAsOf = null;
  let marketCap = overrides?.marketCap ?? null;
  let marketCapCurrency = null;
  let marketCapSource = null;
  let marketCapAsOf = null;
  let financialsSource = 'live';

  try {
    const live = await fetchFmpMetrics(ticker);
    financialHealth = live.financialHealth;
    valuation = live.valuation;
    name = live.name || name;
    ceo = live.ceo ?? ceo;
    ceoSource = live.ceoSource ?? null;
    ceoAsOf = live.ceoAsOf ?? null;
    marketCap = live.marketCap ?? marketCap;
    marketCapCurrency = live.marketCapCurrency ?? null;
    marketCapSource = live.marketCapSource ?? null;
    marketCapAsOf = live.marketCapAsOf ?? null;
  } catch (liveError) {
    if (seed) {
      financialHealth = seed.financialHealth;
      valuation = seed.valuation;
      name = seed.name || name;
      ceo = seed.ceo ?? ceo;
      ceoSource = seed.ceoSource ?? null;
      ceoAsOf = seed.ceoAsOf ?? null;
      marketCap =
        seed.marketCap ??
        seed.valuation?.metrics?.find((metric) => metric.label === 'Market cap')?.value ??
        marketCap;
      marketCapCurrency = seed.marketCapCurrency ?? null;
      marketCapSource = seed.marketCapSource ?? null;
      marketCapAsOf = seed.marketCapAsOf ?? null;
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

  const hasCuratedAnalystConsensus = overrides?.analystConsensus?.needsResearch === false;
  const { consensus, consensusSource, insiderSentiment } = await getConsensusAndInsiderSentiment(
    ticker,
    seed,
    hasCuratedAnalystConsensus,
  );
  const analystConsensus = hasCuratedAnalystConsensus
    ? overrides.analystConsensus
    : consensus ?? overrides?.analystConsensus ?? null;
  const analystConsensusSource = overrides?.analystConsensus?.demoData ? 'demo-data' : consensusSource;
  const consensusForDerivation = analystConsensus?.demoData ? null : analystConsensus;

  const derived = deriveBullBear({ financialHealth, valuation, consensus: consensusForDerivation, insiderSentiment });

  return res.json({
    ticker,
    name,
    generatedAt: new Date().toISOString(),
    financialsSource, // 'live' | 'seed-cache' | 'unavailable' — surfaced for transparency/debugging
    consensusSource: analystConsensusSource, // 'live' | 'seed-cache' | 'unavailable' | 'manual-override' | 'demo-data'
    ceo,
    ceoSource,
    ceoAsOf,
    marketCap,
    marketCapCurrency,
    marketCapSource,
    marketCapAsOf,
    peRatio: overrides?.peRatio ?? seed?.peRatio ?? null,
    eps: overrides?.eps ?? seed?.eps ?? null,
    quarterlyDividend: overrides?.quarterlyDividend ?? seed?.quarterlyDividend ?? null,
    businessModel: overrides?.businessModel ?? null,
    financialHealth,
    competitiveMoat: overrides?.competitiveMoat ?? null,
    valuation,
    bullCase: pickNarrative(overrides?.bullCase, derived.bullCase),
    bearCase: pickNarrative(overrides?.bearCase, derived.bearCase),
    analystConsensus,
    insiderSentiment,
    disclaimer: DISCLAIMER,
  });
});

export default router;
