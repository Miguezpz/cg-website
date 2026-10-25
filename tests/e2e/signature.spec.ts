import { test, expect } from '@playwright/test';

test.describe('Momentos de firma', () => {
  test('las anotaciones a mano son texto real en Kalam y se dibujan', async ({
    page,
  }) => {
    await page.goto('/');
    const note = page.getByText('los paquetes duran 30 días');
    const wrapper = note.locator('xpath=ancestor::*[@data-chalk][1]');
    // Kalam se aplica al acercarse a la pantalla, no al cargar (no compite con el LCP).
    await expect(wrapper).not.toHaveAttribute('data-near', '');
    await note.scrollIntoViewIfNeeded();
    await expect(wrapper).toHaveAttribute('data-near', '');
    await expect(note).toHaveCSS('font-family', /Kalam/);
    await expect(wrapper).toHaveAttribute('data-drawn', '');
    await expect(
      page.getByText('solo uso tus datos para contactarte'),
    ).toHaveCount(1);
    await expect(
      page.getByText('toca una semana para ver su enfoque'),
    ).toBeVisible();
  });

  test('el título siente la gravedad bajo el puntero', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Solo con puntero fino');
    await page.goto('/');
    const title = page.locator('#hero-title');
    const box = (await title.boundingBox())!;
    await page.mouse.move(box.x + 5, box.y + 5);
    for (let i = 0; i <= 10; i++) {
      await page.mouse.move(
        box.x + box.width * (0.2 + i * 0.05),
        box.y + box.height * 0.75,
      );
    }
    await expect
      .poll(() =>
        title
          .locator('span > span')
          .evaluateAll((els) =>
            Math.max(
              ...els.map(
                (e) => parseFloat(e.style.translate.split(' ')[1] ?? '0') || 0,
              ),
            ),
          ),
      )
      .toBeGreaterThan(3);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Desafía la gravedad' }),
    ).toBeVisible();
  });

  test('la foto colgante se balancea con el puntero', async ({ page }) => {
    await page.goto('/');
    test.skip(
      page.viewportSize()!.width < 1024 ||
        (await page.evaluate(() => !matchMedia('(pointer: fine)').matches)),
      'Solo en escritorio con puntero fino',
    );
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    const box = (await hero.boundingBox())!;
    await page.mouse.move(box.x + 20, box.y + 200);
    await page.mouse.move(box.x + box.width - 20, box.y + 300, { steps: 10 });
    await expect
      .poll(() =>
        page.locator('.hero-hang').evaluate((el) => el.style.transform),
      )
      .toMatch(/rotate\(-\d/);
  });

  test.describe('con movimiento reducido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('el título no se parte ni se mueve', async ({ page, isMobile }) => {
      test.skip(isMobile, 'Solo con puntero fino');
      await page.goto('/');
      await page.locator('#hero-title').hover();
      await expect(page.locator('#hero-title')).not.toHaveAttribute(
        'aria-label',
        /.+/,
      );
    });
  });
});
