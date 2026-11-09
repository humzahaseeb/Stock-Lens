import { getCached, setCached } from './cache.js';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Thin client around Financial Modeling Prep's free-tier v3 endpoints.
 * Covers quantitative data (profile, quote, ratios, income and cash-flow statements) —
 * analyst consensus/price targets and narrative fields are NOT requested
 * here because FMP's free tier doesn't reliably expose them; those come
 * from the manual overrides (see src/data/overrides).
 *
 * Every HTTP call is cached (see cache.js), and returned financial data includes
 * source/as-of metadata so the frontend can show provenance.
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

  const unavailableValuationMetrics = [];
  if (q.forwardPE == null) unavailableValuationMetrics.push('Forward P/E');
  if (r?.enterpriseValueMultiple == null) unavailableValuationMetrics.push('EV / EBITDA');

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
        metric('Forward P/E', q.forwardPE != null ? round(q.forwardPE) : null),
        metric('EV / EBITDA', r?.enterpriseValueMultiple != null ? round(r.enterpriseValueMultiple) : null),
        metric('EPS (TTM)', q.eps != null ? round(q.eps) : null),
        metric('Market cap', q.marketCap != null ? formatLarge(q.marketCap) : null),
      ].filter((m) => m.value !== null),
      note: unavailableValuationMetrics.length
        ? `${unavailableValuationMetrics.join(' and ')} unavailable from the current FMP response; omitted rather than estimated.`
        : null,
    },
  };
}

export async function fetchFmpIncomeStatements(ticker, period, apiKey = process.env.FMP_API_KEY) {
  if (!apiKey) {
    throw new Error('FMP_API_KEY is not set');
  }
  if (period !== 'annual' && period !== 'quarterly') {
    throw new Error(`Unsupported income statement period: ${period}`);
  }

  const fmpPeriod = period === 'quarterly' ? 'quarter' : 'annual';
  const limit = period === 'annual' ? 5 : 4;
  const response = await fmpGet(
    `/income-statement/${ticker}?period=${fmpPeriod}&limit=${limit}`,
    apiKey,
  );
  const rows = Array.isArray(response) ? response : [response];
  const data = rows
    .filter((row) => row && typeof row.date === 'string')
    .map((row) => ({
      date: row.date,
      fiscalYear: row.calendarYear ?? row.fiscalYear ?? null,
      period: row.period ?? null,
      revenue: nullableNumber(row.revenue),
      netIncome: nullableNumber(row.netIncome),
      reportedCurrency: row.reportedCurrency ?? null,
    }))
    .filter((row) => row.revenue !== null || row.netIncome !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length === 0) {
    throw new Error(`FMP returned no income statement data for ${ticker} (${period})`);
  }

  return {
    data,
    source: 'Financial Modeling Prep',
    asOf: todayIso(),
  };
}

export async function fetchFmpFreeCashFlowTTM(ticker, apiKey = process.env.FMP_API_KEY) {
  if (!apiKey) {
    throw new Error('FMP_API_KEY is not set');
  }

  const response = await fmpGet(`/cash-flow-statement/${ticker}?period=quarter&limit=4`, apiKey);
  const rows = (Array.isArray(response) ? response : [response])
    .filter((row) => row && typeof row.date === 'string')
    .map((row) => ({
      date: row.date,
      freeCashFlow: nullableNumber(row.freeCashFlow),
      reportedCurrency: row.reportedCurrency ?? null,
    }))
    .filter((row) => row.freeCashFlow !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (rows.length < 4) {
    throw new Error(`FMP returned fewer than 4 quarterly free-cash-flow values for ${ticker}`);
  }

  const trailingFourQuarters = rows.slice(-4);
  const total = trailingFourQuarters.reduce((sum, row) => sum + row.freeCashFlow, 0);
  const currency = trailingFourQuarters[trailingFourQuarters.length - 1]?.reportedCurrency;
  return {
    label: 'Free cash flow (TTM)',
    value: `${currency ? `${currency} ` : ''}${formatLarge(total)}`,
    source: 'Financial Modeling Prep (cash-flow statement)',
    asOf: todayIso(),
  };
}

function round(n) {
  return Math.round(Number(n) * 100) / 100;
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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
