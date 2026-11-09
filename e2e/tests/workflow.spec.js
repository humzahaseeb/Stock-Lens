import { test, expect } from '@playwright/test';

const COMPANIES = [
  { button: 'NVIDIA (NVDA)', name: 'NVIDIA Corporation', ticker: 'NVDA' },
  { button: 'Rolls-Royce (RR.L)', name: 'Rolls-Royce Holdings plc', ticker: 'RR.L' },
];

test.describe('Stock Lens — full workflow', () => {
  for (const company of COMPANIES) {
    test(`searching ${company.ticker} renders a full one-page summary`, async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Stock Lens' })).toBeVisible();

      await page.getByRole('button', { name: company.button }).click();

      await expect(page.getByRole('heading', { name: new RegExp(company.name) })).toBeVisible();

      // Every required section renders, per deliverable 1's "what the tool covers".
      for (const heading of [
        'Business model',
        'Financial health',
        'Income statement',
        'Competitive moat',
        'Valuation',
        'Bull case',
        'Bear case',
        'Analyst ratings',
        '12-month forecast',
      ]) {
        await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      }

      // The disclaimer is always visible — a hard success criterion from the proposal.
      await expect(page.getByText(/not financial advice/i)).toBeVisible();
    });
  }

  test('shows a clear error for an unknown ticker instead of a blank/broken page', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Company ticker').fill('ZZZZ');
    await page.getByRole('button', { name: 'Analyse' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
