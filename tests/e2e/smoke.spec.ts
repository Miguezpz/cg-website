import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('la home carga con lang es-MX y un solo h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-MX');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('sin violaciones serias o críticas de axe', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    blocking,
    blocking.map((v) => `${v.id}: ${v.help}`).join('\n'),
  ).toEqual([]);
});
