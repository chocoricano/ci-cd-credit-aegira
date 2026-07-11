import { test, expect } from '@playwright/test';

/**
 * Latihan intro 3 — Step navigation.
 * Skenario CreditApp: user mengisi formulir dan pindah ke langkah verifikasi dokumen.
 *
 * Jalankan: npx playwright test tests/workshop/intro/03-step-navigation.spec.js
 */

async function fillMinimalForm(page) {
  await page.getByLabel('Nama lengkap').fill('Budi Santoso');
  await page.getByLabel('Nomor telepon').fill('08123456789');
  await page.getByLabel('Penghasilan bulanan (Rp)').fill('8500000');
  await page.getByLabel('Total cicilan & utang bulanan saat ini (Rp)').fill('2200000');
  await page.getByLabel('Plafon yang diajukan (Rp)').fill('40000000');
}

test.describe('Intro 3 — Step navigation', () => {
  test('formulir terisi dapat lanjut ke verifikasi dokumen', async ({ page }) => {
    await page.goto('/');
    await fillMinimalForm(page);

    await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();

    await expect(page.locator('[data-component="verifikasi-dokumen"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Verifikasi dokumen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Periksa' }).first()).toBeVisible();
  });

  /**
   * TODO PESERTA:
   * 1. Hapus test.skip
   * 2. Selesaikan alur sampai langkah verifikasi (boleh pakai fillMinimalForm + klik lanjut)
   * 3. Klik tombol Periksa pada dokumen pertama
   * 4. Assert badge "Terverifikasi" terlihat
   */
  test.skip('TODO peserta: klik Periksa pada dokumen pertama', async ({ page }) => {
    await page.goto('/');
    // await fillMinimalForm(page);
    // await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();
    // await expect(page.locator('[data-component="verifikasi-dokumen"]')).toBeVisible();

    // await page.locator('[data-verify]').first().click();
    // await expect(page.getByText('Terverifikasi').first()).toBeVisible();
  });
});
