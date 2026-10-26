import { test, expect, type Page } from '@playwright/test';

// Ruta de skills (DESIGN.md): seis skills, cuatro etapas cada uno, pestañas
// con radios nativos y un CTA de WhatsApp que nombra el skill elegido.
const panel = (id: string) => `#skills [data-skill="${id}"]`;
const meta = (page: Page, id: string) =>
  page
    .locator(`${panel(id)} [data-meta] [data-body] > *`)
    .evaluateAll((els) => els.map((el) => el.outerHTML).join(''));

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

  await page.locator('#skills .skill-tab', { hasText: 'Front lever' }).click();
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
  await page.locator('#skills .skill-tab', { hasText: 'Planche' }).click();
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

test('la meta se ejecuta una vez al verse y termina en su posición', async ({
  page,
}) => {
  await page.goto('/');
  const still = await meta(page, 'frontlever');
  await page.locator('#skills .skill-tab', { hasText: 'Front lever' }).click();
  await page.locator(`${panel('frontlever')} ol`).scrollIntoViewIfNeeded();
  // Empieza en otra pose (el tuck) y vuelve a la pose fija de la meta.
  await expect.poll(() => meta(page, 'frontlever')).not.toBe(still);
  await expect
    .poll(() => meta(page, 'frontlever'), { timeout: 6000 })
    .toBe(still);
});

test('la etapa elegida se agrega al mensaje de WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.locator('#skills .skill-tab', { hasText: 'Muscle-up' }).click();
  const cta = page.locator(`${panel('muscleup')} a[data-track="whatsapp"]`);
  const text = async () =>
    new URL((await cta.getAttribute('href')) ?? '').searchParams.get('text');

  await page
    .locator(`${panel('muscleup')} .stage-pick`, { hasText: 'Transición' })
    .click();
  expect(await text()).toBe(
    'Hola, vi tu página web y me interesa aprender el muscle-up. Ahora voy en «Transición».',
  );
  // Al cambiar de etapa, se reemplaza (no se acumula).
  await page
    .locator(`${panel('muscleup')} .stage-pick`, { hasText: 'Meta' })
    .click();
  expect(await text()).toBe(
    'Hola, vi tu página web y me interesa aprender el muscle-up. Ya llegué a «Muscle-up» y quiero seguir avanzando.',
  );
  await expect(
    page.locator(`${panel('muscleup')} input[name="etapa-muscleup"]:checked`),
  ).toHaveValue('4');
});

test('mientras la meta sostiene, el cronómetro cuenta hasta 0:03', async ({
  page,
}) => {
  await page.goto('/');
  const timer = page.locator(`${panel('handstand')} [data-timer]`);
  await expect(timer).toBeHidden();
  await page.locator(`${panel('handstand')} ol`).scrollIntoViewIfNeeded();
  await expect(timer).toHaveText('0:03', { timeout: 9000 });
  await expect(timer).toHaveAttribute('aria-hidden', 'true');
});

test('la etapa elegida se propone en el formulario sin pisar lo escrito', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#skills .skill-tab', { hasText: 'Planche' }).click();
  await page
    .locator(`${panel('planche')} .stage-pick`, { hasText: 'Tuck avanzado' })
    .click();
  await expect(page.locator('#f-goal')).toHaveValue(
    'Aprender skills (muscle-up, parada de manos…)',
  );
  await expect(page.locator('#f-message')).toHaveValue(
    'Me interesa aprender la planche. Ahora voy en «Tuck avanzado».',
  );
  // Si cambia de etapa, la propuesta se actualiza…
  await page
    .locator(`${panel('planche')} .stage-pick`, { hasText: 'Etapa 1' })
    .click();
  await expect(page.locator('#f-message')).toHaveValue(
    'Me interesa aprender la planche. Ahora voy en «Planche lean».',
  );
  // …pero lo que la persona escribe no se toca.
  await page.locator('#f-message').fill('Tengo una lesión de hombro.');
  await page
    .locator(`${panel('planche')} .stage-pick`, { hasText: 'Tuck' })
    .first()
    .click();
  await expect(page.locator('#f-message')).toHaveValue(
    'Tengo una lesión de hombro.',
  );
});

test('la FAQ y el menú llevan a la ruta de skills', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('#faq a[href="#skills"]', {
      hasText: 'Ver las etapas de cada skill',
    }),
  ).toHaveCount(1);
  await expect(page.locator('a[data-nav-link][href="/#skills"]')).toHaveCount(
    1,
  );
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
    // La meta se queda en su pose fija y no hay cronómetro.
    const still = await meta(page, 'handstand');
    await page.waitForTimeout(1500);
    expect(await meta(page, 'handstand')).toBe(still);
    await expect(
      page.locator(`${panel('handstand')} [data-timer]`),
    ).toBeHidden();
  });
});
