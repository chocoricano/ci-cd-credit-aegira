/**
 * Helper alur formulir → verifikasi → scoring untuk tes workshop.
 * @param {import('@playwright/test').Page} page
 * @param {Partial<{
 *   fullName: string;
 *   phone: string;
 *   monthlyIncome: string;
 *   monthlyDebt: string;
 *   loanAmount: string;
 * }>} [overrides]
 */
export async function fillApplicationForm(page, overrides = {}) {
  const data = {
    fullName: 'Budi Santoso',
    phone: '08123456789',
    monthlyIncome: '8500000',
    monthlyDebt: '2200000',
    loanAmount: '40000000',
    ...overrides,
  };

  await page.locator('#fullName').fill(data.fullName);
  await page.locator('#phone').fill(data.phone);
  await page.locator('#monthlyIncome').fill(data.monthlyIncome);
  await page.locator('#monthlyDebt').fill(data.monthlyDebt);
  await page.locator('#loanAmount').fill(data.loanAmount);
}

/** @param {import('@playwright/test').Page} page */
export async function verifyAllDocuments(page) {
  let remaining = await page.locator('[data-verify]').count();
  while (remaining > 0) {
    await page.locator('[data-verify]').first().click();
    remaining = await page.locator('[data-verify]').count();
  }
}

/** @param {import('@playwright/test').Page} page */
export async function completeFlowToScoring(page) {
  await page.goto('/');
  await fillApplicationForm(page);
  await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();
  await expect(page.locator('[data-component="verifikasi-dokumen"]')).toBeVisible();
  await verifyAllDocuments(page);
  await page.getByRole('button', { name: 'Lanjut scoring otomatis' }).click();
  await expect(page.locator('[data-component="scoring-loading"]')).toBeVisible();
}

// Re-export expect for convenience in spec files that only import helpers
import { expect } from '@playwright/test';
export { expect };
