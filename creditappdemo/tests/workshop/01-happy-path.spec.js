import { test, expect } from '@playwright/test';
import { fillApplicationForm, verifyAllDocuments } from './helpers.js';

/**
 * Sesi 1 & 4 — Happy path (mode mock via playwright.config webServer env).
 * Mapping slide: ✅ Happy Path — config benar, data tampil normal.
 */
test.describe('Happy path — mock scoring', () => {
  test('form → verifikasi → hasil scoring dengan trace ID', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-component="form-pengajuan"]')).toBeVisible();
    await fillApplicationForm(page);
    await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();

    await expect(page.locator('[data-component="verifikasi-dokumen"]')).toBeVisible();
    await verifyAllDocuments(page);
    await page.getByRole('button', { name: 'Lanjut scoring otomatis' }).click();

    await expect(page.locator('[data-component="scoring-loading"]')).toBeVisible();
    await expect(page.locator('[data-component="hasil-scoring"]')).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.locator('[data-component="hasil-scoring"] .score-value')).toBeVisible();
    await expect(page.getByText(/Trace ID/)).toBeVisible();
    await expect(page.locator('[data-component="hasil-scoring"]').getByText(/mock-/)).toBeVisible();
  });

  test('reset demo kembali ke formulir', async ({ page }) => {
    await page.goto('/');
    await fillApplicationForm(page);
    await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();
    await verifyAllDocuments(page);
    await page.getByRole('button', { name: 'Lanjut scoring otomatis' }).click();
    await expect(page.locator('[data-component="hasil-scoring"]')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'Ajukan baru (reset demo)' }).click();
    await expect(page.locator('[data-component="form-pengajuan"]')).toBeVisible();
  });
});
