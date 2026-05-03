const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080});
  await page.goto('http://localhost:5173/pricing');
  await page.waitForSelector('nav');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({path: 'pricing_screenshot.png'});
  await browser.close();
})();
