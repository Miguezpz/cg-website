import { test, expect } from '@playwright/test';

test('SEO base: título, descripción, canónica y Open Graph', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(
    /Control Gravedad · Clases de calistenia en Morelia/,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Carga & Descarga/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://controlgravedad.vercel.app/',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://controlgravedad.vercel.app/og-image.jpg',
  );
});

test('el skip link lleva al contenido', async ({ page, browserName }) => {
  test.skip(
    browserName === 'webkit',
    'Safari no enfoca enlaces con Tab por defecto',
  );
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#contenido')).toBeFocused();
});

test('el CTA de WhatsApp genera el enlace con el mensaje prellenado', async ({
  page,
}) => {
  await page.goto('/');
  const cta = page.locator('a[data-track="whatsapp"][data-source="hero"]');
  const href = await cta.getAttribute('href');
  expect(href).not.toBeNull();
  const url = new URL(href!);
  expect(url.origin + url.pathname).toBe('https://wa.me/524433019533');
  expect(url.searchParams.get('text')).toBe(
    'Hola, vi tu página web y me interesa la clase muestra gratis.',
  );
  await expect(cta).toHaveAttribute('data-service', 'clase-muestra');
});
