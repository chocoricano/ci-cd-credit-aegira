import { test, expect } from '@playwright/test';

/**
 * Latihan intro 1 — Page load & visibility.
 * Skenario CreditApp: user membuka halaman pengajuan kredit.
 *
 * Jalankan: npx playwright test tests/workshop/intro/01-page-load.spec.js
 */
test.describe('Intro 1 — Page load', () => {
  test('halaman utama menampilkan judul dan formulir pengajuan', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Pengajuan kredit digital' })).toBeVisible();
    await expect(page.getByText('Formulir → verifikasi dokumen → scoring otomatis')).toBeVisible();
    await expect(page.locator('[data-component="form-pengajuan"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Formulir pengajuan kredit' })).toBeVisible();
  });

  test('field wajib formulir tersedia', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('Nama lengkap')).toBeVisible();
    await expect(page.getByLabel('Nomor telepon')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lanjut verifikasi dokumen' })).toBeVisible();
  });
});
