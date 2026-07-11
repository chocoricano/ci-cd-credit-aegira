import { test, expect } from '@playwright/test';
import { completeFlowToScoring } from './helpers.js';

/**
 * Sesi 2 & 4 — Simulated network failure.
 * Mapping slide: 💥 Simulated Failure — route.abort() + expect error UI.
 *
 * Catatan: tes ini memakai route interception. Di mode mock tidak ada fetch nyata,
 * jadi skenario ini relevan saat VITE_SCORING_MODE=uat. Untuk demo workshop tanpa
 * backend, tes di-skip kecuali peserta menjalankan dengan mode uat.
 */

test.describe('Network failure simulation', () => {
  test.skip('simulated API failure shows error state (requires uat mode)', async ({ page }) => {
    await page.route('**/api/v1/credit-scoring/simulate', (route) => route.abort('failed'));

    await completeFlowToScoring(page);

    await expect(page.locator('[data-component="scoring-error"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('heading', { name: 'Scoring gagal diproses' })).toBeVisible();
  });
});

/**
 * Demo route.abort untuk peserta — selalu jalan, memblokir asset contoh.
 * Menunjukkan pola intercept tanpa bergantung backend.
 */
test.describe('Playwright intercept pattern (demo)', () => {
  test('route.abort blocks matching URL pattern', async ({ page }) => {
    let aborted = false;
    await page.route('**/api/v1/credit-scoring/simulate', (route) => {
      aborted = true;
      route.abort('failed');
    });

    await page.goto('/');
    await page.evaluate(() =>
      fetch('http://localhost:8080/api/v1/credit-scoring/simulate', { method: 'POST' }).catch(
        () => {},
      ),
    );

    expect(aborted).toBe(true);
  });
});
