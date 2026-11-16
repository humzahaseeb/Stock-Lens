import { getCached, setCached } from './cache.js';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Thin client around Finnhub's free-tier endpoints. Verified against
 * Finnhub's public swagger spec (https://finnhub.io/static/swagger.json)
 * that these specific endpoints carry no "premium" flag as of writing:
 *   - /stock/recommendation  (analyst recommendation trends — buy/hold/sell counts)
 *   - /stock/insider-sentiment (US companies only)
 * `/stock/price-target` is explicitly "Premium required." on Finnhub, and
 * the equivalent on FMP's free tier is unreliable, so Stock Lens does not
 * attempt to show a 12-month price target — see docs/data-and-api-schema/api-schema.md.
 */

async function finnhubGet(path, apiKey) {
  const url = `${FINNHUB_BASE_URL}${path}${path.includes('?') ? '&' : '?'}token=${apiKey}`;
  const cacheKey = `finnhub:${path}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub request failed (${res.status}) for ${path}`);
  }
  const body = await res.json();
  if (body && body.error) {
    throw new Error(body.error);
  }
  return setCached(cacheKey, body);
}

/**
 * Converts Finnhub's buy/hold/sell/strongBuy/strongSell counts for the most
 * recent period into a single consensus rating, using the standard weighted
 * mean-recommendation method (1 = Strong Buy ... 5 = Strong Sell).
 */
function ratingFromCounts(counts) {
  const { strongBuy, buy, hold, sell, strongSell } = counts;
  const total = strongBuy + buy + hold + sell + strongSell;
  if (total === 0) return null;

  const weightedSum = strongBuy * 1 + buy * 2 + hold * 3 + sell * 4 + strongSell * 5;
  const score = weightedSum / total;

  let rating;
  if (score <= 1.5) rating = 'Strong Buy';
  else if (score <= 2.5) rating = 'Buy';
  else if (score <= 3.5) rating = 'Hold';
  else if (score <= 4.5) rating = 'Sell';
  else rating = 'Strong Sell';

  return { rating, score: Math.round(score * 100) / 100, total };
}

/**
 * Fetches real analyst recommendation trends for a ticker and converts them
 * into a consensus rating. Returns null (not throws) when Finnhub has no
 * coverage for the symbol (empty array) — common for non-US listings on the
 * free tier — so callers can fall back to the manual override cleanly.
 * Throws only on network/auth/rate-limit failures.
 */
export async function fetchAnalystConsensus(ticker, apiKey = process.env.FINNHUB_API_KEY) {
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY is not set');
  }

  const trends = await finnhubGet(`/stock/recommendation?symbol=${encodeURIComponent(ticker)}`, apiKey);
  if (!Array.isArray(trends) || trends.length === 0) {
    return null;
  }

  // Finnhub returns periods newest-first.
  const latest = trends[0];
  const previous = trends[1];
  const latestRating = ratingFromCounts(latest);
  if (!latestRating) return null;

  let trendDirection = null;
  if (previous) {
    const previousRating = ratingFromCounts(previous);
    if (previousRating && previousRating.score !== latestRating.score) {
      trendDirection = previousRating.score > latestRating.score ? 'improving' : 'worsening';
    }
  }

  return {
    rating: latestRating.rating,
    breakdown: {
      strongBuy: latest.strongBuy,
      buy: latest.buy,
      hold: latest.hold,
      sell: latest.sell,
      strongSell: latest.strongSell,
    },
    numberOfAnalysts: latestRating.total,
    trendDirection, // 'improving' | 'worsening' | null, vs the prior month
    priceTarget12m: null,
    priceTargetHigh: null,
    priceTargetLow: null,
    priceTargetAnalystCount: null,
    priceTargetSource: null,
    priceTargetAsOf: null,
    priceTargetNote:
      '12-month price target consensus is not available on any free-tier API we found — ' +
      "Finnhub's price-target endpoint requires a paid plan. Add it yourself from a broker " +
      'or financial news site if you want to include one.',
    source: 'Finnhub (analyst recommendation trends)',
    asOf: latest.period,
  };
}

/**
 * Fetches insider sentiment (MSPR score) for the trailing ~3 months.
 * US companies only (per Finnhub's docs) — returns null for anything else
 * or when there's no data, rather than throwing, so it's safe to treat as
 * optional supporting evidence.
 */
export async function fetchInsiderSentiment(ticker, apiKey = process.env.FINNHUB_API_KEY) {
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY is not set');
  }

  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 3);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const body = await finnhubGet(
    `/stock/insider-sentiment?symbol=${encodeURIComponent(ticker)}&from=${fmt(from)}&to=${fmt(to)}`,
    apiKey,
  );
  const data = body?.data;
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const latest = data[data.length - 1];
  return {
    mspr: latest.mspr,
    month: `${latest.year}-${String(latest.month).padStart(2, '0')}`,
    source: 'Finnhub (insider sentiment)',
    asOf: `${latest.year}-${String(latest.month).padStart(2, '0')}`,
  };
}
