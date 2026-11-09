import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAnalystConsensus, fetchInsiderSentiment } from '../src/lib/finnhubClient.js';
import { clearCache } from '../src/lib/cache.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

describe('fetchAnalystConsensus', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when no API key is configured', async () => {
    await expect(fetchAnalystConsensus('NVDA', undefined)).rejects.toThrow(/FINNHUB_API_KEY/);
  });

  it('derives a "Buy" rating from mostly-bullish recommendation counts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse([
          { symbol: 'NVDA', period: '2026-11-01', strongBuy: 20, buy: 10, hold: 2, sell: 0, strongSell: 0 },
          { symbol: 'NVDA', period: '2026-10-01', strongBuy: 15, buy: 10, hold: 5, sell: 1, strongSell: 0 },
        ]),
      ),
    );

    const result = await fetchAnalystConsensus('NVDA', 'test-key');
    expect(result.rating).toBe('Strong Buy');
    expect(result.numberOfAnalysts).toBe(32);
    expect(result.source).toBe('Finnhub (analyst recommendation trends)');
    expect(result.asOf).toBe('2026-11-01');
    expect(result.priceTarget12m).toBeNull();
    expect(result.priceTargetHigh).toBeNull();
    expect(result.priceTargetLow).toBeNull();
    expect(result.priceTargetAnalystCount).toBeNull();
    expect(result.priceTargetNote).toMatch(/not available/i);
  });

  it('flags an improving trend when sentiment is more bullish than the prior period', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse([
          { symbol: 'NVDA', period: '2026-11-01', strongBuy: 20, buy: 10, hold: 0, sell: 0, strongSell: 0 },
          { symbol: 'NVDA', period: '2026-10-01', strongBuy: 5, buy: 5, hold: 10, sell: 5, strongSell: 5 },
        ]),
      ),
    );
    const result = await fetchAnalystConsensus('NVDA', 'test-key');
    expect(result.trendDirection).toBe('improving');
  });

  it('returns null when Finnhub has no coverage for the symbol (empty array)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse([])));
    const result = await fetchAnalystConsensus('RR.L', 'test-key');
    expect(result).toBeNull();
  });

  it('throws on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, false, 401)));
    await expect(fetchAnalystConsensus('NVDA', 'bad-key')).rejects.toThrow(/401/);
  });
});

describe('fetchInsiderSentiment', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the most recent month\'s MSPR score', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          data: [
            { year: 2026, month: 9, mspr: -3.2 },
            { year: 2026, month: 10, mspr: 5.1 },
          ],
        }),
      ),
    );
    const result = await fetchInsiderSentiment('NVDA', 'test-key');
    expect(result.mspr).toBe(5.1);
    expect(result.month).toBe('2026-10');
  });

  it('returns null when there is no data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));
    const result = await fetchInsiderSentiment('RR.L', 'test-key');
    expect(result).toBeNull();
  });
});
