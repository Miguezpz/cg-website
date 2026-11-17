import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Landing animada /gravedad (spec T5.1).
const PATH = '/gravedad/';
const API = 'https://api.web3forms.com/submit';

/** Solo online, sin precios ni clase muestra (T4.9) y atleta anónimo (T5.1). */
const FORBIDDEN = [
  /morelia/i,
  /presencial/i,
  /clase de prueba/i,
  /clase muestra/i,
  /\$\s?\d/,
  /\bMXN\b/,
];

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  // scrollTo y no la rueda: WebKit móvil no la emula.
  for (let y = 0; y <= height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
}

test('un solo h1, lang es-MX y sin textos prohibidos', async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-MX');
  await expect(page.locator('h1')).toHaveCount(1);
  const text = await page.locator('body').innerText();
  for (const word of FORBIDDEN) expect(text).not.toMatch(word);
});

test('las fotos se declaran ilustrativas y nunca nombran al coach', async ({
  page,
}) => {
  await page.goto(PATH);
  await expect(
    page.getByText('Imagen ilustrativa generada con IA').first(),
  ).toBeVisible();
  await expect(
    page.getByText(/no retratan al coach ni a sus alumnos/),
  ).toBeAttached();
  const alts = await page
    .locator('main img[alt]')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('alt') ?? ''));
  for (const alt of alts) expect(alt).not.toMatch(/c[ée]sar/i);
});

test('sin audio ni reproductores en «En la sesión»', async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator('audio, video')).toHaveCount(0);
});

test('los CTA de WhatsApp pasan por waLink() con su origen', async ({
  page,
}) => {
  await page.goto(PATH);
  const ctas = page.locator('a[data-track="whatsapp"]');
  expect(await ctas.count()).toBeGreaterThanOrEqual(4);
  for (const source of ['hero', 'method', 'finale', 'footer', 'floating']) {
    const cta = page.locator(
      `a[data-track="whatsapp"][data-source="${source}"]`,
    );
    await expect(cta.first()).toBeAttached();
    const href = (await cta.first().getAttribute('href'))!;
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://wa.me/524433019533');
    expect(url.searchParams.get('text')).toMatch(/^Hola, vi tu página web/);
  }
});

test('las anclas del menú llevan a secciones que existen', async ({ page }) => {
  await page.goto(PATH);
  const hrefs = await page
    .locator('[data-g-header] a[href^="#"]')
    .evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThanOrEqual(5);
  for (const href of hrefs) {
    await expect(page.locator(href)).toBeAttached();
  }
});

test.describe('formulario', () => {
  test('valida con JS y envía a Web3Forms sin PII en la analítica', async ({
    page,
  }) => {
    let body = '';
    await page.route(API, async (route) => {
      body = route.request().postData() ?? '';
      await route.fulfill({ json: { success: true } });
    });
    await page.goto(PATH);
    const form = page.locator('form[data-gravity-form]');
    await expect(form).toHaveAttribute('action', API);
    await expect(form).toHaveAttribute('novalidate', '');
    await form.locator('[type="submit"]').click();
    await expect(form.locator('#g-name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(form.locator('#g-name-error')).toBeVisible();

    await form.locator('#g-name').fill('Ana Prueba');
    await form.locator('#g-contact').fill('ana@correo.com');
    await form.locator('#g-goal').selectOption({ index: 1 });
    await form.locator('input[name="privacy"]').check();
    await form.locator('[type="submit"]').click();
    await expect(form.getByRole('status')).toContainText('¡Listo!');
    expect(body).toContain('Ana Prueba');

    const pushed = await page.evaluate(() =>
      JSON.stringify(window.dataLayer ?? []),
    );
    expect(pushed).not.toContain('Ana Prueba');
    expect(pushed).not.toContain('ana@correo.com');
  });
});

test.describe('secuencia final', () => {
  test('«Saltar secuencia» se alcanza con teclado y lleva al contacto', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'Safari no enfoca enlaces con Tab');
    await page.goto(PATH);
    const skip = page.locator('[data-finale-skip]');
    await skip.scrollIntoViewIfNeeded();
    await skip.focus();
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#contacto$/);
    await expect(page.locator('#contacto')).toBeInViewport();
  });

  test('«Mantén para agarrar» exige sostener Espacio 1.2 s', async ({
    page,
  }) => {
    await page.goto(PATH);
    await page.locator('#prueba').scrollIntoViewIfNeeded();
    const hold = page.locator('[data-hold]');
    await expect(hold).toBeVisible();
    const status = page.locator('[data-hold-status]');

    // Un toque corto no basta.
    await hold.focus();
    await page.keyboard.down('Space');
    await page.waitForTimeout(200);
    await page.keyboard.up('Space');
    await page.waitForTimeout(300);
    await expect(status).not.toHaveText('Agarre firme.');

    // Sostenido, sí.
    await hold.focus();
    await page.keyboard.down('Space');
    await expect(status).toHaveText('Agarre firme.', { timeout: 3000 });
    await page.keyboard.up('Space');
  });
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`axe a ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport, reducedMotion: 'reduce' });

    test('sin violaciones serias o críticas', async ({ page }) => {
      await page.goto(PATH);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const blocking = violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(
        blocking,
        blocking
          .map(
            (v) =>
              `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
          )
          .join('\n'),
      ).toEqual([]);
    });

    test('sin scroll horizontal', async ({ page }) => {
      await page.goto(PATH);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('se ve todo el contenido, el formulario y los CTA; sin velo', async ({
    page,
  }) => {
    await page.goto(PATH);
    await expect(page.locator('[data-loader]')).toBeHidden();
    await expect(page.locator('h1')).toBeVisible();
    await expect(
      page.locator('a[data-track="whatsapp"][data-source="hero"]'),
    ).toBeVisible();
    const form = page.locator('form[data-gravity-form]');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(page.locator('[data-film-poster]')).toBeAttached();
    for (const id of ['#metodo', '#sesion', '#equipo', '#progresion']) {
      await expect(page.locator(id)).toBeAttached();
    }
  });
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('sin pila sticky ni secuencia: se ve el póster', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('[data-loader]')).toHaveCount(0, {
      timeout: 3000,
    });
    const sticky = await page
      .locator('[data-stack-item]')
      .evaluateAll(
        (items) =>
          items.filter((el) => getComputedStyle(el).position === 'sticky')
            .length,
      );
    expect(sticky).toBe(0);
    const poster = page.locator('[data-film-poster]');
    await poster.scrollIntoViewIfNeeded();
    await expect(poster).toBeVisible();
  });
});

test('sin errores de consola al cargar y recorrer la página', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(PATH);
  await page.waitForTimeout(1500);
  await scrollThrough(page);
  await page.waitForTimeout(800);
  expect(errors).toEqual([]);
});
