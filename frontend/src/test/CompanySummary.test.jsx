import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompanySummary from '../components/CompanySummary.jsx';

const sampleData = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  generatedAt: '2026-11-09T12:00:00.000Z',
  financialsSource: 'live',
  disclaimer: 'This is not financial advice.',
  businessModel: { summary: 'Sells GPUs.', source: 'NVIDIA IR', asOf: '2026-11-01' },
  financialHealth: { metrics: [{ label: 'Net margin', value: '55%', source: 'FMP', asOf: '2026-11-09' }] },
  competitiveMoat: { summary: 'CUDA ecosystem.', source: 'Analyst notes', asOf: '2026-11-01' },
  valuation: { metrics: [{ label: 'P/E (TTM)', value: '45.2', source: 'FMP', asOf: '2026-11-09' }] },
  bullCase: { needsResearch: true, researchNote: 'Add your bull case.' },
  bearCase: { needsResearch: true, researchNote: 'Add your bear case.' },
  analystConsensus: { needsResearch: true, researchNote: 'Add consensus data.' },
};

describe('CompanySummary', () => {
  it('renders the disclaimer, header, and all seven sections', () => {
    render(<CompanySummary data={sampleData} />);
    expect(screen.getByText('This is not financial advice.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /NVIDIA Corporation/ })).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();

    for (const heading of [
      'Business model',
      'Financial health',
      'Competitive moat',
      'Valuation',
      'Bull case',
      'Bear case',
      'Analyst consensus',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
  });

  it('shows a pinned-snapshot badge when financialsSource is seed-cache', () => {
    render(<CompanySummary data={{ ...sampleData, financialsSource: 'seed-cache' }} />);
    expect(screen.getByText(/pinned data snapshot/)).toBeInTheDocument();
  });
});
