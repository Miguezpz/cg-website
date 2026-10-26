import { test, expect, type Page } from '@playwright/test';

// Atletas de gis (DESIGN.md): decorativos, ligados al scroll en la landing,
// una sola vez en páginas cortas, quietos con movimiento reducido y nunca dos
// en la misma pantalla.
const landing = ['pullup', 'dips', 'muscleup'];
const athlete = (exercise: string) => `svg[data-athlete="${exercise}"]`;
const pose = (page: Page, exercise: string) =>
  page
    .locator(`${athlete(exercise)} [data-body] > *`)
    .evaluateAll((els) => els.map((el) => el.outerHTML).join(''));

for (const exercise of landing) {
  test(`el atleta (${exercise}) es decorativo y se mueve con el scroll`, async ({
    page,
  }) => {
    await page.goto('/');
    const svg = page.locator(athlete(exercise));
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await svg.scrollIntoViewIfNeeded();
    const before = await pose(page, exercise);
    await page.evaluate(() => scrollBy(0, 120));
    await expect.poll(() => pose(page, exercise)).not.toBe(before);
  });
}

test('las manos no se despegan de la barra ni de las anillas', async ({
  page,
}) => {
  await page.goto('/');
  for (const exercise of landing) {
    await page.locator(athlete(exercise)).scrollIntoViewIfNeeded();
    for (const step of [0, 90, 90]) {
      await page.evaluate((y) => scrollBy(0, y), step);
      // La mano es el último círculo pequeño del cuerpo (en y = 0).
      const hands = await page
        .locator(`${athlete(exercise)} [data-body] > circle`)
        .evaluateAll((els) =>
          els
            .filter((el) => Number(el.getAttribute('r')) < 4)
            .map((el) => el.getAttribute('cy')),
        );
      expect(hands.length).toBeGreaterThan(0);
      expect(new Set(hands)).toEqual(new Set(['0']));
    }
  }
});

for (const [width, height] of [
  [375, 812],
  [1280, 900],
]) {
  test(`nunca hay dos atletas en la misma pantalla (${width}×${height})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('svg[data-athlete]')]
        .map((svg) => {
          const rect = svg.getBoundingClientRect();
          return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
        })
        .sort((a, b) => a.top - b.top),
    );
    expect(boxes.length).toBe(landing.length);
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].top - boxes[i - 1].bottom).toBeGreaterThan(height);
    }
  });
}

for (const [path, exercise] of [
  ['/no-existe/', 'jump'],
  ['/gracias/', 'pistol'],
]) {
  test(`en ${path} el atleta se mueve una sola vez y termina quieto`, async ({
    page,
  }) => {
    await page.goto(path);
    const svg = page.locator(athlete(exercise));
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveAttribute('data-play', 'once');
    await svg.scrollIntoViewIfNeeded();
    // Empieza y termina en la misma pose; a mitad del movimiento, en otra.
    const start = await pose(page, exercise);
    await expect.poll(() => pose(page, exercise)).not.toBe(start);
    await page.waitForTimeout(2600);
    const end = await pose(page, exercise);
    await page.waitForTimeout(300);
    expect(await pose(page, exercise)).toBe(end);
  });
}

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('los atletas se quedan en su pose fija', async ({ page }) => {
    await page.goto('/');
    for (const exercise of landing) {
      const svg = page.locator(athlete(exercise));
      await svg.scrollIntoViewIfNeeded();
      const before = await pose(page, exercise);
      await page.evaluate(() => scrollBy(0, 200));
      await page.waitForTimeout(200);
      expect(await pose(page, exercise)).toBe(before);
    }
    for (const [path, exercise] of [
      ['/no-existe/', 'jump'],
      ['/gracias/', 'pistol'],
    ]) {
      await page.goto(path);
      const still = await pose(page, exercise);
      await page.waitForTimeout(600);
      expect(await pose(page, exercise)).toBe(still);
    }
  });
});
