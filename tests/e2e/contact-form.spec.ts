import { test, expect, type Page } from '@playwright/test';

const API = 'https://api.web3forms.com/submit';

async function fillValid(page: Page) {
  const form = page.locator('form[data-contact-form]');
  await form.getByLabel('Nombre').fill('Ana Prueba');
  await form.getByLabel('WhatsApp o teléfono').fill('443 123 4567');
  await form.getByLabel('Objetivo').selectOption('Empezar desde cero');
  await form.getByLabel(/aviso de privacidad/).check();
  return form;
}

test.describe('Formulario de contacto con JS (RF-10)', () => {
  test('marca los errores, los anuncia y enfoca el primero', async ({
    page,
  }) => {
    await page.goto('/');
    const form = page.locator('form[data-contact-form]');
    await form.getByRole('button', { name: 'Enviar' }).click();
    await expect(form.getByLabel('Nombre')).toBeFocused();
    await expect(form.getByLabel('Nombre')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(form.locator('#f-name-error')).toBeVisible();
    await expect(form.locator('#f-privacy-error')).toBeVisible();
  });

  test('envío exitoso: estado de envío, confirmación sin recargar y sin PII', async ({
    page,
  }) => {
    let body = '';
    await page.route(API, async (route) => {
      body = route.request().postData() ?? '';
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ json: { success: true } });
    });
    await page.goto('/');
    const form = await fillValid(page);
    const submit = form.locator('[type="submit"]');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText('Enviando…');
    await expect(form.getByRole('status')).toContainText('¡Listo!');
    await expect(submit).toBeEnabled();
    expect(body).toContain('Ana Prueba');
    expect(body).not.toContain('name="redirect"');
    await expect(form.getByLabel('Nombre')).toHaveValue('');
  });

  test('envío fallido: mensaje de error y WhatsApp como alternativa', async ({
    page,
  }) => {
    await page.route(API, (route) =>
      route.fulfill({ status: 400, json: { success: false } }),
    );
    await page.goto('/');
    const form = await fillValid(page);
    await form.locator('[type="submit"]').click();
    await expect(form.getByRole('status')).toContainText('No se pudo enviar');
    const fallback = form.locator('[data-form-fallback]');
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/524433019533/,
    );
  });
});
