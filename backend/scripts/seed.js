#!/usr/bin/env node
/**
 * Pins a live data snapshot (FMP financials/valuation/income statements +
 * Finnhub analyst consensus/insider sentiment) for the demo tickers so the
 * app works reliably even if either API is rate-limited or down.
 *
 * Usage:
 *   FMP_API_KEY=your-fmp-key FINNHUB_API_KEY=your-finnhub-key node scripts/seed.js
 *
 * Re-run this before presenting to refresh the dates/figures. Finnhub is
 * optional here — without FINNHUB_API_KEY, analyst consensus uses curated
 * company overrides.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { fetchFmpFreeCashFlowTTM, fetchFmpIncomeStatements, fetchFmpMetrics } from '../src/lib/fmpClient.js';
import { fetchAnalystConsensus, fetchInsiderSentiment } from '../src/lib/finnhubClient.js';
import { loadOverrides } from '../src/lib/overridesLoader.js';
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
    const overrides = await loadOverrides(ticker);

    try {
      const financials = await fetchFmpMetrics(ticker);
      Object.assign(seed, financials);
    } catch (err) {
      console.error(`Failed to seed FMP data for ${ticker}: ${err.message}`);
      continue;
    }

    if (overrides?.financialHealth?.demoData) {
      console.log(`Using the labeled financial-health demo override for ${ticker}; skipping live FCF seeding.`);
    } else {
      try {
        seed.financialHealth.metrics.push(await fetchFmpFreeCashFlowTTM(ticker));
      } catch (err) {
        console.warn(`No trailing free cash flow data for ${ticker}: ${err.message}`);
      }
    }

    const incomeStatements = {};
    for (const period of ['annual', 'quarterly']) {
      if (overrides?.incomeStatements?.[period]?.demoData) {
        console.log(`Using the labeled ${period} demo override for ${ticker}; skipping live statement seeding.`);
        continue;
      }
      try {
        incomeStatements[period] = await fetchFmpIncomeStatements(ticker, period);
      } catch (err) {
        console.warn(`No ${period} income statement data for ${ticker}: ${err.message}`);
      }
    }
    if (Object.keys(incomeStatements).length > 0) {
      seed.incomeStatements = incomeStatements;
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
