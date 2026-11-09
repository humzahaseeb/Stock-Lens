#!/usr/bin/env node
/**
 * Pins a live FMP snapshot for the demo tickers so the app works reliably
 * for judges even if FMP's free tier is rate-limited or down on the day.
 *
 * Usage:
 *   FMP_API_KEY=your-real-key node scripts/seed.js
 *
 * Re-run this before presenting to refresh the dates/figures.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { fetchFmpMetrics } from '../src/lib/fmpClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'seedFinancials');

const TICKERS = ['NVDA', 'RR.L'];

async function main() {
  if (!process.env.FMP_API_KEY) {
    console.error('FMP_API_KEY is not set. Get a free key at financialmodelingprep.com and re-run:');
    console.error('  FMP_API_KEY=your-real-key node scripts/seed.js');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  for (const ticker of TICKERS) {
    try {
      const data = await fetchFmpMetrics(ticker);
      const outFile = path.join(OUT_DIR, `${ticker}.json`);
      writeFileSync(outFile, JSON.stringify(data, null, 2));
      console.log(`Seeded ${ticker} -> ${outFile}`);
    } catch (err) {
      console.error(`Failed to seed ${ticker}: ${err.message}`);
    }
  }
}

main();
