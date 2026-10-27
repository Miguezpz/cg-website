import { test, expect } from '@playwright/test';

const scrollDriven = (page: import('@playwright/test').Page) =>
  page.evaluate(() => CSS.supports('animation-timeline: view()'));

test.describe('Movimiento «Peso y control» (RNF-07)', () => {
  test('la entrada del Hero corre una vez y termina visible', async ({
    page,
  }) => {
    await page.goto('/');
    const names = await page.evaluate(() =>
      document.getAnimations().map((a) => (a as CSSAnimation).animationName),
    );
    expect(names).toEqual(expect.arrayContaining(['bar-draw', 'rise-in']));
    // Nada en bucle infinito.
    const infinite = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
          .length,
    );
    expect(infinite).toBe(0);
    const cta = page.locator('a[data-track="whatsapp"][data-source="hero"]');
    await expect(cta).toBeInViewport();
    await expect
      .poll(() =>
        cta.evaluate((el) => getComputedStyle(el.parentElement!).opacity),
      )
      .toBe('1');
  });

  test('títulos, bloques y barras se animan con el scroll', async ({
    page,
  }) => {
    await page.goto('/');
    test.skip(!(await scrollDriven(page)), 'Sin animaciones ligadas al scroll');
    const timeline = await page
      .locator('#servicios-title')
      .evaluate((el) => el.getAnimations()[0]?.timeline?.constructor.name);
    expect(timeline).toBe('ViewTimeline');
    expect(await page.locator('.steel-bar').count()).toBeGreaterThan(3);
    // Al llegar a la sección, el título queda en su sitio.
    await page.goto('/#servicios');
    await expect
      .poll(() =>
        page
          .locator('#servicios-title')
          .evaluate((el) => getComputedStyle(el).translate),
      )
      .toMatch(/^(none|0px( 0(px|%))?)$/);
  });

  test('el gis de Carga & Descarga se dibuja al entrar en pantalla', async ({
    page,
  }) => {
    await page.goto('/');
    const method = page.locator('[data-method]');
    await expect(method).toHaveAttribute('data-animate', '');
    await method.scrollIntoViewIfNeeded();
    await expect(method).toHaveAttribute('data-drawn', '');
  });

  test('el vaivén del comparador no cambia su valor', async ({ page }) => {
    await page.goto('/');
    const range = page.locator('[data-compare-range]').first();
    await range.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2200);
    await expect(range).toHaveAttribute(
      'aria-valuetext',
      'Mostrando 50% antes',
    );
  });

  test('el botón flotante emite su onda la primera vez que aparece', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#como-funciona-title').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-floating-wa]')).toHaveAttribute(
      'data-pulse',
      '',
    );
  });

  test('el botón flotante no parpadea al cargar', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toMatch(/data-floating-wa[^>]*data-hidden/);
  });

  test('el indicador del menú se desliza a la sección activa', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    test.skip(!(await nav.isVisible()), 'El menú de escritorio no se muestra');
    await page.locator('#servicios').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
    const link = nav.getByRole('link', { name: 'Servicios' });
    await expect(link).toHaveAttribute('aria-current', 'location');
    const indicator = page.locator('[data-nav-indicator]');
    await expect(indicator).toHaveCSS('opacity', '1');
    const [x, left] = await Promise.all([
      indicator.evaluate((el) => parseFloat(el.style.translate)),
      link.evaluate((el) => (el as HTMLElement).offsetLeft + 12),
    ]);
    expect(Math.abs(x - left)).toBeLessThan(1);
  });

  test.describe('con movimiento reducido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('no hay ninguna animación, ni al cargar ni al hacer scroll', async ({
      page,
    }) => {
      await page.goto('/');
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(300);
      const count = await page.evaluate(
        () =>
          document.getAnimations().filter((a) => a instanceof CSSAnimation)
            .length,
      );
      expect(count).toBe(0);
      await expect(page.locator('.scroll-progress')).toBeHidden();
    });

    test('el gis aparece ya dibujado', async ({ page }) => {
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
