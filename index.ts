import { chromium } from 'playwright';

import dotenv from 'dotenv';
dotenv.config();

import { addCookieCollector, parseClientSideCookies, getCollectedCookies } from './tools/cookies-collector';

const main = async () => {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    await addCookieCollector(page);

    // Navigate to the login page
    await page.goto('https://tripleten.com/sso/auth?retpath=%2Fprofile%2F%3Ffrom%3D%252Fsuccess%252F');
    await page.fill('#username', process.env.USERMAIL || '');
    await page.locator(".input_type_submit").click();
    await page.fill('#password', process.env.PASSWORD || '');
    await page.locator(".input_type_submit").click();

    // Navigate to a URL
    await page.goto('https://tripleten.com/');

    // Pause here to open the Playwright Inspector for debugging
    // await page.pause();

    await page.waitForTimeout(10 * 1000);
    await parseClientSideCookies(page);

    const COOKIE_LENGTH = 40;
    const collectedCookies = getCollectedCookies();
    console.log(JSON.stringify(
        Object.keys(collectedCookies).map((k) => {
            const { type, urls } = collectedCookies[k];
            const padding = ' '.repeat(COOKIE_LENGTH - k.length);
            return `${type}    ${k + padding}    ${urls.join()}`
        }).sort(), null, 2
    ));

    // Take a screenshot
    // await page.screenshot({ path: `./screenshots/screenshot-${Date.now()}.png` });

    // Close the browser
    await browser.close();
}

main();
