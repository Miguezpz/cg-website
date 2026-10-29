import { test, expect } from '@playwright/test';

test.describe('Contenido demo', () => {
  test('no se ve ningún [[PENDIENTE]] y cada demo dice qué falta', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('main')).not.toContainText('[[PENDIENTE]]');
    // Cada vez hay menos avisos: el contenido real los va reemplazando.
    const notes = page.locator('.demo-note');
    for (const text of await notes.allTextContents()) {
      expect(text).toMatch(/^\s*Demo/);
      expect(text).toMatch(/Falta|Confirmar|confirmar/);
    }
  });

  test('la foto del Hero es la real, sin aviso demo (T3.27)', async ({
    page,
  }) => {
    await page.goto('/');
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    await expect(hero.locator('.demo-note')).toHaveCount(0);
    await expect(hero.locator('figure img')).toHaveAttribute(
      'alt',
      /^César Augusto/,
    );
  });

  test('las respuestas demo no se publican en los datos estructurados', async ({
    page,
  }) => {
    await page.goto('/');
    const data = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    const faq = data['@graph'].find(
      (n: { '@type': string }) => n['@type'] === 'FAQPage',
    );
    const questions = faq.mainEntity.map((q: { name: string }) => q.name);
    expect(questions).not.toContain('¿Dónde son las clases presenciales?');
    expect(questions).toContain('¿Cuánto cuesta y cómo pago?');
    const services = data['@graph'].filter(
      (n: { '@type': string }) => n['@type'] === 'Service',
    );
    expect(services.map((s: { name: string }) => s.name).join()).not.toContain(
      'Talleres',
    );
  });

  test('el aviso de privacidad marca que es un borrador', async ({ page }) => {
    await page.goto('/privacidad/');
    await expect(page.locator('.demo-note')).toContainText('responsable');
    await expect(page.locator('main')).not.toContainText('[[PENDIENTE]]');
  });
});
