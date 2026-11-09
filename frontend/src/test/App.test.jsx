import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const sampleResponse = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  generatedAt: '2026-11-09T12:00:00.000Z',
  financialsSource: 'unavailable',
  disclaimer: 'This is not financial advice.',
  businessModel: { summary: 'Sells GPUs.', source: 'NVIDIA IR', asOf: '2026-11-01' },
  financialHealth: { metrics: [] },
  competitiveMoat: { summary: 'CUDA ecosystem.', source: 'Analyst notes', asOf: '2026-11-01' },
  valuation: { metrics: [] },
  bullCase: { needsResearch: true, researchNote: 'Add your bull case.' },
  bearCase: { needsResearch: true, researchNote: 'Add your bear case.' },
  analystConsensus: { needsResearch: true, researchNote: 'Add consensus data.' },
};

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => sampleResponse })),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lets a user search for a worked example and renders the summary', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /NVIDIA \(NVDA\)/ }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /NVIDIA Corporation/ })).toBeInTheDocument();
    });
    expect(screen.getByText('Sells GPUs.')).toBeInTheDocument();
  });

  it('shows an error message when the API call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({ error: 'Unknown ticker: ZZZZ' }) })),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Company ticker'), 'ZZZZ');
    await user.click(screen.getByRole('button', { name: 'Analyse' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Unknown ticker: ZZZZ');
    });
  });
});
