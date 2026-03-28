import { expect, test, type Page } from '@playwright/test';

async function scrollToFooter(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }));
}

async function expectPageAtTop(page: Page) {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test.describe('Legal navigation and scroll restoration', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  for (const path of ['/terms', '/privacy', '/cookies'] as const) {
    test(`footer navigation to ${path} resets scroll to top`, async ({ page }) => {
      await scrollToFooter(page);
      await page.locator(`footer a[href="${path}"]`).click();

      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expectPageAtTop(page);
    });
  }

  test('legal header navigation resets scroll to top on route change', async ({ page }) => {
    await page.goto('/terms');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }));

    await page.locator('header nav a[href="/privacy"]').click();

    await expect(page).toHaveURL(/\/privacy$/);
    await expectPageAtTop(page);
  });

  test('hash navigation on the landing page preserves anchor scrolling', async ({ page }) => {
    await scrollToFooter(page);
    await page.locator('footer a[href="#features"]').click();

    await expect(page).toHaveURL(/#features$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });
});
