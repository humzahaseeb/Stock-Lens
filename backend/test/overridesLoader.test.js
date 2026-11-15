import { describe, it, expect } from 'vitest';
import { loadOverrides, listAvailableOverrideTickers } from '../src/lib/overridesLoader.js';

describe('overridesLoader', () => {
  it('lists the seeded override tickers', () => {
    const tickers = listAvailableOverrideTickers();
    expect(tickers).toEqual(expect.arrayContaining(['NVDA', 'RR.L']));
  });

  it('loads NVDA overrides with business model + moat filled in', async () => {
    const overrides = await loadOverrides('NVDA');
    expect(overrides.name).toBe('NVIDIA Corporation');
    expect(overrides.businessModel.summary).toMatch(/GPU/i);
    expect(overrides.businessModel.source).toBeTruthy();
    expect(overrides.competitiveMoat.summary).toBeTruthy();
  });

  it('has curated NVDA analysis and analyst snapshot with source metadata', async () => {
    const overrides = await loadOverrides('NVDA');
    expect(overrides.analystConsensus.needsResearch).toBe(false);
    expect(overrides.analystConsensus.rating).toBe('Strong Buy');
    expect(overrides.analystConsensus.numberOfAnalysts).toBe(34);
    expect(overrides.analystConsensus.source).toMatch(/Google Finance/);
    expect(overrides.bullCase.needsResearch).toBe(false);
    expect(overrides.bearCase.needsResearch).toBe(false);
    expect(overrides.bullCase.source).toBe('Yahoo Finance');
    expect(overrides.bearCase.source).toBe('Yahoo Finance');
    expect(overrides.bullCase.sourcePending).toBeUndefined();
    expect(Array.isArray(overrides.bullCase.points)).toBe(true);
    expect(overrides.bullCase.points.length).toBeGreaterThan(0);
  });

  it('returns null for a ticker with no override file', async () => {
    const overrides = await loadOverrides('ZZZZ');
    expect(overrides).toBeNull();
  });
});
