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
});
