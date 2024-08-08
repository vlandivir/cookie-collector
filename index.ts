import { chromium } from 'playwright';

import dotenv from 'dotenv';
dotenv.config();

import { addCookieCollector, parseClientSideCookies, getCollectedCookies } from './tools/cookies-collector';

const COOKIE_PAGES = [
    "https://docs.tripleten.com/support/suspension.html",
    "https://tripleten.com/bi/?utm_campaign=blog_posts&utm_medium=content&utm_source=pr&utm_term=articlename&utm_content=HowDoIChoosetheRightProgram",
    "https://tripleten.com/blog/?a1b1dc43_page=32",
    "https://tripleten.com/blog/posts/deploying-data-science-web-apps-to-the-cloud",
    // "https://tripleten.com/blog/posts/first-things-first-a-brief-guide-to-data-loading-cleaning-and-exploration-part-2?utm_campaign=blog_posts&utm_medium=content&utm_source=pr&utm_term=articlename&utm_content=ABriefGuidetoDataLoadingCleaningandExplorationPart3",
    "https://tripleten.com/blog/posts/job-market-overview-4",
    // "https://tripleten.com/blog/posts/top-5-myths-about-bootcamps",
    "https://tripleten.com/blog/posts/youve-got-the-degree-but-no-experience-what-now",
    "https://tripleten.com/quiz/career-quiz/?utm_campaign=blog_posts&utm_medium=content&utm_source=pr&utm_term=articlename&utm_content=HowDoIChoosetheRightProgram",
    // "https://tripleten.com/software-engineer/?utm_campaign=blog_posts&utm_medium=content&utm_source=pr&utm_term=articlename&utm_content=Howcomprehensiveareyourbootcamps",
    "https://tripleten.com/special/podcast/?utm_campaign=blog_posts&utm_medium=content&utm_source=pr&utm_term=articlename&utm_content=TripleTenTechJobsMarketOverviewOctober2023",
    "https://tripleten.com/se-light/",
    "https://tripleten.com/sso/auth",
    // "https://tripleten.com/order/web/",
    // "https://tripleten.com/order/web/details/upfront"
];

const main = async () => {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    // await page.goto('https://www.google.com/', {waitUntil: 'domcontentloaded'});
    // await page.waitForTimeout(8 * 1000);
    // await page.pause();

    await addCookieCollector(page);

    // Navigate to a URL
    // await page.goto('https://tripleten.com/');
    for(const i in COOKIE_PAGES) {
        await page.goto(COOKIE_PAGES[i], {waitUntil: 'domcontentloaded'});

        // await page.evaluate(() => {
        //     const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        //     if (document.scrollingElement) {
        //         let scrollStep = 100;
        //         let scrollDelay = 100;
        //         const scroll = () => {
        //             if (document.scrollingElement) {
        //                 if (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        //                     document.scrollingElement.scrollBy(0, scrollStep);
        //                     delay(scrollDelay).then(scroll);
        //                 }
        //             }
        //         };
        //         scroll();
        //     }
        // });

        await page.waitForTimeout(8 * 1000);
        await parseClientSideCookies(page);
        const collectedCookies = getCollectedCookies();
        console.log(COOKIE_PAGES[i], Object.keys(collectedCookies).length);
    }

    // Navigate to the login page
    await page.goto('https://tripleten.com/sso/auth?retpath=%2Fprofile%2F%3Ffrom%3D%252Fsuccess%252F');
    await page.fill('#username', process.env.USERMAIL || '');
    await page.locator(".input_type_submit").click();
    await page.fill('#password', process.env.PASSWORD || '');
    await page.locator(".input_type_submit").click();
    await parseClientSideCookies(page);
    console.log('AUTH', Object.keys(getCollectedCookies()).length);


    await page.waitForTimeout(8 * 1000);

    await page.goto("https://tripleten.com/order/web/details/upfront")
    await parseClientSideCookies(page);
    console.log('ORDER', Object.keys(getCollectedCookies()).length);

    // Pause here to open the Playwright Inspector for debugging
    // await page.pause();
    // await page.waitForTimeout(10 * 1000);
    await page.waitForTimeout(8 * 1000);

    const COOKIE_LENGTH = 40;
    const collectedCookies = getCollectedCookies();
    console.log(JSON.stringify(
        Object.keys(collectedCookies).map((k) => {
            const { type, urls } = collectedCookies[k];
            const padding = ' '.repeat(COOKIE_LENGTH - k.length);
            // return `${type}    ${k + padding}    ${urls.join()}`
            return `${k + padding}    ${type}    ${urls.join()}`
        }).sort(), null, 2
    ));

    // Take a screenshot
    // await page.screenshot({ path: `./screenshots/screenshot-${Date.now()}.png` });

    // Close the browser
    await browser.close();
}

main();
