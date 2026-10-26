import { test, expect, type Page } from '@playwright/test';

// Atletas de gis (DESIGN.md): decorativos, ligados al scroll (o una sola vez
// en la 404) y quietos con movimiento reducido.
const athlete = (exercise: string) => `svg[data-athlete="${exercise}"]`;
const pose = (page: Page, exercise: string) =>
  page
    .locator(`${athlete(exercise)} [data-body] > *`)
    .evaluateAll((els) => els.map((el) => el.outerHTML).join(''));

for (const exercise of ['pullup', 'pistol']) {
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

test('en las dominadas las manos no se despegan de la barra', async ({
  page,
}) => {
  await page.goto('/');
  const svg = page.locator(athlete('pullup'));
  await svg.scrollIntoViewIfNeeded();
  for (const step of [0, 90, 90]) {
    await page.evaluate((y) => scrollBy(0, y), step);
    const hands = await page
      .locator(`${athlete('pullup')} [data-body] > circle[r="3.8"]`)
      .evaluateAll((els) => els.map((el) => el.getAttribute('cy')));
    expect(hands).toEqual(['0', '0']);
  }
});

test('en la 404 el atleta salta una sola vez y termina de pie', async ({
  page,
}) => {
  await page.goto('/no-existe/');
  const svg = page.locator(athlete('jump'));
  await expect(svg).toHaveAttribute('aria-hidden', 'true');
  // Empieza y termina de pie; a mitad del salto está en otra pose.
  const start = await pose(page, 'jump');
  await page.waitForTimeout(800);
  expect(await pose(page, 'jump')).not.toBe(start);
  await page.waitForTimeout(1400);
  const end = await pose(page, 'jump');
  await page.waitForTimeout(300);
  expect(await pose(page, 'jump')).toBe(end);
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('los atletas se quedan en su pose fija', async ({ page }) => {
    await page.goto('/');
    for (const exercise of ['pullup', 'pistol']) {
      const svg = page.locator(athlete(exercise));
      await svg.scrollIntoViewIfNeeded();
      const before = await pose(page, exercise);
      await page.evaluate(() => scrollBy(0, 200));
      await page.waitForTimeout(200);
      expect(await pose(page, exercise)).toBe(before);
    }
    await page.goto('/no-existe/');
    const still = await pose(page, 'jump');
    await page.waitForTimeout(600);
    expect(await pose(page, 'jump')).toBe(still);
  });
});
