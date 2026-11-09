#!/usr/bin/env node
/**
 * Pins a live data snapshot (FMP financials/valuation + Finnhub analyst
 * consensus/insider sentiment) for the demo tickers so the app works
 * reliably for judges even if either free API is rate-limited or down on
 * the day.
 *
 * Usage:
 *   FMP_API_KEY=your-fmp-key FINNHUB_API_KEY=your-finnhub-key node scripts/seed.js
 *
 * Re-run this before presenting to refresh the dates/figures. Finnhub is
 * optional here — if FINNHUB_API_KEY isn't set, only FMP data is pinned and
 * the app falls back to the manual override placeholders for consensus.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { fetchFmpMetrics } from '../src/lib/fmpClient.js';
import { fetchAnalystConsensus, fetchInsiderSentiment } from '../src/lib/finnhubClient.js';
import { resolveFinnhubSymbol } from '../src/lib/tickerAliases.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'seedFinancials');

const TICKERS = ['NVDA', 'RR.L'];

async function main() {
  if (!process.env.FMP_API_KEY) {
    console.error('FMP_API_KEY is not set. Get a free key at financialmodelingprep.com and re-run:');
    console.error('  FMP_API_KEY=your-key FINNHUB_API_KEY=your-key node scripts/seed.js');
    process.exit(1);
  }
  if (!process.env.FINNHUB_API_KEY) {
    console.warn('FINNHUB_API_KEY is not set — skipping analyst consensus/insider sentiment seeding.');
    console.warn('Get a free key at https://finnhub.io/register to include it.');
  }

  mkdirSync(OUT_DIR, { recursive: true });

  for (const ticker of TICKERS) {
    const outFile = path.join(OUT_DIR, `${ticker}.json`);
    const seed = { ticker };

    try {
      const financials = await fetchFmpMetrics(ticker);
      Object.assign(seed, financials);
    } catch (err) {
      console.error(`Failed to seed FMP data for ${ticker}: ${err.message}`);
      continue;
    }

    if (process.env.FINNHUB_API_KEY) {
      const { symbol: finnhubSymbol } = resolveFinnhubSymbol(ticker);
      try {
        seed.consensus = await fetchAnalystConsensus(finnhubSymbol);
      } catch (err) {
        console.warn(`No Finnhub consensus for ${ticker} (${finnhubSymbol}): ${err.message}`);
      }
      try {
        seed.insiderSentiment = await fetchInsiderSentiment(finnhubSymbol);
      } catch (err) {
        console.warn(`No Finnhub insider sentiment for ${ticker} (${finnhubSymbol}): ${err.message}`);
      }
    }

    writeFileSync(outFile, JSON.stringify(seed, null, 2));
    console.log(`Seeded ${ticker} -> ${outFile}`);
  }
}

main();
