import { test, expect } from '@playwright/test';

test.describe('Secciones de la landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Sobre el coach: foto con alt y al menos 3 credenciales (RF-03)', async ({
    page,
  }) => {
    const about = page.locator('#sobre-mi');
    await expect(about.getByRole('heading', { level: 2 })).toHaveText(
      /César Augusto/i,
    );
    await expect(about.locator('img')).toHaveAttribute('alt', /César Augusto/);
    expect(await about.locator('li').count()).toBeGreaterThanOrEqual(3);
  });

  test('el comparador funciona con teclado y anuncia el porcentaje (RF-05)', async ({
    page,
  }) => {
    const range = page.locator('[data-compare-range]').first();
    await expect(range).toHaveAttribute(
      'aria-label',
      /Comparar antes y después/,
    );
    await expect(range).toHaveAttribute(
      'aria-valuetext',
      'Mostrando 50% antes',
    );
    await range.focus();
    await page.keyboard.press('ArrowRight');
    await expect(range).toHaveAttribute(
      'aria-valuetext',
      'Mostrando 51% antes',
    );
    await page.keyboard.press('Home');
    await expect(range).toHaveAttribute('aria-valuetext', 'Mostrando 0% antes');
  });

  test('Cómo funciona tiene 3 pasos y el ciclo Carga & Descarga (RF-07)', async ({
    page,
  }) => {
    const section = page.locator('#como-funciona');
    await expect(section.locator('> div > ol > li')).toHaveCount(3);
    await expect(
      section
        .getByRole('list', { name: 'Ciclo de cuatro semanas' })
        .locator('> li'),
    ).toHaveCount(4);
  });

  test('la oferta lleva a WhatsApp con su propio origen (RF-08)', async ({
    page,
  }) => {
    await expect(
      page.locator('a[data-track="whatsapp"][data-source="offer"]'),
    ).toHaveCount(1);
  });

  test('FAQ con 6–8 preguntas nativas que se abren (RF-09)', async ({
    page,
  }) => {
    const items = page.locator('#faq details');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(6);
    expect(count).toBeLessThanOrEqual(8);
    await items.first().locator('summary').click();
    await expect(items.first()).toHaveAttribute('open', '');
  });

  test('footer con año actual y aviso de privacidad (RF-11)', async ({
    page,
  }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText(
      `© ${new Date().getFullYear()} Control Gravedad`,
    );
    await expect(footer).toContainText('Morelia, Michoacán · Online');
    await expect(
      footer.getByRole('link', { name: 'Aviso de privacidad' }),
    ).toHaveAttribute('href', '/privacidad/');
  });
});

test.describe('Sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('el comparador muestra las dos fotos lado a lado', async ({ page }) => {
    await page.goto('/');
    const compare = page.locator('[data-compare]').first();
    await expect(compare).not.toHaveAttribute('data-enhanced', '');
    const imgs = compare.locator('img');
    await expect(imgs).toHaveCount(2);
    const [a, b] = await Promise.all([
      imgs.nth(0).boundingBox(),
      imgs.nth(1).boundingBox(),
    ]);
    expect(b!.x).toBeGreaterThan(a!.x);
    await expect(page.locator('[data-compare-range]').first()).toBeHidden();
  });

  test('las FAQ se abren sin JavaScript', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('#faq details').first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
  });
});

test.describe('Páginas secundarias (RF-13)', () => {
  test('/privacidad responde y declara la analítica', async ({ page }) => {
    await page.goto('/privacidad/');
    await expect(page.locator('h1')).toHaveText('Aviso de privacidad');
    await expect(page.locator('main')).toContainText('Google Analytics');
    await expect(page.locator('main')).toContainText('ARCO');
  });

  test('/gracias no se indexa y ofrece WhatsApp', async ({ page }) => {
    await page.goto('/gracias/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    );
    await expect(page.locator('main a[data-track="whatsapp"]')).toHaveCount(1);
  });

  test('una ruta inexistente muestra el 404 con regreso al inicio', async ({
    page,
  }) => {
    const response = await page.goto('/no-existe/');
    expect(response?.status()).toBe(404);
    await expect(
      page.locator('main').getByRole('link', { name: 'Volver al inicio' }),
    ).toHaveAttribute('href', '/');
  });
});
