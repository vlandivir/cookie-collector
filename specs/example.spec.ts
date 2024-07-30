import { test, expect } from '@playwright/test';

// Example test suite
test.describe('Example Test Suite', () => {

    // Example test case
    test('should navigate to the page and check title', async ({ page }) => {
        // Navigate to the page
        await page.goto('https://tripleten.com/se-light/');

        // Check if the heading text is correct
        const heading = page.locator('h1');
        await expect(heading).toHaveText('Start a fast‑growing career making great money in just 10 months');
    });

});
