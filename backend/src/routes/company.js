import { Router } from 'express';
import { fetchFmpFreeCashFlowTTM, fetchFmpIncomeStatements, fetchFmpMetrics } from '../lib/fmpClient.js';
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

function resolveIncomeStatements(result, seededStatements) {
  if (result.status === 'fulfilled') return result.value;
  if (Array.isArray(seededStatements?.data) && seededStatements.data.length > 0) {
    return {
      ...seededStatements,
      source: seededStatements.source || 'Seeded financial snapshot',
    };
  }
  const reason = result.reason;
  return {
    data: [],
    source: null,
    asOf: null,
    error: reason instanceof Error ? reason.message : String(reason),
  };
}

function addFreeCashFlowMetric(financialHealth, result) {
  if (financialHealth?.demoData) return financialHealth;
  const metrics = Array.isArray(financialHealth?.metrics) ? financialHealth.metrics : [];
  if (result.status === 'fulfilled') {
    return {
      ...financialHealth,
      metrics: [...metrics.filter((metric) => metric.label !== result.value.label), result.value],
    };
  }
  if (metrics.some((metric) => metric.label === 'Free cash flow (TTM)')) return financialHealth;
  const reason = result.reason;
  return {
    ...financialHealth,
    note: `Free cash flow (TTM) is unavailable: ${reason instanceof Error ? reason.message : String(reason)}`,
  };
}

function getIncomeStatementPromise(ticker, period, override) {
  if (override?.demoData) return Promise.resolve(override);
  return fetchFmpIncomeStatements(ticker, period);
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
  const hasDemoFinancialHealth = overrides?.financialHealth?.demoData === true;
  const hasDemoValuation = overrides?.valuation?.demoData === true;

  let financialHealth;
  let valuation;
  let name = overrides?.name || ticker;
  let ceo = overrides?.ceo ?? null;
  let ceoSource = null;
  let ceoAsOf = null;
  let marketCap = overrides?.marketCap ?? null;
  let marketCapCurrency = overrides?.marketCapCurrency ?? null;
  let marketCapSource = overrides?.marketCapSource ?? null;
  let marketCapAsOf = overrides?.marketCapAsOf ?? null;
  let financialsSource = 'live';
  let financialHealthSource = 'live';
  let valuationSource = 'live';

  try {
    const live = await fetchFmpMetrics(ticker);
    financialHealth = hasDemoFinancialHealth ? overrides.financialHealth : live.financialHealth;
    financialHealthSource = hasDemoFinancialHealth ? 'demo-data' : 'live';
    valuation = hasDemoValuation ? overrides.valuation : live.valuation;
    valuationSource = hasDemoValuation ? 'demo-data' : 'live';
    name = live.name || name;
    ceo = live.ceo ?? ceo;
    ceoSource = live.ceoSource ?? null;
    ceoAsOf = live.ceoAsOf ?? null;
    if (hasDemoValuation) {
      marketCap = overrides.marketCap ?? live.marketCap ?? marketCap;
      marketCapCurrency = overrides.marketCapCurrency ?? live.marketCapCurrency ?? null;
      marketCapSource = overrides.marketCapSource ?? 'Synthetic demo data';
      marketCapAsOf = overrides.marketCapAsOf ?? overrides.valuation.asOf ?? null;
    } else {
      marketCap = live.marketCap ?? marketCap;
      marketCapCurrency = live.marketCapCurrency ?? null;
      marketCapSource = live.marketCapSource ?? null;
      marketCapAsOf = live.marketCapAsOf ?? null;
    }
  } catch (liveError) {
    if (seed) {
      financialHealth = hasDemoFinancialHealth ? overrides.financialHealth : seed.financialHealth;
      financialHealthSource = hasDemoFinancialHealth ? 'demo-data' : 'seed-cache';
      valuation = hasDemoValuation ? overrides.valuation : seed.valuation;
      valuationSource = hasDemoValuation ? 'demo-data' : 'seed-cache';
      name = seed.name || name;
      ceo = seed.ceo ?? ceo;
      ceoSource = seed.ceoSource ?? null;
      ceoAsOf = seed.ceoAsOf ?? null;
      marketCap =
        (hasDemoValuation ? overrides.marketCap : seed.marketCap) ??
        (hasDemoValuation ? null : seed.valuation?.metrics?.find((metric) => metric.label === 'Market cap')?.value) ??
        marketCap;
      marketCapCurrency = hasDemoValuation
        ? (overrides.marketCapCurrency ?? null)
        : (seed.marketCapCurrency ?? null);
      marketCapSource = hasDemoValuation
        ? (overrides.marketCapSource ?? 'Synthetic demo data')
        : (seed.marketCapSource ?? null);
      marketCapAsOf = hasDemoValuation
        ? (overrides.marketCapAsOf ?? overrides.valuation.asOf ?? null)
        : (seed.marketCapAsOf ?? null);
      financialsSource = 'seed-cache';
    } else if (!overrides) {
      return res.status(404).json({
        error: `No data available for ${ticker}: live fetch failed (${liveError.message}) and no seed/override data exists.`,
      });
    } else {
      financialHealth = hasDemoFinancialHealth ? overrides.financialHealth : { metrics: [] };
      financialHealthSource = hasDemoFinancialHealth ? 'demo-data' : 'unavailable';
      valuation = hasDemoValuation ? overrides.valuation : { metrics: [] };
      valuationSource = hasDemoValuation ? 'demo-data' : 'unavailable';
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
  const financialHealthForDerivation = financialHealth?.demoData ? { metrics: [] } : financialHealth;
  const valuationForDerivation = valuation?.demoData ? { metrics: [] } : valuation;

  const derived = deriveBullBear({
    financialHealth: financialHealthForDerivation,
    valuation: valuationForDerivation,
    consensus: consensusForDerivation,
    insiderSentiment,
  });
  const freeCashFlowRequest = hasDemoFinancialHealth ? Promise.resolve(null) : fetchFmpFreeCashFlowTTM(ticker);
  const [annualStatementsResult, quarterlyStatementsResult, freeCashFlowResult] = await Promise.allSettled([
    getIncomeStatementPromise(ticker, 'annual', overrides?.incomeStatements?.annual),
    getIncomeStatementPromise(ticker, 'quarterly', overrides?.incomeStatements?.quarterly),
    freeCashFlowRequest,
  ]);
  financialHealth = addFreeCashFlowMetric(financialHealth, freeCashFlowResult);
  const incomeStatements = {
    annual: resolveIncomeStatements(annualStatementsResult, seed?.incomeStatements?.annual),
    quarterly: resolveIncomeStatements(quarterlyStatementsResult, seed?.incomeStatements?.quarterly),
  };

  return res.json({
    ticker,
    name,
    generatedAt: new Date().toISOString(),
    financialsSource, // 'live' | 'seed-cache' | 'unavailable' — surfaced for transparency/debugging
    financialHealthSource, // 'live' | 'seed-cache' | 'unavailable' | 'demo-data'
    valuationSource, // 'live' | 'seed-cache' | 'unavailable' | 'demo-data'
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
    incomeStatements,
    bullCase: pickNarrative(overrides?.bullCase, derived.bullCase),
    bearCase: pickNarrative(overrides?.bearCase, derived.bearCase),
    analystConsensus,
    insiderSentiment,
    disclaimer: DISCLAIMER,
  });
});

export default router;
