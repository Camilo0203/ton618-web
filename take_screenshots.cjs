const { chromium } = require('playwright');

async function takeScreenshot(page, filename, description) {
  await page.screenshot({ path: filename, fullPage: false });
  console.log(`[PASS] Screenshot saved: ${filename} (${description})`);
}

async function run() {
  const browser = await chromium.launch();
  const baseUrl = 'http://localhost:5173';
  
  // 1. Black screen bug at 768px
  const page768 = await browser.newPage();
  await page768.setViewportSize({ width: 768, height: 1024 });
  await page768.goto(baseUrl, { waitUntil: 'networkidle' });
  await page768.waitForTimeout(1000);
  await takeScreenshot(page768, 'black_screen_768.png', '768px Viewport');
  
  // 2. Navbar/hamburger at 390px
  const page390 = await browser.newPage();
  await page390.setViewportSize({ width: 390, height: 844 });
  await page390.goto(baseUrl, { waitUntil: 'networkidle' });
  await takeScreenshot(page390, 'navbar_390_closed.png', '390px Navbar Closed');
  
  // Try to open hamburger menu
  try {
    const hamburger = page390.locator('button[aria-label="Toggle menu"], button:has(svg)'); // guessing selector
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page390.waitForTimeout(500);
      await takeScreenshot(page390, 'navbar_390_open.png', '390px Navbar Open');
    }
  } catch (e) {
    console.error('Could not find or click hamburger menu:', e.message);
  }

  // 3. Language selector at 1440px
  const page1440 = await browser.newPage();
  await page1440.setViewportSize({ width: 1440, height: 900 });
  await page1440.goto(baseUrl, { waitUntil: 'networkidle' });
  await takeScreenshot(page1440, 'landing_1440.png', '1440px Landing');
  
  // Switch language (guessing selector for language button)
  try {
    const langButton = page1440.locator('button:has-text("EN"), button:has-text("ES"), button[aria-label*="language"]');
    if (await langButton.isVisible()) {
      await langButton.click();
      await page1440.waitForTimeout(500);
      await takeScreenshot(page1440, 'lang_switch_desktop.png', 'Language Switch Desktop');
    }
  } catch (e) {
    console.error('Could not find or click language selector:', e.message);
  }

  await browser.close();
}

run().catch(console.error);
