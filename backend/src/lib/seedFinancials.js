import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, '..', 'data', 'seedFinancials');

/**
 * Loads a pinned financial snapshot for a ticker, used as a fallback when a
 * live FMP call fails (no API key, rate limit, or FMP outage). This is what
 * keeps the NVDA/Rolls-Royce demo reliable for judges regardless of network
 * conditions — see `backend/scripts/seed.js` to (re)generate these from live
 * data, and `docs/testing.md` / `docs/security.md` for why.
 */
export function loadSeedFinancials(ticker) {
  const file = path.join(SEED_DIR, `${ticker}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf-8'));
}
