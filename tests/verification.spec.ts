import { test, expect } from '@playwright/test';

test.describe('TON618 Web Final Validation', () => {
  test('black screen check at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Check if critical elements are visible (e.g. Hero, Features)
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
    
    const hero = page.locator('#main-content section').first(); // Hero section
    await expect(hero).toBeVisible();

    await page.screenshot({ path: 'black_screen_768.png' });
    console.log('PASS: 768px rendering verified.');
  });

  test('navbar and hamburger at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Check hamburger is visible
    const menuButton = page.getByRole('button', {
      name: /open navigation menu|close navigation menu|abrir menú de navegación|cerrar menú de navegación/i,
    });
    await expect(menuButton).toBeVisible();
    await page.screenshot({ path: 'navbar_390_closed.png' });

    // Open menu
    await menuButton.click();
    await page.waitForTimeout(500);
    
    const mobileNav = page.locator('#mobile-navigation');
    await expect(mobileNav).toBeVisible();
    await page.screenshot({ path: 'navbar_390_open.png' });
    
    console.log('PASS: 390px navbar/hamburger verified.');
  });

  test('language selector at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const langButton = page.getByRole('button', { name: /change language|cambiar idioma/i });
    await expect(langButton).toBeVisible();
    await page.screenshot({ path: 'landing_1440.png' });

    // Click language selector
    await langButton.click();
    await page.waitForTimeout(500);
    
    const menu = page.locator('#language-selector-menu');
    await expect(menu).toBeVisible();
    await page.screenshot({ path: 'lang_selector_desktop.png' });
    
    console.log('PASS: 1440px language selector verified.');
  });
});
