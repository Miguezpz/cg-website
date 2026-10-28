import { test, expect } from '@playwright/test';

test.describe('Historia, credenciales y fotos del coach (T3.25)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Sobre mí cuenta la historia real, sin aviso demo y en ≤ 120 palabras (RF-03)', async ({
    page,
  }) => {
    const about = page.locator('#sobre-mi');
    await expect(about).toContainText('Empecé en el parque de mi colonia');
    await expect(about.locator('.demo-note')).toHaveCount(0);
    const story = await about.locator('.max-w-prose p').allTextContents();
    const words = story.join(' ').trim().split(/\s+/).length;
    expect(words).toBeLessThanOrEqual(120);
  });

  test('credenciales agrupadas en logros y certificaciones', async ({
    page,
  }) => {
    const about = page.locator('#sobre-mi');
    await expect(about.getByRole('heading', { level: 3 })).toHaveText([
      'Logros y competencias',
      'Certificaciones',
    ]);
    await expect(about).toContainText('puesto 27 de 254 atletas');
    await expect(about).toContainText('Brave Academy · 2026');
    await expect(about).toContainText('Filtro de los 32 Aztecas');
  });

  test('franja de 3 fotos de Body Control con alt y pie, antes del CTA', async ({
    page,
  }) => {
    const gallery = page.locator('#sobre-mi figure').filter({
      has: page.locator('figcaption'),
    });
    await expect(gallery.locator('figcaption')).toHaveText(
      'Body Control · enero 2023',
    );
    const imgs = gallery.locator('img');
    await expect(imgs).toHaveCount(3);
    for (const alt of await imgs.evaluateAll((els) =>
      els.map((el) => el.getAttribute('alt') ?? ''),
    )) {
      expect(alt.length).toBeGreaterThan(20);
    }
    await expect(imgs.first()).toHaveAttribute('loading', 'lazy');
    // La sección sigue cerrando con «¿Entrenamos juntos?».
    const order = await page.locator('#sobre-mi').evaluate((el) => {
      const fig = el.querySelector('figcaption')!;
      const cta = el.querySelector('[data-source="about"]')!;
      return (
        fig.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
    expect(order).toBeTruthy();
  });

  test('el Hero muestra el puesto en Calisfest 2024 (RF-02)', async ({
    page,
  }) => {
    await expect(
      page.locator('section[aria-labelledby="hero-title"] li').nth(1),
    ).toHaveText(/27 de 254\s+semifinalista en Calisfest 2024/);
  });

  test('el JSON-LD publica logros y certificaciones del coach (§9.4)', async ({
    page,
  }) => {
    const data = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    const person = data['@graph'].find(
      (n: { '@type': string }) => n['@type'] === 'Person',
    );
    expect(person.award).toHaveLength(4);
    expect(person.award[0]).toContain('Calisfest');
    expect(person.hasCredential).toHaveLength(2);
    expect(person.hasCredential[0]['@type']).toBe(
      'EducationalOccupationalCredential',
    );
  });

  test('el logo del header es el monograma trazado del PNG oficial', async ({
    page,
  }) => {
    const logo = page.locator('header svg').first();
    await expect(logo).toHaveAttribute('viewBox', '0 0 702.2 581.3');
  });
});
