import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFmpMetrics } from '../src/lib/fmpClient.js';
import { clearCache } from '../src/lib/cache.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

describe('fetchFmpMetrics', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when no API key is configured', async () => {
    await expect(fetchFmpMetrics('NVDA', undefined)).rejects.toThrow(/FMP_API_KEY/);
  });

  it('parses profile/quote/ratios into financialHealth + valuation metrics', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.includes('/profile/')) {
        return jsonResponse([
          {
            companyName: 'NVIDIA Corporation',
            ceo: 'Jensen Huang',
            currency: 'USD',
            revenueTTM: 60000000000,
          },
        ]);
      }
      if (url.includes('/quote/')) {
        return jsonResponse([{ price: 120.5, pe: 45.2, eps: 2.66, marketCap: 3000000000000 }]);
      }
      if (url.includes('/ratios/')) {
        return jsonResponse([{ netProfitMargin: 0.55, debtEquityRatio: 0.3, currentRatio: 4.1 }]);
      }
      throw new Error(`Unexpected URL ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchFmpMetrics('NVDA', 'test-key');

    expect(result.name).toBe('NVIDIA Corporation');
    expect(result.ceo).toBe('Jensen Huang');
    expect(result.marketCap).toBe('3T');
    expect(result.marketCapCurrency).toBe('USD');
    expect(result.valuation.metrics.find((m) => m.label === 'P/E (TTM)').value).toBe('45.2');
    expect(result.valuation.metrics.find((m) => m.label === 'Market cap').value).toBe('3T');
    expect(result.financialHealth.metrics.find((m) => m.label === 'Net profit margin').value).toBe('55%');
    // Every metric carries provenance.
    for (const m of [...result.valuation.metrics, ...result.financialHealth.metrics]) {
      expect(m.source).toBe('Financial Modeling Prep');
      expect(m.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('throws when FMP responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, false, 401)));
    await expect(fetchFmpMetrics('NVDA', 'bad-key')).rejects.toThrow(/401/);
  });

  it('throws when FMP responds with an empty array (unknown ticker)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse([])));
    await expect(fetchFmpMetrics('ZZZZ', 'test-key')).rejects.toThrow(/no data/);
  });
});
