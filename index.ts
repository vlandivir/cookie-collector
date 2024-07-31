import { chromium } from 'playwright';

const main = async () => {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to a URL
    await page.goto('https://tripleten.com/');

    // Pause here to open the Playwright Inspector for debugging
    await page.pause();

    // Take a screenshot
    await page.screenshot({ path: `./screenshots/screenshot-${Date.now()}.png` });

    // Close the browser
    // await browser.close();
}

main();
