import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MetricList from '../components/MetricList.jsx';

describe('MetricList', () => {
  it('renders each metric with its value, source and date', () => {
    render(
      <MetricList
        title="Valuation"
        metrics={[
          { label: 'P/E (TTM)', value: '45.2', source: 'Financial Modeling Prep', asOf: '2026-11-09' },
        ]}
      />,
    );
    expect(screen.getByText('P/E (TTM)')).toBeInTheDocument();
    expect(screen.getByText(/45\.2/)).toBeInTheDocument();
    expect(screen.getByText(/Financial Modeling Prep, 2026-11-09/)).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no metrics', () => {
    render(<MetricList title="Valuation" metrics={[]} />);
    expect(screen.getByText(/No live data available/)).toBeInTheDocument();
  });

  it('shows an explicit note when an optional metric is unavailable', () => {
    render(
      <MetricList
        title="Financial health"
        metrics={[{ label: 'Revenue (TTM)', value: '100B', source: 'FMP', asOf: '2026-11-09' }]}
        note="Free cash flow (TTM) is unavailable: FMP_API_KEY is not set"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/Free cash flow \(TTM\) is unavailable/);
  });

  it('shows synthetic source and date once at the bottom of the section', () => {
    render(
      <MetricList
        title="Financial health"
        metrics={[
          { label: 'Revenue (TTM)', value: 'USD 230B', source: 'Synthetic demo data', asOf: '2026-11-09' },
          { label: 'Debt / Equity', value: '0.35', source: 'Synthetic demo data', asOf: '2026-11-09' },
        ]}
        demoData
      />,
    );
    expect(screen.queryByText('DEMO DATA:')).not.toBeInTheDocument();
    const sourceFooter = screen.getByText('Synthetic demo data, 2026-11-09');
    expect(sourceFooter).toHaveClass('metric-source-footer');
    expect(screen.getAllByText('Synthetic demo data, 2026-11-09')).toHaveLength(1);
  });

  it('explains metric terminology through a clickable info control', () => {
    render(
      <MetricList
        title="Valuation"
        metrics={[{ label: 'P/E (TTM)', value: '22.54', source: 'FMP', asOf: '2026-11-09' }]}
      />,
    );

    const helpButton = screen.getByRole('button', { name: 'Explain P/E (TTM)' });
    expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(helpButton);
    expect(helpButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('tooltip')).toHaveTextContent(/share price divided by earnings per share/i);
  });
});
