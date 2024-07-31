import { test, expect } from '@playwright/test';

declare global {
    interface Window {
        clientSideCookies: any;
    }
}

const requests: any = [];

function parseCookies(cookieString: string) {
    return cookieString.split('\n').map(cookie => {
        let [cookiePair, ...attributePairs] = cookie.split(';').map(part => part.trim());
        let [name, value] = cookiePair.split('=');

        let cookieObj: any = { name, value, attributes: {} };

        attributePairs.forEach(attr => {
            let [key, val] = attr.split('=').map(part => part.trim());
            cookieObj.attributes[key.toLowerCase()] = val || true;
        });

        return cookieObj;
    });
}

// Example test suite
test.describe('Example Test Suite', () => {
    test.afterAll(async () => {
        console.log('Requests with Set-Cookie headers:');
        console.log(JSON.stringify(requests, null, 2));
    });

    // Example test case
    test('should navigate to the page and check title', async ({ page }) => {
        // Collect all requests and their responses
        page.on('response', async response => {
            const request = response.request();
            const url = new URL(request.url()).host;
            const setCookieHeader = (await response.allHeaders())['set-cookie'];

            // Exclude requests to partytown worker
            // if (url === 'https://tripleten.com/se-light/~partytown/debug/proxytown') {
            //     return;
            // }

            if (setCookieHeader) {
                const cookies = parseCookies(setCookieHeader)
                requests.push({ url, cookies });
            }
        });

        await page.addInitScript(() => {
            // Save the original document.cookie property descriptor
            const originalCookieDescriptor: any = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
            window.clientSideCookies = [];

            // Define a new property descriptor for document.cookie
            Object.defineProperty(document, 'cookie', {
                configurable: true,
                enumerable: true,
                get() {
                    // Return the current cookies
                    return originalCookieDescriptor.get.call(document);
                },
                set(cookieString) {
                    // Capture the stack trace to identify the source
                    try {
                        throw new Error('Tracking cookie set');
                    } catch (e: any) {
                        console.log('New cookie set:', cookieString);
                        const matches = String(e.stack).match(/\((http[^)]+)\)/)
                        if (matches) {
                            const url = matches[1];
                            console.log('Cookie url', url);
                            window.clientSideCookies.push({ url, cookieString })
                        }
                    }

                    // Set the cookie using the original descriptor's setter
                    originalCookieDescriptor.set.call(document, cookieString);
                }
            });
        });

        // Navigate to the page
        await page.goto('https://tripleten.com/');

        // Wait for 45 seconds
        await page.waitForTimeout(45 * 1000);

        const cookies = await page.evaluate(() => window.clientSideCookies);
        console.log(cookies);

        // Check if the heading text is correct
        // const heading = page.locator('h1');
        // await expect(heading).toHaveText('Start a fast‑growing career making great money in just 10 months');
    });
});
