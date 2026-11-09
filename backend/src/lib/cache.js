import NodeCache from 'node-cache';

// Shared in-memory cache for FMP responses. TTL keeps us within the free-tier
// rate limit (250 req/day) while still calling "live" data, and lets us report
// an accurate `asOf` per metric instead of re-fetching on every page view.
const DEFAULT_TTL_SECONDS = 60 * 60 * 6; // 6 hours

const cache = new NodeCache({ stdTTL: DEFAULT_TTL_SECONDS, checkperiod: 600 });

export function getCached(key) {
  return cache.get(key);
}

export function setCached(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  cache.set(key, value, ttlSeconds);
  return value;
}

export function clearCache() {
  cache.flushAll();
}

export default cache;
