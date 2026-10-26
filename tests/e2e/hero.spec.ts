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

  test('ofrece una entrada a algo más personalizado', async ({ page }) => {
    await page.goto('/');
    const link = page.locator(
      'section[aria-labelledby="hero-title"] a[href="#a-medida"]',
    );
    await expect(link).toContainText('¿Necesitas algo más personalizado?');
    await link.click();
    await expect(page.locator('#a-medida')).toBeInViewport();
    await expect(
      page.locator('#a-medida a[data-track="whatsapp"]'),
    ).toHaveAttribute('data-service', 'a-medida');
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
