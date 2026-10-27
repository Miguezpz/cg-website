import { test, expect } from '@playwright/test';

test.describe('Contar el método', () => {
  test('una línea de gis une los tres pasos', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.steps .step-link:visible');
    await expect(links).toHaveCount(2);
    // El SVG ocupa el tramo completo entre pasos (no el ancho de su viewBox).
    const box = (await links.first().boundingBox())!;
    const desktop = page.viewportSize()!.width >= 768;
    if (desktop) expect(box.width).toBeGreaterThan(120);
    else expect(box.height).toBeGreaterThan(40);
  });

  test('elegir una semana resalta su enfoque, también sin JS', async ({
    page,
  }) => {
    await page.goto('/');
    const info = page.locator('[data-week-info="descarga"]');
    const before = await info.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await page.locator('[data-method] .week').nth(1).click();
    await expect(page.getByRole('radio', { name: /Semana 2/ })).toBeChecked();
    await expect
      .poll(() => info.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(before);
  });

  test('en móvil se lee solo el enfoque de la semana elegida', async ({
    page,
  }) => {
    test.skip(page.viewportSize()!.width >= 768, 'en escritorio caben los dos');
    await page.goto('/');
    await expect(page.getByRole('radio', { name: /Semana 1/ })).toBeChecked();
    await expect(page.locator('[data-week-info="carga"]')).toBeVisible();
    await expect(page.locator('[data-week-info="descarga"]')).toBeHidden();
    await page.locator('[data-method] .week').nth(1).click();
    await expect(page.locator('[data-week-info="descarga"]')).toBeVisible();
    await expect(page.locator('[data-week-info="carga"]')).toBeHidden();
  });

  test('la cinta de disciplinas lista las 5 una sola vez para lectores', async ({
    page,
  }) => {
    await page.goto('/');
    const tape = page.getByRole('region', { name: 'Disciplinas' });
    await expect(tape.getByRole('listitem')).toHaveCount(5);
  });

  test('el header persiste en el cambio de página', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-header]')).toHaveCSS(
      'view-transition-name',
      'site-header',
    );
  });
});

test.describe('Sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('el ciclo sigue siendo interactivo', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-method] .week').first().click();
    await expect(page.getByRole('radio', { name: /Semana 1/ })).toBeChecked();
    await expect(page.locator('[data-week-info="carga"]')).not.toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
  });
});
