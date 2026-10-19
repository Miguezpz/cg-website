import { test, expect } from '@playwright/test';

test.describe('Movimiento (RNF-07)', () => {
  test('el gis de Carga & Descarga se dibuja al entrar en pantalla', async ({
    page,
  }) => {
    await page.goto('/');
    const method = page.locator('[data-method]');
    await expect(method).toHaveAttribute('data-animate', '');
    await method.scrollIntoViewIfNeeded();
    await expect(method).toHaveAttribute('data-drawn', '');
  });

  test.describe('con movimiento reducido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('el gis aparece ya dibujado, sin animación', async ({ page }) => {
      await page.goto('/');
      const method = page.locator('[data-method]');
      await expect(method).not.toHaveAttribute('data-animate', '');
      const offset = await method
        .locator('.chalk-stroke')
        .first()
        .evaluate((el) => getComputedStyle(el).strokeDashoffset);
      expect(offset).toMatch(/^0(px)?$/);
    });
  });
});
