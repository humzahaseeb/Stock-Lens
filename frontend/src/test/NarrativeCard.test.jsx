import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NarrativeCard from '../components/NarrativeCard.jsx';

describe('NarrativeCard', () => {
  it('renders a filled-in narrative section with its source and date', () => {
    render(
      <NarrativeCard
        title="Business model"
        section={{ summary: 'Sells GPUs.', source: 'NVIDIA IR', asOf: '2026-11-01' }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Business model' })).toBeInTheDocument();
    expect(screen.getByText('Sells GPUs.')).toBeInTheDocument();
    expect(screen.getByText(/NVIDIA IR/)).toBeInTheDocument();
    expect(screen.getByText(/2026-11-01/)).toBeInTheDocument();
  });

  it('shows a research-needed warning instead of fabricated data', () => {
    render(
      <NarrativeCard
        title="Analyst consensus"
        section={{ needsResearch: true, researchNote: 'Check a consensus source.' }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Check a consensus source.');
  });

  it('renders a list of bullet points', () => {
    render(<NarrativeCard title="Bull case" section={{ points: ['Point A', 'Point B'] }} />);
    expect(screen.getByText('Point A')).toBeInTheDocument();
    expect(screen.getByText('Point B')).toBeInTheDocument();
  });

  it('renders a fallback message when the section is missing entirely', () => {
    render(<NarrativeCard title="Bear case" section={null} />);
    expect(screen.getByText('Not available for this company.')).toBeInTheDocument();
  });
});
