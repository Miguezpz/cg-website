import { test, expect } from '@playwright/test';

test('JSON-LD con Person, Service y FAQPage sin contenido provisional (§9.4)', async ({
  page,
}) => {
  await page.goto('/');
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(raw).not.toContain('[[PENDIENTE]]');
  const data = JSON.parse(raw!);
  const types = data['@graph'].map(
    (node: { '@type': string }) => node['@type'],
  );
  expect(types).toEqual(
    expect.arrayContaining(['Person', 'Service', 'FAQPage']),
  );
  expect(types).not.toContain('LocalBusiness');
  const faq = data['@graph'].find(
    (n: { '@type': string }) => n['@type'] === 'FAQPage',
  );
  expect(faq.mainEntity.length).toBeGreaterThan(0);
  // Solo online y sin precios publicados.
  const services = data['@graph'].filter(
    (n: { '@type': string }) => n['@type'] === 'Service',
  );
  expect(services).toHaveLength(1);
  expect(services[0].areaServed.name).toBe('México');
  expect(services[0]).not.toHaveProperty('offers');
  expect(raw).not.toMatch(/Morelia|presencial/i);
});
