import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
