import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
declare global {
    interface Window {
        clientSideCookies: {
            url: string;
            cookieString: string;
        }[];
    }
}

interface CookieRequest {
    url: string;
    cookies: {
        name: string;
        cookie: string;
    }[];
    type: 'client' | 'server';
}

dotenv.config();
const requests: CookieRequest[] = [];

function parseCookies(cookieString: string) {
    return cookieString.split('\n').map(cookie => {
        let [cookiePair, ...attributePairs] = cookie.split(';').map(part => part.trim());
        let [name] = cookiePair.split('=');

        const attribs: Record<string, string> = {}
        attributePairs.forEach(attr => {
            let [key, val] = attr.split('=').map(part => part.trim());
            attribs[key.toLowerCase()] = val || 'true';
        });
        return {name: [attribs['domain'], name].join(' ').trim(), cookie};
    });
}

function getUrl(url: string) {
    const parsedUrl = new URL(url);
    return [parsedUrl.host, parsedUrl.pathname.split(':').shift()].join('');
}

// Example test suite
test.describe('Example Test Suite', () => {
    test.afterAll(async () => {
        // console.log(JSON.stringify(requests, null, 2));

        const collectedCookies: Record<string, {type: string, urls: string[]}> = {};
        requests.forEach((r) => {
            const { url, cookies, type } = r;
            cookies.forEach(c => {
                const { name } = c;
                if (!collectedCookies[name]) {
                    collectedCookies[name] = { type, urls: [] }
                }
                if (!collectedCookies[name].urls.includes(url)) {
                    collectedCookies[name].urls.push(url);
                }
            })
        });

        // console.log(JSON.stringify(collectedCookies, null, 2))
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
        page.on('response', async response => {
            const request = response.request();

            const url = getUrl(request.url());
            const setCookieHeader = (await response.allHeaders())['set-cookie'];

            // Exclude requests to partytown worker
            // if (url === 'https://tripleten.com/se-light/~partytown/debug/proxytown') {
            //     return;
            // }

            if (setCookieHeader) {
                const cookies = parseCookies(setCookieHeader)
                requests.push({ url, cookies, type: 'server' });
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

        await page.click('.header__login-button');
        await page.waitForURL('id.tripleten.com');

        await page.fill('#username', process.env.USERMAIL || '');
        // await page.fill('input[name="password"]', process.env.PASSWORD!); // Password from .env file




        // Wait for 40 seconds
        // await page.waitForTimeout(40 * 1000);

        const clientSideCookies = await page.evaluate(() => window.clientSideCookies);
        clientSideCookies.forEach((cookie) => {
            const {url, cookieString} = cookie;
            const cookies = parseCookies(cookieString)
            requests.push({ url: getUrl(url), cookies, type: 'client' });
        });

        // Check if the heading text is correct
        // const heading = page.locator('h1');
        // await expect(heading).toHaveText('Start a fast‑growing career making great money in just 10 months');
    });
});
