import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFmpFreeCashFlowTTM, fetchFmpIncomeStatements, fetchFmpMetrics } from '../src/lib/fmpClient.js';
import { clearCache } from '../src/lib/cache.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

describe('FMP client', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  describe('fetchFmpIncomeStatements', () => {
    it('fetches and sorts annual and quarterly statement data', async () => {
      const fetchMock = vi.fn(async (url) => {
        if (url.includes('period=annual')) {
          return jsonResponse([
            {
              date: '2025-01-26',
              calendarYear: '2025',
              period: 'FY',
              revenue: 130000000000,
              netIncome: 72000000000,
              reportedCurrency: 'USD',
            },
            {
              date: '2024-01-28',
              calendarYear: '2024',
              period: 'FY',
              revenue: 60000000000,
              netIncome: 30000000000,
              reportedCurrency: 'USD',
            },
          ]);
        }
        if (url.includes('period=quarter')) {
          return jsonResponse([
            { date: '2026-07-26', period: 'Q2', revenue: 46000000000, netIncome: 25000000000, reportedCurrency: 'USD' },
          ]);
        }
        throw new Error(`Unexpected URL ${url}`);
      });

      vi.stubGlobal('fetch', fetchMock);

      const annual = await fetchFmpIncomeStatements('NVDA', 'annual', 'test-key');
      const quarterly = await fetchFmpIncomeStatements('NVDA', 'quarterly', 'test-key');

      expect(annual.data.map((row) => row.fiscalYear)).toEqual(['2024', '2025']);
      expect(annual.data[0].revenue).toBe(60000000000);
      expect(quarterly.data[0].period).toBe('Q2');
      expect(quarterly.source).toBe('Financial Modeling Prep');
    });

    it('throws when no API key is configured', async () => {
      await expect(fetchFmpIncomeStatements('NVDA', 'annual', undefined)).rejects.toThrow(/FMP_API_KEY/);
    });
  });

  it('sums the latest four quarterly free-cash-flow values into TTM', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse([
          { date: '2026-09-30', freeCashFlow: 1300000000, reportedCurrency: 'USD' },
          { date: '2026-06-30', freeCashFlow: 1200000000, reportedCurrency: 'USD' },
          { date: '2026-03-31', freeCashFlow: 1100000000, reportedCurrency: 'USD' },
          { date: '2025-12-31', freeCashFlow: 1000000000, reportedCurrency: 'USD' },
        ]),
      ),
    );

    const result = await fetchFmpFreeCashFlowTTM('AAPL', 'test-key');

    expect(result.label).toBe('Free cash flow (TTM)');
    expect(result.value).toBe('USD 4.6B');
    expect(result.source).toBe('Financial Modeling Prep (cash-flow statement)');
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
        return jsonResponse([{ price: 120.5, pe: 45.2, forwardPE: 31.7, eps: 2.66, marketCap: 3000000000000 }]);
      }
      if (url.includes('/ratios/')) {
        return jsonResponse([
          { netProfitMargin: 0.55, debtEquityRatio: 0.3, currentRatio: 4.1, enterpriseValueMultiple: 23.8 },
        ]);
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
    expect(result.valuation.metrics.find((m) => m.label === 'Forward P/E').value).toBe('31.7');
    expect(result.valuation.metrics.find((m) => m.label === 'EV / EBITDA').value).toBe('23.8');
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
