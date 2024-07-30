import { defineConfig } from '@playwright/test';

export default defineConfig({
    // Base URL for your tests, can be omitted if not needed
    testDir: './specs',
    use: {
        baseURL: 'https://tripleten.com',
        headless: true, // Set to false to see the browser during test runs
        viewport: { width: 1280, height: 720 }, // Default browser viewport size
        ignoreHTTPSErrors: true, // Useful for testing with self-signed certificates
    },
    // Define browsers to test
    projects: [
        {
            name: 'Chromium',
            use: { browserName: 'chromium' },
        },
    ],
    // Global timeout for the entire test suite
    timeout: 60000, // 60 seconds
    // Test retries in case of failures
    retries: 1,
    // Test reporters, e.g., list, dot, json
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report' }],
    ],
});
