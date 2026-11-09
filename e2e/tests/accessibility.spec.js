import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility evidence for the Testing discipline's "beyond the obvious"
 * requirement — automated WCAG scan via axe-core, both on the empty search
 * screen and on a fully-rendered company summary.
 */
test.describe('Accessibility (axe-core / WCAG)', () => {
  test('search screen has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('a rendered company summary has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'NVIDIA (NVDA)' }).click();
    await expect(page.getByRole('heading', { name: /NVIDIA Corporation/ })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
