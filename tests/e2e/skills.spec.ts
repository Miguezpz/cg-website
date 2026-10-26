import { test, expect } from '@playwright/test';

// Ruta de skills (DESIGN.md): seis skills, cuatro etapas cada uno, pestañas
// con radios nativos y un CTA de WhatsApp que nombra el skill elegido.
const panel = (id: string) => `#skills [data-skill="${id}"]`;

test('muestra solo la escalera del skill elegido, con sus cuatro etapas', async ({
  page,
}) => {
  await page.goto('/');
  const radios = page.locator('#skills input[name="skill"]');
  await expect(radios).toHaveCount(6);
  await expect(radios.first()).toBeChecked();
  await expect(page.locator(panel('handstand'))).toBeVisible();
  await expect(page.locator(panel('frontlever'))).toBeHidden();
  await expect(page.locator(`${panel('handstand')} li`)).toHaveCount(4);
  await expect(page.locator(`${panel('handstand')} li`).last()).toContainText(
    'Meta',
  );

  await page.locator('#skills label', { hasText: 'Front lever' }).click();
  await expect(page.locator(panel('frontlever'))).toBeVisible();
  await expect(page.locator(panel('handstand'))).toBeHidden();
});

test('las pestañas se usan con el teclado', async ({ page }) => {
  await page.goto('/');
  await page.locator('#skills input[value="handstand"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#skills input[value="muscleup"]')).toBeChecked();
  await expect(page.locator(panel('muscleup'))).toBeVisible();
});

test('los dibujos son decorativos y el CTA nombra el skill', async ({
  page,
}) => {
  await page.goto('/');
  const figures = page.locator('#skills .stage-figure');
  await expect(figures).toHaveCount(24);
  for (const svg of await figures.all()) {
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
  }
  await page.locator('#skills label', { hasText: 'Planche' }).click();
  const cta = page.locator(`${panel('planche')} a[data-track="whatsapp"]`);
  await expect(cta).toHaveAttribute('data-source', 'skills');
  await expect(cta).toHaveAttribute('data-service', 'skill-planche');
  const text = new URL((await cta.getAttribute('href')) ?? '').searchParams.get(
    'text',
  );
  expect(text).toBe(
    'Hola, vi tu página web y me interesa aprender la planche.',
  );
});

test('las etapas suben de su escalón y quedan visibles', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#skills');
  await section.locator('ol:visible').scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute('data-seen', '');
  // Al terminar, ninguna etapa queda recortada.
  await expect
    .poll(() =>
      section
        .locator('ol:visible .stage-figure')
        .evaluateAll((svgs) =>
          svgs.every((svg) =>
            svg.getAnimations().every((a) => a.playState === 'finished'),
          ),
        ),
    )
    .toBe(true);
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('las etapas se ven sin animación', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#skills');
    await expect(section).not.toHaveAttribute('data-animate');
    await section.locator('ol:visible').scrollIntoViewIfNeeded();
    const clips = await section
      .locator('ol:visible .stage-figure')
      .evaluateAll((svgs) => svgs.map((svg) => getComputedStyle(svg).clipPath));
    expect(clips).toEqual(['none', 'none', 'none', 'none']);
  });
});
