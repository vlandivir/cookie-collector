import { test } from '@playwright/test';
import dotenv from 'dotenv';

import { addCookieCollector, parseClientSideCookies, getCollectedCookies } from '../tools/cookies-collector';

dotenv.config();


// Example test suite
test.describe('Example Test Suite', () => {
    test.afterAll(async () => {
        const collectedCookies = getCollectedCookies();
        console.log(JSON.stringify(
            Object.keys(collectedCookies).map((k) => {
                const { type, urls } = collectedCookies[k];
                return `${type}    ${k}    ${urls.join()}`
            }).sort(), null, 2
        ));
    });

    // Example test case
    test('should navigate to the page and check title', async ({ page }) => {
        // Collect all requests and their responses
        await addCookieCollector(page);

        // Navigate to the page
        await page.goto('https://tripleten.com/sso/auth?retpath=%2Fprofile%2F%3Ffrom%3D%252Fsuccess%252F');

        await page.fill('#username', process.env.USERMAIL || '');
        await page.locator(".input_type_submit").click();

        await page.fill('#password', process.env.PASSWORD || '');
        await page.locator(".input_type_submit").click();

        await page.goto('https://tripleten.com/se-light/');

        // Wait for 40 seconds
        await page.waitForTimeout(40 * 1000);

        await parseClientSideCookies(page);

        // Check if the heading text is correct
        // const heading = page.locator('h1');
        // await expect(heading).toHaveText('Start a fast‑growing career making great money in just 10 months');
    });
});
