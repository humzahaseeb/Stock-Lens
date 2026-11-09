import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalystForecastCards from '../components/AnalystForecastCards.jsx';

describe('AnalystForecastCards', () => {
  it('renders rating distribution and 12-month target range when available', () => {
    render(
      <AnalystForecastCards
        ticker="NVDA"
        consensus={{
          rating: 'Strong Buy',
          breakdown: { strongBuy: 33, buy: 0, hold: 1, sell: 0, strongSell: 0 },
          numberOfAnalysts: 34,
          currentPrice: 178.3,
          ratingPeriod: 'past 3 months',
          priceTarget12m: 323.45,
          priceTargetHigh: 465,
          priceTargetLow: 275,
          priceTargetAnalystCount: 34,
          priceTargetPeriod: 'last 3 months',
          currency: 'USD',
          source: 'Finnhub',
          asOf: '2026-11-09',
        }}
        valuationMetrics={[{ label: 'Price', value: '178.30 USD' }]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Analyst ratings' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Analyst ratings: 33 buy, 1 hold, 0 sell' })).toBeInTheDocument();
    expect(screen.getByText('Strong Buy')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '12-month forecast' })).toBeInTheDocument();
    expect(screen.getByText('$465.00')).toBeInTheDocument();
    expect(screen.getByText('$323.45')).toBeInTheDocument();
    expect(screen.getByText('$275.00')).toBeInTheDocument();
    expect(screen.getByText('(+160.80%)')).toBeInTheDocument();
    expect(screen.getByText('(+81.41%)')).toBeInTheDocument();
    expect(screen.getByText('(+54.23%)')).toBeInTheDocument();
    expect(screen.getByText('Current $178.30')).toBeInTheDocument();
  });

  it('explains when rating counts and price targets are unavailable', () => {
    render(<AnalystForecastCards ticker="RR.L" consensus={null} valuationMetrics={[]} />);

    expect(screen.getByText(/Analyst rating breakdown is unavailable/)).toBeInTheDocument();
    expect(screen.getByText(/12-month analyst price targets are not available/)).toBeInTheDocument();
    expect(screen.getByText('Current Unavailable')).toBeInTheDocument();
  });

  it('clearly labels fabricated values as demo data', () => {
    render(
      <AnalystForecastCards
        ticker="RR.L"
        consensus={{
          demoData: true,
          demoNote: 'Illustrative only, not real forecasts.',
        }}
        valuationMetrics={[]}
      />,
    );

    expect(screen.getByText('DEMO DATA:')).toBeInTheDocument();
    expect(screen.getByText('Illustrative only, not real forecasts.')).toBeInTheDocument();
  });
});
