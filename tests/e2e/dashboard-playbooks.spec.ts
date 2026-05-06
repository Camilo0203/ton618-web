import { expect, test } from '@playwright/test';

test.describe('Dashboard Ops Console Demo @smoke', () => {
  test.setTimeout(120000);

  test('permite navegar desde el overview demo hasta la configuracion de tickets', async ({ page }) => {
    await page.goto('/dashboard?demo=ops-console', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'TON618 Ops Beta' })).toBeVisible({ timeout: 60000 });

    await page.getByRole('button', { name: /^Tickets$/i }).click();

    // Dashboard module transitions can be async; wait for the tickets module to render.
    await expect(
      page.getByRole('heading', { name: /Operacion del sistema de tickets|Ticket system operation/i })
    ).toBeVisible({ timeout: 60000 });
  });
});
