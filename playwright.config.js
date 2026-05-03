const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'node src/server.js',
    port: 8080,
    timeout: 10000,
    reuseExistingServer: true,
    env: {
      NODE_ENV: 'test',
      PORT: '8080',
    },
  },
});
