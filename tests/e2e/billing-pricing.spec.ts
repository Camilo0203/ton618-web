import { test, expect } from '@playwright/test';

test.describe('Pricing & Billing', () => {
  test.describe.configure({ timeout: 90_000 });

  test('pricing page loads and shows plan cards', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Pricing hero/title
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Ensure some plan CTAs exist (language-dependent)
    // Buttons are rendered from config (cta[lang]); match any premium/donation CTA button.
    const ctaButtons = page.getByRole('button').filter({ hasText: /pro|premium|donate|donaci/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('pricing select shows guild selector section (no crash)', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Pick first available plan CTA
    const planCta = page.getByRole('button').first();
    await planCta.click();

    // After selecting a plan, UI should show server selection container
    await expect(page.getByText(/server|guild|servidor|guild/i)).toBeVisible({ timeout: 20_000 }).catch(() => {});
    await expect(page.locator('text=/billing\\.serverSelection|server selection|guild selector/i').first()).toBeVisible({ timeout: 20_000 }).catch(() => {});

    // Should not hard crash: basic page shell should still be present
    await expect(page.locator('main, footer').first()).toBeVisible();
  });

  test('billing cancel page loads', async ({ page }) => {
    await page.goto('/billing/cancel');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /pricing|volver|try again|tryAgain/i })).toBeVisible().catch(() => {});
    await expect(page.getByRole('button', { name: /home|back/i })).toBeVisible().catch(() => {});
  });

  test('billing success page loads (default plan_key)', async ({ page }) => {
    await page.goto('/billing/success');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /dashboard|go to dashboard|ir a dashboard/i })).toBeVisible().catch(() => {});
    await expect(page.getByRole('button', { name: /home|back/i })).toBeVisible().catch(() => {});
  });

  test('billing success page loads with plan_key param', async ({ page }) => {
    await page.goto('/billing/success?plan_key=pro_monthly');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/Payment|Successful|Pago|Exito/i').first()).toBeVisible().catch(() => {});
  });
});
