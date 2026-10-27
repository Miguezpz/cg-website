import { test, expect } from '@playwright/test';

test('cada servicio abre WhatsApp con un mensaje distinto que lo nombra (RF-04)', async ({
  page,
}) => {
  await page.goto('/');
  const ctas = page.locator('a[data-track="whatsapp"][data-source="services"]');
  await expect(ctas).not.toHaveCount(0);
  const messages = await ctas.evaluateAll((links) =>
    links.map(
      (a) =>
        new URL((a as HTMLAnchorElement).href).searchParams.get('text') ?? '',
    ),
  );
  expect(new Set(messages).size).toBe(messages.length);
  for (const message of messages) {
    expect(message).toMatch(
      /^Hola, vi tu página web y me interesa .+\.\n\nMi nivel: \nMi meta: $/,
    );
    expect(message).not.toContain('clase muestra');
  }
});
