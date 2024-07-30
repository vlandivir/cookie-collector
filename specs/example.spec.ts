import { test, expect } from '@playwright/test';

const requests: any = [];

// Example test suite
test.describe('Example Test Suite', () => {

    // Example test case
    test('should navigate to the page and check title', async ({ page, context }) => {
        // Collect all requests and their responses
        page.on('response', async response => {
            const request = response.request();
            const url = request.url();
            const setCookieHeader = (await response.allHeaders())['set-cookie'];

            // Exclude requests to partytown worker
            // if (url === 'https://tripleten.com/se-light/~partytown/debug/proxytown') {
            //     return;
            // }

            if (setCookieHeader) {
                requests.push({ url, setCookieHeader });
            }
        });

        await page.addInitScript(() => {
            // Save the original document.cookie property descriptor
            const originalCookieDescriptor: any = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

            // Define a new property descriptor for document.cookie
            Object.defineProperty(window.document, 'cookie', {
                configurable: true,
                enumerable: true,
                get() {
                    // Return the current cookies
                    return originalCookieDescriptor.get.call(window.document);
                },
                set(value) {
                    // Capture the stack trace to identify the source
                    try {
                        throw new Error('Tracking cookie set');
                    } catch (e: any) {
                        console.log('New cookie set:', value);
                        console.log('Stack trace:', e.stack);
                    }

                    // Set the cookie using the original descriptor's setter
                    originalCookieDescriptor.set.call(window.document, value);
                }
            });

            window.console.log('addInitScript');
        });

        // Navigate to the page
        await page.goto('https://tripleten.com/');

        // Wait for 45 seconds
        await page.waitForTimeout(45 * 1000);

        // Check if the heading text is correct
        // const heading = page.locator('h1');
        // await expect(heading).toHaveText('Start a fast‑growing career making great money in just 10 months');

        // Log all requests with Set-Cookie headers
        console.log('Requests with Set-Cookie headers:');
        requests.forEach((req: any) => {
            console.log(`URL: ${req.url}`);
            console.log(`Set-Cookie: ${req.setCookieHeader}`);
        });
    });
});
