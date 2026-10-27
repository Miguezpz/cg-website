import { test, expect } from '@playwright/test';

test.describe('¿Para quién es?', () => {
  test('una puerta por perfil, cada una con su mensaje de WhatsApp', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.locator('#para-quien');
    await expect(section.getByRole('heading', { level: 3 })).toHaveCount(3);
    const ctas = section.locator(
      'a[data-track="whatsapp"][data-source="audience"]',
    );
    await expect(ctas).toHaveCount(3);
    const messages = await ctas.evaluateAll((links) =>
      links.map(
        (a) =>
          new URL((a as HTMLAnchorElement).href).searchParams.get('text') ?? '',
      ),
    );
    expect(new Set(messages).size).toBe(3);
    for (const message of messages) expect(message).toContain('Mi nivel:');
    await expect(ctas.first()).toHaveAttribute(
      'data-service',
      'perfil-principiante',
    );
  });

  test('va justo después del Hero y antes de Sobre mí', async ({ page }) => {
    await page.goto('/');
    const order = await page.evaluate(() =>
      [...document.querySelectorAll('main section[id]')].map((s) => s.id),
    );
    expect(order.indexOf('para-quien')).toBeLessThan(order.indexOf('sobre-mi'));
    expect(order.indexOf('servicios')).toBeGreaterThan(
      order.indexOf('testimonios'),
    );
    expect(order.indexOf('como-funciona')).toBe(order.indexOf('servicios') + 1);
  });
});
