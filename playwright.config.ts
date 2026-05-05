import { defineConfig } from '@playwright/test'

export const E2E_PORT = 4567
export const CONTAINER_NAME = 'floci-e2e'

const APP_PORT = 3001

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    headless: true,
  },
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  webServer: {
    command: `AWS_ENDPOINT=http://localhost:${E2E_PORT} npm run dev -- --port ${APP_PORT}`,
    url: `http://localhost:${APP_PORT}`,
    reuseExistingServer: false,
  },
})
