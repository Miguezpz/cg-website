import { test, expect } from '@playwright/test';

// Acento vino (D-10): el texto sobre el vino es claro y el foco se ve en las
// dos superficies (vino claro sobre acero, vino oscuro sobre concreto).
const WINE = 'rgb(106, 30, 43)';
const WINE_GLOW = 'rgb(224, 112, 127)';
const CHALK = 'rgb(243, 242, 238)';

test.use({ reducedMotion: 'reduce' });

test('el CTA primario es vino con texto claro', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('#contenido [data-track="whatsapp"]').first();
  await expect(cta).toHaveCSS('background-color', WINE);
  await expect(cta).toHaveCSS('color', CHALK);
});

test('el foco es vino claro sobre acero y vino oscuro sobre concreto', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toHaveCSS(
    'outline-color',
    WINE_GLOW,
  );

  const summary = page.locator('#faq summary').first();
  await summary.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(summary).toHaveCSS('outline-color', WINE);
});

test('los textos usan Readex Pro y la fuente carga', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCSS(
    'font-family',
    // WebKit lo devuelve sin comillas.
    /^"?Readex Pro Variable"?,/,
  );
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('700 1rem "Readex Pro Variable"');
  });
  expect(loaded).toBe(true);
});

test('la palabra clave del Hero y del cierre va en vino claro', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#hero-title [data-accent]')).toHaveText(/nivel/i);
  await expect(page.locator('#hero-title [data-accent]')).toHaveCSS(
    'color',
    WINE_GLOW,
  );
  await expect(
    page.locator('#contacto-title span').filter({ hasText: /hoy/i }),
  ).toHaveCSS('color', WINE_GLOW);
  // El resto del título sigue en gis.
  await expect(page.locator('#hero-title')).toHaveCSS('color', CHALK);
});
