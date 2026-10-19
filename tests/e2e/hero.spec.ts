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

  test('ofrece una entrada directa a la rutina online', async ({ page }) => {
    await page.goto('/');
    const link = page.locator(
      'section[aria-labelledby="hero-title"] a[href="#servicio-rutina"]',
    );
    await expect(link).toContainText('Rutina personalizada');
    await link.click();
    await expect(page.locator('#servicio-rutina')).toBeInViewport();
  });

  test('los CTA generales usan un solo texto', async ({ page }) => {
    await page.goto('/');
    for (const source of ['hero', 'offer', 'contact']) {
      await expect(
        page
          .locator(`main a[data-track="whatsapp"][data-source="${source}"]`)
          .first(),
      ).toHaveText('Agenda tu clase muestra gratis');
    }
  });
});
