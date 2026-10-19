import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/privacidad/', '/gracias/'];

test('la home carga con lang es-MX y un solo h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-MX');
  await expect(page.locator('h1')).toHaveCount(1);
});

for (const path of pages) {
  test(`sin violaciones serias o críticas de axe en ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const blocking = violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      blocking,
      blocking
        .map(
          (v) =>
            `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
        )
        .join('\n'),
    ).toEqual([]);
  });
}
