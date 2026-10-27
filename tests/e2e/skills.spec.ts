import { test, expect, type Browser, type Page } from '@playwright/test';

// Ruta de skills (DESIGN.md): seis skills, cada uno con una figura de gis (los
// de posición se quedan en ella; los de repeticiones van en bucle), pestañas
// con radios nativos y un CTA de WhatsApp que nombra el skill elegido.
const panel = (id: string) => `#skills [data-skill="${id}"]`;
const pose = (page: Page, id: string) =>
  page
    .locator(`${panel(id)} [data-body] > *`)
    .evaluateAll((els) => els.map((el) => el.outerHTML).join(''));

test('muestra solo el skill elegido, con una sola figura y sin etapas', async ({
  page,
}) => {
  await page.goto('/');
  const radios = page.locator('#skills input[name="skill"]');
  await expect(radios).toHaveCount(6);
  await expect(radios.first()).toBeChecked();
  await expect(page.locator(panel('handstand'))).toBeVisible();
  await expect(page.locator(panel('frontlever'))).toBeHidden();
  await expect(page.locator(`${panel('handstand')} .skill-figure`)).toHaveCount(
    1,
  );
  // Ni etapas, ni meta, ni cronómetro.
  await expect(page.locator(`${panel('handstand')} li`)).toHaveCount(0);
  await expect(page.locator('#skills [data-timer]')).toHaveCount(0);
  await expect(page.locator('#skills')).not.toContainText('Meta');

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
  const figures = page.locator('#skills .skill-figure');
  await expect(figures).toHaveCount(6);
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
    'Hola, vi tu página web y me interesa aprender la planche.\n\nMi nivel: \nMi meta: ',
  );
});

/** La pose fija del skill, la que se ve sin JS. */
async function stillPose(browser: Browser, id: string) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const still = await pose(page, id);
  await context.close();
  return still;
}

test('los skills de posición llegan a ella y se quedan', async ({
  page,
  browser,
}) => {
  const still = await stillPose(browser, 'frontlever');
  await page.goto('/');
  await page.locator('#skills .skill-tab', { hasText: 'Front lever' }).click();
  await page
    .locator(`${panel('frontlever')} .skill-figure`)
    .scrollIntoViewIfNeeded();
  // Empieza en el tuck, llega a la pose fija y ya no se mueve.
  await expect.poll(() => pose(page, 'frontlever')).not.toBe(still);
  await expect
    .poll(() => pose(page, 'frontlever'), { timeout: 6000 })
    .toBe(still);
  await page.waitForTimeout(1500);
  expect(await pose(page, 'frontlever')).toBe(still);
});

test('los skills de repeticiones van en bucle', async ({ page, browser }) => {
  const still = await stillPose(browser, 'muscleup');
  await page.goto('/');
  await page.locator('#skills .skill-tab', { hasText: 'Muscle-up' }).click();
  await page
    .locator(`${panel('muscleup')} .skill-figure`)
    .scrollIntoViewIfNeeded();
  // Sale de la pose fija, vuelve a ella y vuelve a salir: no se detiene.
  await expect.poll(() => pose(page, 'muscleup')).not.toBe(still);
  await expect
    .poll(() => pose(page, 'muscleup'), { timeout: 8000 })
    .toBe(still);
  await expect
    .poll(() => pose(page, 'muscleup'), { timeout: 8000 })
    .not.toBe(still);
});

test('todas las figuras van a la misma escala', async ({ page }) => {
  await page.goto('/');
  const scales = await page
    .locator('#skills .skill-figure')
    .evaluateAll((svgs) =>
      (svgs as SVGSVGElement[]).map((svg) => {
        svg.closest<HTMLElement>('.skill-panel')!.style.display = 'block';
        return svg.getBoundingClientRect().height / svg.viewBox.baseVal.height;
      }),
    );
  for (const scale of scales) expect(scale).toBeCloseTo(scales[0], 1);
});

test('unas figuras son de ella y otras de él', async ({ page }) => {
  await page.goto('/');
  // Ella lleva glúteo (un path) en el cuerpo; él no.
  const her = await page
    .locator('#skills [data-skill]')
    .evaluateAll((panels) =>
      panels
        .filter((p) => p.querySelector('[data-body] path'))
        .map((p) => (p as HTMLElement).dataset.skill),
    );
  expect(her).toEqual(['handstand', 'frontlever', 'pistol']);
});

test('la FAQ y el menú llevan a la ruta de skills', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('#faq a[href="#skills"]', {
      hasText: 'Ver cada skill en movimiento',
    }),
  ).toHaveCount(1);
  await expect(page.locator('a[data-nav-link][href="/#skills"]')).toHaveCount(
    1,
  );
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('la figura se queda en su pose fija', async ({ page }) => {
    await page.goto('/');
    await page
      .locator(`${panel('handstand')} .skill-figure`)
      .scrollIntoViewIfNeeded();
    const still = await pose(page, 'handstand');
    await page.waitForTimeout(1500);
    expect(await pose(page, 'handstand')).toBe(still);
  });
});
