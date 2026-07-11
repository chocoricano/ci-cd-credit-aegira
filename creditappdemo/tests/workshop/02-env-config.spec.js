import { test, expect } from '@playwright/test';
import { completeFlowToScoring } from './helpers.js';

/**
 * Sesi 2 — Env config & endpoint detection.
 * Mapping slide: Wrong API URL, Wrong Endpoint Detection.
 *
 * Tes pertama berjalan dengan config default (mock).
 * Tes kedua & ketiga adalah tugas peserta (test.skip) — lihat docs/workshop/.
 */

test.describe('Env config — mock baseline', () => {
  test('mock mode does not call real scoring API', async ({ page }) => {
    const scoringRequests = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('credit-scoring')) {
        scoringRequests.push(req.url());
      }
    });

    await completeFlowToScoring(page);
    await expect(page.locator('[data-component="hasil-scoring"]')).toBeVisible({
      timeout: 10_000,
    });

    expect(scoringRequests).toHaveLength(0);
  });
});

/**
 * TODO PESERTA (Lab 2.3):
 * 1. Hapus test.skip di bawah
 * 2. Jalankan dengan env uat + wrong URL, mis.:
 *    VITE_SCORING_MODE=uat VITE_BACKEND_BASE_URL=http://127.0.0.1:59999 npx playwright test 02-env-config
 * 3. Assert UI error state
 */
test.describe('Env config — failure scenarios (peserta)', () => {
  test.skip('wrong backend URL shows scoring error', async ({ page }) => {
    await completeFlowToScoring(page);
    await expect(page.getByRole('heading', { name: 'Scoring gagal diproses' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-component="scoring-error"]')).toBeVisible();
  });

  test.skip('request URL contains configured backend base (uat mode)', async ({ page }) => {
    let capturedUrl = '';
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('credit-scoring')) {
        capturedUrl = req.url();
      }
    });

    await completeFlowToScoring(page);
    // Sesuaikan dengan env Anda, contoh: expect(capturedUrl).toContain('localhost:8080');
    expect(capturedUrl).toContain('api/v1/credit-scoring/simulate');
  });
});
