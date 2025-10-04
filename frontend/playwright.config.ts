import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally for flaky tests
  workers: process.env.CI ? 1 : 4, // Reduce to 4 workers to avoid overwhelming dev server
  reporter: 'html',
  timeout: 90 * 1000, // 90 seconds per test
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry', // 'on-first-retry' | 'on' | 'off' | 'retain-on-failure'
    video: 'retain-on-failure', // 'on' | 'off' | 'retain-on-failure' | 'on-first-retry'
    screenshot: 'only-on-failure', // 'on' | 'off' | 'only-on-failure'
    actionTimeout: 15 * 1000, // 15 seconds for each action
    navigationTimeout: 30 * 1000, // 30 seconds for page navigations
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000, // 5 minutes for Angular to start (development mode can be slow)
    stdout: 'ignore', // Reduce noise in test output
    stderr: 'pipe',
  },
});

