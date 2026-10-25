import { test, expect } from '@playwright/test';

test.describe('Gis vivo', () => {
  test('los paquetes muestran las clases por semana como marcas de gis', async ({
    page,
  }) => {
    await page.goto('/');
    const rows = page.locator('#servicios dl > div');
    await expect(
      rows.filter({ hasText: 'Paquete I' }).first().locator('.chalk-stroke'),
    ).toHaveCount(3);
    await expect(
      rows.filter({ hasText: 'Paquete II' }).locator('.chalk-stroke'),
    ).toHaveCount(5);
  });

  test('los títulos llevan un trazo de gis sin cambiar su nombre accesible', async ({
    page,
  }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', {
      level: 2,
      name: 'Planes y precios',
    });
    await expect(heading.locator('svg[data-chalk]')).toHaveCount(1);
  });

  test('el gis se traza al entrar en pantalla', async ({ page }) => {
    await page.goto('/');
    const mark = page.locator('#servicios-title svg[data-chalk]');
    await expect(mark).toHaveAttribute('data-chalk-ready', '');
    await page.locator('#servicios-title').scrollIntoViewIfNeeded();
    await expect(mark).toHaveAttribute('data-drawn', '');
  });

  test('tocar un botón de WhatsApp suelta una nube de magnesia', async ({
    page,
  }) => {
    await page.goto('/');
    const cta = page.locator('a[data-source="hero"]');
    const box = (await cta.boundingBox())!;
    await cta.dispatchEvent('pointerdown', {
      clientX: box.x + 20,
      clientY: box.y + 20,
      bubbles: true,
    });
    await expect(page.locator('.chalk-burst')).toHaveCount(1);
    await expect(page.locator('.chalk-burst')).toHaveCount(0, {
      timeout: 3000,
    });
  });

  test('cada campo bien llenado recibe su palomita', async ({ page }) => {
    await page.goto('/');
    const field = page
      .locator('#f-name')
      .locator('xpath=ancestor::*[@data-field][1]');
    await expect(field.locator('svg')).toBeHidden();
    await page.locator('#f-name').fill('Ana');
    await expect(field).toHaveAttribute('data-valid', '');
    await expect(field.locator('svg')).toBeVisible();
    await page.locator('#f-name').fill('');
    await expect(field).not.toHaveAttribute('data-valid', '');
  });

  test('la pregunta abierta se subraya con gis', async ({ page }) => {
    await page.goto('/');
    const item = page.locator('#faq details').first();
    await expect(item.locator('summary svg')).toBeHidden();
    await item.locator('summary').click();
    await expect(item.locator('summary svg')).toBeVisible();
  });

  test('el fondo tiene grano', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundImage,
    );
    expect(bg).toContain('data:image/svg+xml');
  });

  test.describe('con movimiento reducido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('el gis ya está dibujado y no hay nube al tocar', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-chalk-ready]')).toHaveCount(0);
      const cta = page.locator('a[data-source="hero"]');
      await cta.dispatchEvent('pointerdown', {
        clientX: 10,
        clientY: 10,
        bubbles: true,
      });
      await expect(page.locator('.chalk-burst')).toHaveCount(0);
    });
  });
});
