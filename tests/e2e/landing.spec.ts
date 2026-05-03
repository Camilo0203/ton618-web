import { test, expect, type Page } from '@playwright/test';

async function progressiveScroll(page: Page, steps: number, distance = 1200) {
  for (let index = 0; index < steps; index += 1) {
    await page.mouse.wheel(0, distance);
    await page.waitForTimeout(300);
  }
}

test.describe('Landing Page', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the hero with honest launch CTAs', async ({ page }) => {
    const inviteCta = page
      .getByRole('link', { name: /invite ton618/i })
      .first()
      .or(page.getByRole('button', { name: /invite ton618/i }).first());

    await expect(page.locator('h1')).toBeVisible();
    await expect(inviteCta).toBeVisible();
    await expect(page.getByText(/bilingual discord bot|bot bilingüe de discord/i).first()).toBeVisible();
  });

  test('navigates to the product section from the navbar', async ({ page }) => {
    const productLink = page.getByRole('link', { name: /product|producto/i }).first();

    await productLink.click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('shows the bilingual workflow section', async ({ page }) => {
    await progressiveScroll(page, 5);
    await expect(page.locator('#commands')).toBeVisible({ timeout: 15000 });

    await page.locator('#commands').scrollIntoViewIfNeeded();
    await expect(page.locator('#commands-heading')).toBeVisible();
    await expect(page.getByText(/english and spanish are chosen during onboarding|english y español se eligen en el onboarding/i)).toBeVisible();
    await expect(
      page.locator('#commands').getByRole('heading', { name: /choose the server language|elige el idioma del servidor/i }),
    ).toBeVisible();
  });

  test('shows the live metrics section', async ({ page }) => {
    await progressiveScroll(page, 7);
    await expect(page.locator('#stats')).toBeVisible({ timeout: 15000 });

    await page.locator('#stats').scrollIntoViewIfNeeded();
    await expect(page.locator('#stats-heading')).toBeVisible();
    await expect(page.locator('#stats article').first()).toBeVisible();
  });

  test('opens the language selector on desktop', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: /change language|cambiar idioma/i }).first();

    await languageButton.click();
    await expect(page.locator('#language-selector-menu')).toBeVisible();
  });

  test('has accessible navigation landmarks and skip link', async ({ page }) => {
    await expect(page.locator('nav').first()).toHaveAttribute('aria-label', /.+/);
    await expect(page.getByRole('link', { name: /skip to content|saltar al contenido/i })).toBeAttached();
  });

  test('opens the mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    const mobileMenuButton = page.getByRole('button', {
      name: /open navigation menu|close navigation menu|abrir menú de navegación|cerrar menú de navegación/i,
    });

    await expect(mobileMenuButton).toBeVisible();
    await mobileMenuButton.click();
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await expect(
      page
        .getByRole('link', { name: /invite ton618/i })
        .last()
        .or(page.getByRole('button', { name: /invite ton618/i }).last()),
    ).toBeVisible();
  });

  test('pricing page loads without errors', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(page.locator('text=/error|something went wrong/i')).not.toBeVisible();
  });

  test('renders the footer with support links', async ({ page }) => {
    const footer = page.locator('footer');

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }));
    await page.waitForTimeout(1000);

    await expect(footer).toBeVisible();
    expect(await footer.locator('a').count()).toBeGreaterThan(0);
    await expect(footer.getByText(/bilingual discord bot|bot bilingüe de discord/i).first()).toBeVisible();
  });
});
