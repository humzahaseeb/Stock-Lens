import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import IncomeStatementChart from '../components/IncomeStatementChart.jsx';

const incomeStatements = {
  annual: {
    data: [
      { date: '2022-01-30', fiscalYear: '2022', revenue: 10000000000, netIncome: 2000000000, reportedCurrency: 'USD' },
      { date: '2023-01-29', fiscalYear: '2023', revenue: 15000000000, netIncome: 4000000000, reportedCurrency: 'USD' },
    ],
    source: 'Financial Modeling Prep',
    asOf: '2026-11-09',
  },
  quarterly: {
    data: [
      { date: '2026-04-26', period: 'Q1', revenue: 4000000000, netIncome: 1500000000, reportedCurrency: 'USD' },
      { date: '2026-07-26', period: 'Q2', revenue: 5000000000, netIncome: 2000000000, reportedCurrency: 'USD' },
    ],
    source: 'Financial Modeling Prep',
    asOf: '2026-11-09',
  },
};

describe('IncomeStatementChart', () => {
  it('switches between annual and quarterly financials', () => {
    render(<IncomeStatementChart ticker="NVDA" incomeStatements={incomeStatements} />);

    expect(screen.getByRole('heading', { name: 'Income statement' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /NVDA annual income statement/ }).getAttribute('aria-label')).toContain(
      '2022 revenue USD 10,000,000,000',
    );

    const quarterlyButton = screen.getByRole('button', { name: 'Quarterly' });
    fireEvent.click(quarterlyButton);

    expect(quarterlyButton).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('img', { name: /NVDA quarterly income statement/ }).getAttribute('aria-label'),
    ).toContain('Apr 2026 revenue USD 4,000,000,000');
  });

  it('shows an explicit message when statement data is unavailable', () => {
    render(
      <IncomeStatementChart
        ticker="RR.L"
        incomeStatements={{ annual: { data: [], error: 'FMP_API_KEY is not set' } }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/FMP_API_KEY is not set/);
  });

  it('marks fabricated statements as demo data', () => {
    render(
      <IncomeStatementChart
        ticker="RR.L"
        incomeStatements={{
          annual: {
            data: [
              { date: '2026-12-31', fiscalYear: '2026', revenue: 100, netIncome: 10, reportedCurrency: 'GBP' },
            ],
            source: 'Synthetic demo data',
            asOf: '2026-11-09',
            demoData: true,
            demoNote: 'Fabricated for a UI demo only.',
          },
        }}
      />,
    );

    expect(screen.getByText('DEMO DATA:')).toBeInTheDocument();
    expect(screen.getByText('Fabricated for a UI demo only.')).toBeInTheDocument();
  });
});
