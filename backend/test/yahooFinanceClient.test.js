import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache } from '../src/lib/cache.js';
import { fetchYahooStockChart } from '../src/lib/yahooFinanceClient.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

describe('fetchYahooStockChart', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes intraday quote data and uses the selected time range', async () => {
    const fetchMock = vi.fn(async (url) => {
      expect(url).toContain('/NVDA?range=1d&interval=5m');
      return jsonResponse({
        chart: {
          result: [
            {
              meta: {
                symbol: 'NVDA',
                currency: 'USD',
                exchangeTimezoneName: 'America/New_York',
                regularMarketTime: 1700000060,
                regularMarketPrice: 104.5,
                chartPreviousClose: 100,
                regularMarketOpen: 102,
                regularMarketDayHigh: 106,
                regularMarketDayLow: 99,
                fiftyTwoWeekHigh: 120,
                fiftyTwoWeekLow: 80,
              },
              timestamp: [1700000000, 1700000060, 1700000120],
              indicators: { quote: [{ close: [101, null, 104.5] }] },
            },
          ],
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchYahooStockChart('NVDA', '1d');

    expect(result.source).toBe('Yahoo Finance');
    expect(result.currency).toBe('USD');
    expect(result.currentPrice).toBe(104.5);
    expect(result.change).toBe(4.5);
    expect(result.changePercent).toBe(4.5);
    expect(result.points).toHaveLength(2);
    expect(result.delayNote).toMatch(/may be delayed/i);
  });

  it('rejects unsupported chart ranges', async () => {
    await expect(fetchYahooStockChart('NVDA', '2d')).rejects.toThrow(/Unsupported stock chart range/);
  });

  it('calculates change from the selected historical range instead of previous close', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          chart: {
            result: [
              {
                meta: {
                  symbol: 'NVDA',
                  currency: 'USD',
                  regularMarketTime: 1700000060,
                  regularMarketPrice: 120,
                  chartPreviousClose: 110,
                },
                timestamp: [1700000000, 1700000060],
                indicators: { quote: [{ close: [100, 120] }] },
              },
            ],
          },
        }),
      ),
    );

    const result = await fetchYahooStockChart('NVDA', '5d');

    expect(result.change).toBe(20);
    expect(result.changePercent).toBe(20);
    expect(result.previousClose).toBe(110);
  });

  it('uses daily sampling for the 5d range to match the 1mo chart', async () => {
    const fetchMock = vi.fn(async (url) => {
      expect(url).toContain('/NVDA?range=5d&interval=1d');
      return jsonResponse({
        chart: {
          result: [
            {
              meta: { symbol: 'NVDA', regularMarketPrice: 102 },
              timestamp: [1700000000, 1700086400],
              indicators: { quote: [{ close: [100, 102] }] },
            },
          ],
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchYahooStockChart('NVDA', '5d');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
