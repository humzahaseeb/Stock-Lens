import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import CompanySummary from '../components/CompanySummary.jsx';

vi.mock('../lib/api.js', () => ({
  fetchStockChart: async () => ({
    ticker: 'NVDA',
    range: '1d',
    currency: 'USD',
    exchangeTimezone: 'America/New_York',
    asOf: 1700000060,
    currentPrice: 178.3,
    previousClose: 170,
    change: 8.3,
    changePercent: 4.88,
    points: [{ time: 1700000060, close: 178.3 }],
    source: 'Yahoo Finance',
    delayNote: 'Market data may be delayed.',
  }),
}));

const sampleData = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  ceo: 'Jensen Huang',
  ceoSource: 'Financial Modeling Prep (company profile)',
  ceoAsOf: '2026-11-09',
  marketCap: '3T',
  marketCapCurrency: 'USD',
  marketCapSource: 'Financial Modeling Prep (quote)',
  marketCapAsOf: '2026-11-09',
  peRatio: '22.54',
  eps: '$7.91',
  quarterlyDividend: '$0.25',
  generatedAt: '2026-11-09T12:00:00.000Z',
  financialsSource: 'live',
  disclaimer: 'This is not financial advice.',
  businessModel: { summary: 'Sells GPUs.', source: 'NVIDIA IR', asOf: '2026-11-01' },
  financialHealth: { metrics: [{ label: 'Net margin', value: '55%', source: 'FMP', asOf: '2026-11-09' }] },
  competitiveMoat: { summary: 'CUDA ecosystem.', source: 'Analyst notes', asOf: '2026-11-01' },
  valuation: {
    metrics: [
      { label: 'Price', value: '$178.30', source: 'FMP', asOf: '2026-11-09' },
      { label: 'P/E (TTM)', value: '22.54', source: 'FMP', asOf: '2026-11-09' },
      { label: 'Forward P/E', value: '19.8', source: 'FMP', asOf: '2026-11-09' },
      { label: 'EV / EBITDA', value: '21.3', source: 'FMP', asOf: '2026-11-09' },
      { label: 'EPS (TTM)', value: '$7.91', source: 'FMP', asOf: '2026-11-09' },
      { label: 'Quarterly dividend', value: '$0.25', source: 'FMP', asOf: '2026-11-09' },
      { label: 'Market cap', value: '3T USD', source: 'FMP', asOf: '2026-11-09' },
    ],
  },
  bullCase: { needsResearch: true, researchNote: 'Add your bull case.' },
  bearCase: { needsResearch: true, researchNote: 'Add your bear case.' },
  analystConsensus: { needsResearch: true, researchNote: 'Add consensus data.' },
};

describe('CompanySummary', () => {
  it('renders the disclaimer, header, and all summary sections', () => {
    render(<CompanySummary data={sampleData} />);
    expect(screen.getByText('This is not financial advice.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /NVIDIA Corporation/ })).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'NVDA stock price' })).toBeInTheDocument();
    expect(screen.queryByText(/Summary generated/)).not.toBeInTheDocument();
    const companyHeader = screen.getByRole('heading', { name: /NVIDIA Corporation/ }).closest('header');
    expect(within(companyHeader).queryByText('Jensen Huang')).not.toBeInTheDocument();
    expect(within(companyHeader).queryByText('3T USD')).not.toBeInTheDocument();
    expect(within(companyHeader).queryByText('22.54')).not.toBeInTheDocument();
    const businessModelSection = screen.getByRole('region', { name: 'Business model' });
    expect(within(businessModelSection).getByText('Jensen Huang')).toBeInTheDocument();
    expect(
      within(businessModelSection).getByText(/Financial Modeling Prep \(company profile\)/),
    ).toBeInTheDocument();
    expect(businessModelSection.textContent.indexOf('Jensen Huang')).toBeLessThan(
      businessModelSection.textContent.indexOf('Sells GPUs.'),
    );
    const valuationSection = screen.getByRole('region', { name: 'Valuation' });
    expect(within(valuationSection).getByText('3T USD')).toBeInTheDocument();
    expect(within(valuationSection).getByText('$7.91')).toBeInTheDocument();
    expect(within(valuationSection).getByText('$0.25')).toBeInTheDocument();

    for (const heading of [
      'Business model',
      'Financial health',
      'Income statement',
      'Competitive moat',
      'Valuation',
      'Bull case',
      'Bear case',
      'Analyst ratings',
      '12-month forecast',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
  });

  it('shows a pinned-snapshot badge when financialsSource is seed-cache', () => {
    render(<CompanySummary data={{ ...sampleData, financialsSource: 'seed-cache' }} />);
    expect(screen.getByText(/pinned data snapshot/)).toBeInTheDocument();
  });
});
