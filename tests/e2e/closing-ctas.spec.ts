import { test, expect } from '@playwright/test';

test.describe('Cierres con acción (PRODUCT.md · principio 3)', () => {
  for (const [section, source] of [
    ['#sobre-mi', 'about'],
    ['#testimonios', 'testimonials'],
  ] as const) {
    test(`${section} termina con el CTA general de WhatsApp`, async ({
      page,
    }) => {
      await page.goto('/');
      const cta = page.locator(
        `${section} a[data-track="whatsapp"][data-source="${source}"]`,
      );
      await expect(cta).toHaveText('Escríbeme por WhatsApp');
      await expect(cta).toHaveAttribute('data-service', 'general');
    });
  }

  test('el botón flotante no desaparece en los cierres de en medio (RF-12)', async ({
    page,
  }) => {
    await page.goto('/');
    const floating = page.locator('[data-floating-wa]');
    for (const source of ['about', 'testimonials']) {
      await page
        .locator(`main a[data-source="${source}"]`)
        .evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await expect(floating).not.toHaveAttribute('data-hidden', '');
    }
  });

  test('no se oculta con Contacto apenas asomando por abajo (RF-12)', async ({
    page,
  }) => {
    await page.goto('/');
    const floating = page.locator('[data-floating-wa]');
    // Contacto asoma 10 % de la pantalla: menos que el margen del 20 %.
    await page.locator('#contacto').evaluate((el) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.9);
    });
    await expect(floating).not.toHaveAttribute('data-hidden', '');
  });
});

test.describe('Contenido sin datos del coach', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('el Hero dice en cuánto llega la rutina', async ({ page }) => {
    await expect(
      page.locator('section[aria-labelledby="hero-title"] li').first(),
    ).toHaveText(/7–12 días\s+para recibir tu rutina/);
  });

  test('Sobre mí no muestra credenciales «por confirmar»', async ({ page }) => {
    await expect(page.locator('#sobre-mi')).not.toContainText('por confirmar');
  });

  test('el seguimiento es lo primero que incluye la rutina', async ({
    page,
  }) => {
    await expect(
      page.locator('#servicios article ul li').first(),
    ).toContainText('Seguimiento');
  });

  test('la FAQ responde por qué no basta con videos', async ({ page }) => {
    await expect(
      page.locator('#faq summary', { hasText: 'videos de YouTube' }),
    ).toHaveCount(1);
  });

  test('el objetivo del formulario ofrece los tres perfiles y no un servicio', async ({
    page,
  }) => {
    const goal = page.locator('#f-goal');
    for (const option of [
      'Empezar desde cero',
      'Aprender skills (muscle-up, parada de manos…)',
      'Entrenar a mi ritmo, sin horario fijo',
    ]) {
      await expect(goal.locator('option', { hasText: option })).toHaveCount(1);
    }
    await expect(
      goal.locator('option', { hasText: 'Rutina personalizada' }),
    ).toHaveCount(0);
  });
});
