import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fetchStockChart } from '../lib/api.js';
import StockPriceChart from '../components/StockPriceChart.jsx';

vi.mock('../lib/api.js', () => ({ fetchStockChart: vi.fn() }));

const chartData = {
  ticker: 'NVDA',
  range: '1d',
  currency: 'USD',
  exchangeTimezone: 'America/New_York',
  asOf: 1700000060,
  currentPrice: 104.5,
  previousClose: 100,
  change: 4.5,
  changePercent: 4.5,
  open: 102,
  dayHigh: 106,
  dayLow: 99,
  fiftyTwoWeekHigh: 120,
  fiftyTwoWeekLow: 80,
  points: [
    { time: 1700000000, close: 101 },
    { time: 1700000060, close: 104.5 },
  ],
  source: 'Yahoo Finance',
  delayNote: 'Market data may be delayed.',
};

describe('StockPriceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchStockChart).mockResolvedValue(chartData);
  });

  it('renders live chart data and requests a new range when selected', async () => {
    render(<StockPriceChart ticker="NVDA" />);

    expect(await screen.findByText('$104.50')).toBeInTheDocument();
    expect(screen.getByText('+$4.50 today')).toBeInTheDocument();
    const sourceFooter = screen.getByText(/Source: Yahoo Finance/, { selector: '.stock-chart-as-of' });
    expect(sourceFooter).toBeInTheDocument();
    expect(screen.getByText('Market data may be delayed.').compareDocumentPosition(sourceFooter)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText('Market data may be delayed.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /NVDA 1d stock price chart/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '5D' }));
    expect(await screen.findByText('+$4.50 past 5 days')).toBeInTheDocument();
    expect(screen.getAllByText('Tue, Nov 14')).toHaveLength(2);
    await waitFor(() => {
      expect(fetchStockChart).toHaveBeenLastCalledWith('NVDA', '5d', expect.any(AbortSignal));
    });
  });

  it('shows a clear error if real quote data cannot be loaded', async () => {
    vi.mocked(fetchStockChart).mockRejectedValue(new Error('Stock chart unavailable'));
    render(<StockPriceChart ticker="RR" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Stock chart unavailable');
  });
});
