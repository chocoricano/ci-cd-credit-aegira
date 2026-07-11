import { test, expect } from '@playwright/test';

/**
 * Latihan intro 2 — Form interaction.
 * Skenario CreditApp: petugas memasukkan data pemohon di formulir.
 *
 * Jalankan: npx playwright test tests/workshop/intro/02-form-interaction.spec.js
 */
test.describe('Intro 2 — Form interaction', () => {
  test('contoh: isi nama lengkap dan assert nilai input', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Nama lengkap').fill('Budi Santoso');
    await expect(page.getByLabel('Nama lengkap')).toHaveValue('Budi Santoso');
    await expect(page.locator('#fullName')).toHaveValue('Budi Santoso');
  });

  /**
   * TODO PESERTA:
   * 1. Hapus test.skip di bawah
   * 2. Isi field Nomor telepon dengan '08123456789'
   * 3. Assert nilai input dengan toHaveValue
   */
  test.skip('TODO peserta: isi nomor telepon', async ({ page }) => {
    await page.goto('/');

    // await page.getByLabel('Nomor telepon').fill('08123456789');
    // await expect(page.getByLabel('Nomor telepon')).toHaveValue('08123456789');
  });

  /**
   * TODO PESERTA (opsional):
   * Isi penghasilan bulanan 8500000 dan assert toHaveValue.
   */
  test.skip('TODO opsional: isi penghasilan bulanan', async ({ page }) => {
    await page.goto('/');

    // await page.getByLabel('Penghasilan bulanan (Rp)').fill('8500000');
    // await expect(page.locator('#monthlyIncome')).toHaveValue('8500000');
  });
});
