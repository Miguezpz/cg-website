import { test, expect } from '@playwright/test';

test.describe('Hero (RF-02)', () => {
  test('título y CTA primario visibles sin scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeInViewport();
    await expect(
      page.locator('a[data-track="whatsapp"][data-source="hero"]'),
    ).toBeInViewport();
  });

  test('la imagen del Hero lleva prioridad alta y carga inmediata', async ({
    page,
  }) => {
    await page.goto('/');
    const img = page.locator('section[aria-labelledby="hero-title"] img');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('alt', /.+/);
  });

  test('solo dos acciones: WhatsApp y ver la rutina', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    await expect(hero.getByRole('link')).toHaveCount(2);
    await expect(hero.locator('a[href="#a-medida"]')).toHaveCount(0);
  });

  test('los CTA generales usan un solo texto', async ({ page }) => {
    await page.goto('/');
    for (const source of ['hero', 'contact']) {
      await expect(
        page
          .locator(`main a[data-track="whatsapp"][data-source="${source}"]`)
          .first(),
      ).toHaveText('Escríbeme por WhatsApp');
    }
  });
});
