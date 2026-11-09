import { getCached, setCached } from './cache.js';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Thin client around Financial Modeling Prep's free-tier v3 endpoints.
 * Only covers quantitative data (profile, quote, ratios, key metrics) —
 * analyst consensus/price targets and narrative fields are NOT requested
 * here because FMP's free tier doesn't reliably expose them; those come
 * from the manual overrides (see src/data/overrides).
 *
 * Every call is cached (see cache.js) and every returned value is wrapped
 * with { value, source, asOf } so the frontend can always show provenance.
 */

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function fmpGet(path, apiKey) {
  const url = `${FMP_BASE_URL}${path}${path.includes('?') ? '&' : '?'}apikey=${apiKey}`;
  const cacheKey = `fmp:${path}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FMP request failed (${res.status}) for ${path}`);
  }
  const body = await res.json();
  if (Array.isArray(body) && body.length === 0) {
    throw new Error(`FMP returned no data for ${path}`);
  }
  // FMP sometimes returns a 200 with an "Error Message" body instead of an HTTP error.
  if (body && body['Error Message']) {
    throw new Error(body['Error Message']);
  }
  return setCached(cacheKey, body);
}

function metric(label, value, unit = '') {
  return {
    label,
    value: value === null || value === undefined ? null : `${value}${unit}`,
    source: 'Financial Modeling Prep',
    asOf: todayIso(),
  };
}

/**
 * Fetch financial health + valuation metrics for a ticker from FMP.
 * Throws if the API key is missing or any request fails — callers should
 * catch this and fall back to the pinned seed data (see seedFinancials/).
 */
export async function fetchFmpMetrics(ticker, apiKey = process.env.FMP_API_KEY) {
  if (!apiKey) {
    throw new Error('FMP_API_KEY is not set');
  }

  const [profile, quote, ratios] = await Promise.all([
    fmpGet(`/profile/${ticker}`, apiKey),
    fmpGet(`/quote/${ticker}`, apiKey),
    fmpGet(`/ratios/${ticker}?period=annual&limit=1`, apiKey),
  ]);

  const p = Array.isArray(profile) ? profile[0] : profile;
  const q = Array.isArray(quote) ? quote[0] : quote;
  const r = Array.isArray(ratios) ? ratios[0] : ratios;

  if (!p || !q) {
    throw new Error(`FMP returned incomplete data for ${ticker}`);
  }

  return {
    name: p.companyName,
    ceo: p.ceo || null,
    ceoSource: 'Financial Modeling Prep (company profile)',
    ceoAsOf: todayIso(),
    marketCap: q.marketCap != null ? formatLarge(q.marketCap) : null,
    marketCapCurrency: p.currency || null,
    marketCapSource: 'Financial Modeling Prep (quote)',
    marketCapAsOf: todayIso(),
    financialHealth: {
      metrics: [
        metric('Revenue (TTM)', q.marketCap ? formatLarge(p.revenueTTM) : null),
        metric('Net profit margin', r?.netProfitMargin != null ? pct(r.netProfitMargin) : null),
        metric('Debt / Equity', r?.debtEquityRatio != null ? round(r.debtEquityRatio) : null),
        metric('Current ratio', r?.currentRatio != null ? round(r.currentRatio) : null),
      ].filter((m) => m.value !== null),
    },
    valuation: {
      metrics: [
        metric('Price', q.price != null ? round(q.price) : null, ` ${p.currency || ''}`.trimEnd()),
        metric('P/E (TTM)', q.pe != null ? round(q.pe) : null),
        metric('EPS (TTM)', q.eps != null ? round(q.eps) : null),
        metric('Market cap', q.marketCap != null ? formatLarge(q.marketCap) : null),
      ].filter((m) => m.value !== null),
    },
  };
}

function round(n) {
  return Math.round(Number(n) * 100) / 100;
}

function pct(n) {
  return `${round(n * 100)}%`;
}

function formatLarge(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return null;
  const abs = Math.abs(num);
  if (abs >= 1e12) return `${round(num / 1e12)}T`;
  if (abs >= 1e9) return `${round(num / 1e9)}B`;
  if (abs >= 1e6) return `${round(num / 1e6)}M`;
  return `${num}`;
}
