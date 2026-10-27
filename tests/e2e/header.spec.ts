import { test, expect } from '@playwright/test';

test.describe('Header y menú móvil (RF-01)', () => {
  test('el menú abre y cierra con teclado, Esc y al elegir un enlace', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'El menú hamburguesa solo existe en móvil');
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('#menu-movil');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await menu.getByRole('link', { name: 'Servicios' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#servicios$/);
  });

  test('los botones y las listas muestran el cursor de clic', async ({
    page,
  }) => {
    await page.goto('/');
    const cursors = await page
      .locator('button:not(:disabled), select:not(:disabled)')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).cursor));
    expect(cursors.length).toBeGreaterThan(0);
    expect(new Set(cursors)).toEqual(new Set(['pointer']));
  });

  test('el header no tapa la sección al navegar por ancla', async ({
    page,
  }) => {
    await page.goto('/#servicios');
    const headerBox = await page.locator('[data-header]').boundingBox();
    const headingBox = await page.locator('#servicios-title').boundingBox();
    expect(headingBox!.y).toBeGreaterThanOrEqual(headerBox!.height);
  });
});
