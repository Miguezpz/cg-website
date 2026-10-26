import { test, expect } from '@playwright/test';

// Atletas de gis (DESIGN.md): decorativos, ligados al scroll y quietos con
// movimiento reducido.
const athlete = 'svg[data-athlete="pullup"]';
const shoulders = (page: import('@playwright/test').Page) =>
  page.locator(`${athlete} [data-body] > path`).getAttribute('d');

test('el atleta de dominadas es decorativo y sube con el scroll', async ({
  page,
}) => {
  await page.goto('/');
  const svg = page.locator(athlete);
  await expect(svg).toHaveAttribute('aria-hidden', 'true');
  await svg.scrollIntoViewIfNeeded();
  const before = await shoulders(page);
  await page.evaluate(() => scrollBy(0, 120));
  await expect.poll(() => shoulders(page)).not.toBe(before);
  // Las manos no se despegan de la barra (y = 0) en ninguna pose.
  const hands = await page
    .locator(`${athlete} [data-body] > circle[r="3.8"]`)
    .evaluateAll((els) => els.map((el) => el.getAttribute('cy')));
  expect(hands).toEqual(['0', '0']);
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('el atleta se queda en su pose fija', async ({ page }) => {
    await page.goto('/');
    const svg = page.locator(athlete);
    await svg.scrollIntoViewIfNeeded();
    const before = await shoulders(page);
    await page.evaluate(() => scrollBy(0, 200));
    await page.waitForTimeout(300);
    expect(await shoulders(page)).toBe(before);
  });
});
