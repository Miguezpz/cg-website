import { test, expect } from '@playwright/test';

test.describe('Contacto y botón flotante (RF-10, RF-12)', () => {
  test('el formulario tiene etiquetas, honeypot y envío nativo', async ({
    page,
  }) => {
    await page.goto('/');
    const form = page.locator('form[data-contact-form]');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute(
      'action',
      'https://api.web3forms.com/submit',
    );
    await expect(form.locator('input[name="botcheck"]')).toHaveCount(1);
    for (const label of ['Nombre', 'WhatsApp o teléfono', 'Objetivo']) {
      await expect(form.getByLabel(label)).toHaveAttribute('required', '');
    }
    await expect(form.getByLabel(/aviso de privacidad/)).toHaveAttribute(
      'required',
      '',
    );
    await expect(form.locator('input[name="redirect"]')).toHaveValue(
      'https://controlgravedad.vercel.app/gracias/',
    );
  });

  test('el botón flotante se oculta en el Hero y en Contacto', async ({
    page,
  }) => {
    await page.goto('/');
    const floating = page.locator('[data-floating-wa]');
    await expect(floating).toHaveAttribute('data-hidden', '');
    await page.locator('#servicio-rutina').scrollIntoViewIfNeeded();
    await expect(floating).not.toHaveAttribute('data-hidden', '');
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    await expect(floating).toHaveAttribute('data-hidden', '');
  });
});

test.describe('Sin JavaScript (RNF-08)', () => {
  test.use({ javaScriptEnabled: false });

  test('se ve el contenido y los CTAs y el formulario siguen funcionando', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-menu-toggle]')).toBeHidden();
    const hrefs = await page
      .locator('a[data-track="whatsapp"]')
      .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs)
      expect(href).toMatch(/^https:\/\/wa\.me\/524433019533\?text=/);
    await expect(
      page.locator('form[data-contact-form] [type="submit"]'),
    ).toBeEnabled();
  });
});
