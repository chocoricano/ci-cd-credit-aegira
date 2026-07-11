import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/workshop',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: process.env.PW_TRACE === 'on' ? 'on' : 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-mock',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_SCORING_MODE: process.env.VITE_SCORING_MODE || 'mock',
      VITE_BACKEND_BASE_URL: process.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080',
      VITE_SCORING_PATH: process.env.VITE_SCORING_PATH || '/api/v1/credit-scoring/simulate',
      VITE_SCORING_SCHEMA: process.env.VITE_SCORING_SCHEMA || 'aegira',
      VITE_SCORING_DEFAULT_TENURE: process.env.VITE_SCORING_DEFAULT_TENURE || '12',
    },
  },
});
