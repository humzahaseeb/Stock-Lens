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

  it('has real, human-curated bull/bear case data with a cited source', async () => {
    const overrides = await loadOverrides('NVDA');
    expect(overrides.analystConsensus.needsResearch).toBe(true);
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
