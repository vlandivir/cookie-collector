import { Page } from '@playwright/test';

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

const requests: CookieRequest[] = [];

const parseCookies = (cookieString: string) => {
    return cookieString.split('\n').map(cookie => {
        let [cookiePair, ...attributePairs] = cookie.split(';').map(part => part.trim());
        let [name] = cookiePair.split('=');

        const attribs: Record<string, string> = {}
        attributePairs.forEach(attr => {
            let [key, val] = attr.split('=').map(part => part.trim());
            attribs[key.toLowerCase()] = val || 'true';
        });
        return {name, nameWithDomain: [attribs['domain'], name].join(' ').trim(), cookie};
    });
}

const getUrl = (url: string) => {
    const parsedUrl = new URL(url);
    return [parsedUrl.host, parsedUrl.pathname.split(':').shift()].join('');
}

export const addCookieCollector = async (page: Page) => {
    page.on('response', async response => {
        const request = response.request();

        const url = getUrl(request.url());
        const setCookieHeader = (await response.allHeaders())['set-cookie'];

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
                        window.clientSideCookies.push({ url, cookieString })
                    }
                }

                // Set the cookie using the original descriptor's setter
                originalCookieDescriptor.set.call(document, cookieString);
            }
        });
    });
}

export const parseClientSideCookies = async (page: Page) => {
    const clientSideCookies = await page.evaluate(() => window.clientSideCookies);
    clientSideCookies.forEach((cookie) => {
        const {url, cookieString} = cookie;
        const cookies = parseCookies(cookieString)
        requests.push({ url: getUrl(url), cookies, type: 'client' });
    });
}

export const getCollectedCookies = () => {
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
    return collectedCookies;
}