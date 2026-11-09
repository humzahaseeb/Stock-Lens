import NodeCache from 'node-cache';

// Shared in-memory cache for third-party market data. Per-request TTLs help
// respect source limits while keeping quote timestamps reasonably fresh.
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
