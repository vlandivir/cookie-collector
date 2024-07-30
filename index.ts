import { chromium } from 'playwright';

async function main() {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });
    // Create a new page
    const page = await browser.newPage();
    // Navigate to a URL
    await page.goto('https://tripleten.com/se-light/');
    // Take a screenshot
    await page.screenshot({ path: `./screenshots/screenshot-${Date.now()}.png` });

    // Close the browser
    // await browser.close();
}

main();
