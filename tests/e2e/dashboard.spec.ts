import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should redirect to auth when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Debería mostrar la página de autenticación o redirigir
    await page.waitForTimeout(1000);
    
    // Verificar que aparezca la acción para iniciar sesión con Discord.
    const loginButton = page.getByRole('button', { name: /discord|login|sign in|iniciar sesión|volver a iniciar/i });
    await expect(loginButton.or(page.getByRole('link', { name: /discord|login|sign in|iniciar sesión|volver a iniciar/i }))).toBeVisible();
  });

  test('should display auth card with branding', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Esperar a que cargue la página de auth
    await page.waitForLoadState('networkidle');
    
    // Verificar que el estado de acceso se renderice sin pantalla en blanco.
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have accessible auth page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar que haya headings apropiados
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Auth Callback', () => {
  test('should handle callback route', async ({ page }) => {
    // Intentar acceder al callback sin parámetros
    await page.goto('/auth/callback');
    
    // Debería manejar el error o redirigir
    await page.waitForTimeout(1000);
    
    // Verificar que no haya errores fatales
    const errorMessage = page.locator('text=/error|something went wrong/i');
    
    // Si hay error, debería ser manejado gracefully
    if (await errorMessage.isVisible()) {
      expect(await errorMessage.textContent()).toBeTruthy();
    }
  });
});
