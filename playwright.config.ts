import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 13'], viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Astro manda `astro preview` a segundo plano si detecta un agente de IA; aquí debe quedarse en primer plano.
    env: { CLAUDECODE: '' },
  },
});
