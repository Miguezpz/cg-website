import { test, expect, type Browser, type Page } from '@playwright/test';

// Ruta de skills (DESIGN.md): seis skills, cada uno con una figura de gis (los
// de posición llegan a ella y la sostienen con micro-ajustes; los de
// repeticiones van en bucle), pestañas con radios nativos y un CTA de WhatsApp
// que nombra el skill elegido.
const panel = (id: string) => `#skills [data-skill="${id}"]`;
const pose = (page: Page, id: string) =>
  page
    .locator(`${panel(id)} [data-body] > *`)
    .evaluateAll((els) => els.map((el) => el.outerHTML).join(''));
/** La mayor diferencia entre las coordenadas de dos poses (mismo marcado). */
const drift = (a: string, b: string) => {
  const [x, y] = [a, b].map((s) => s.match(/-?\d+(\.\d+)?/g)!.map(Number));
  return Math.max(...x.map((n, i) => Math.abs(n - y[i])));
};

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

test('los skills de posición llegan a ella y la sostienen con micro-ajustes', async ({
  page,
  browser,
}) => {
  const still = await stillPose(browser, 'frontlever');
  await page.goto('/');
  await page.locator('#skills .skill-tab', { hasText: 'Front lever' }).click();
  await page
    .locator(`${panel('frontlever')} .skill-figure`)
    .scrollIntoViewIfNeeded();
  // Empieza colgado, lejos de la posición, y llega a ella.
  await expect
    .poll(async () => drift(await pose(page, 'frontlever'), still))
    .toBeGreaterThan(20);
  await expect
    .poll(async () => drift(await pose(page, 'frontlever'), still), {
      timeout: 8000,
    })
    .toBeLessThan(2);
  // Ya en la posición, se mueve menos de 2 unidades, pero se mueve.
  const seen = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const now = await pose(page, 'frontlever');
    expect(drift(now, still)).toBeLessThan(2);
    seen.add(now);
    await page.waitForTimeout(200);
  }
  expect(seen.size).toBeGreaterThan(1);
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

test('a 375×667, las pestañas, cada skill y su CTA caben sobre la barra de WhatsApp', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const top = await page
    .locator('#skills fieldset')
    .evaluate((el) => el.getBoundingClientRect().top);
  for (const tab of await page.locator('#skills .skill-tab').all()) {
    await tab.click();
    const id = await tab.locator('input').inputValue();
    const bottom = await page
      .locator(`[data-skill="${id}"] a[data-track="whatsapp"]`)
      .evaluate((el) => el.getBoundingClientRect().bottom);
    // Header de 64 px arriba y barra de WhatsApp (~70 px) abajo.
    expect(bottom - top, id).toBeLessThanOrEqual(667 - 64 - 70);
  }
});
