import { getCached, setCached } from './cache.js';

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

const RANGE_CONFIG = {
  '1d': { interval: '5m', cacheSeconds: 60 },
  '5d': { interval: '15m', cacheSeconds: 120 },
  '1mo': { interval: '1d', cacheSeconds: 300 },
  '6mo': { interval: '1d', cacheSeconds: 900 },
  ytd: { interval: '1d', cacheSeconds: 900 },
  '1y': { interval: '1d', cacheSeconds: 1800 },
  '5y': { interval: '1wk', cacheSeconds: 3600 },
  max: { interval: '1mo', cacheSeconds: 3600 },
};

export async function fetchYahooStockChart(ticker, range) {
  const config = RANGE_CONFIG[range];
  if (!config) {
    throw new Error(`Unsupported stock chart range: ${range}`);
  }

  const cacheKey = `yahoo-chart:${ticker}:${range}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(ticker)}?range=${range}&interval=${config.interval}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Yahoo Finance request failed (${response.status}) for ${ticker}`);
  }

  const body = await response.json();
  if (body?.chart?.error) {
    throw new Error(body.chart.error.description || `Yahoo Finance has no chart data for ${ticker}`);
  }

  const result = body?.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp;
  if (!result || !Array.isArray(timestamps) || !Array.isArray(quote?.close)) {
    throw new Error(`Yahoo Finance returned incomplete chart data for ${ticker}`);
  }

  const points = timestamps
    .map((time, index) => ({ time, close: finiteNumber(quote.close[index]) }))
    .filter((point) => Number.isFinite(point.time) && point.close !== null);
  if (points.length === 0) {
    throw new Error(`Yahoo Finance returned no usable chart points for ${ticker}`);
  }

  const meta = result.meta || {};
  const currentPrice = finiteNumber(meta.regularMarketPrice) ?? points[points.length - 1].close;
  const previousClose = finiteNumber(meta.chartPreviousClose) ?? finiteNumber(meta.previousClose);
  const rangeStartPrice = range === '1d' ? previousClose : points[0].close;
  const change = rangeStartPrice === null ? null : currentPrice - rangeStartPrice;
  const changePercent = rangeStartPrice && change !== null ? (change / rangeStartPrice) * 100 : null;

  return setCached(
    cacheKey,
    {
      ticker,
      range,
      currency: meta.currency || null,
      exchangeTimezone: meta.exchangeTimezoneName || 'UTC',
      asOf: finiteNumber(meta.regularMarketTime) ?? points[points.length - 1].time,
      currentPrice,
      previousClose,
      change,
      changePercent,
      open: finiteNumber(meta.regularMarketOpen),
      dayHigh: finiteNumber(meta.regularMarketDayHigh),
      dayLow: finiteNumber(meta.regularMarketDayLow),
      fiftyTwoWeekHigh: finiteNumber(meta.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: finiteNumber(meta.fiftyTwoWeekLow),
      points,
      source: 'Yahoo Finance',
      delayNote: 'Market data may be delayed; this public feed is not guaranteed real-time.',
    },
    config.cacheSeconds,
  );
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
