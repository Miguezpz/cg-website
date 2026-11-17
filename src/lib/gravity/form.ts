// Formulario de /gravedad (Web3Forms). Con JS validamos nosotros y se envía
// con fetch; sin JS, el navegador valida y el POST es nativo (redirige a
// /gracias). A GA4 solo va el objetivo elegido: nunca nombre ni contacto.
import { track } from '../analytics';

type Field = HTMLInputElement | HTMLSelectElement;
type Status = 'idle' | 'sending' | 'success' | 'error';

export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-gravity-form]');
  if (!form) return;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  const label = form.querySelector<HTMLElement>('[data-submit-label]');
  const message = form.querySelector<HTMLElement>('[data-form-message]');
  const fallback = form.querySelector<HTMLElement>('[data-form-fallback]');
  if (!submit || !label || !message || !fallback) return;

  form.noValidate = true;
  const copy = Object.fromEntries(
    [
      ...(form.querySelector<HTMLTemplateElement>('[data-copy]')?.content
        .children ?? []),
    ].map((el) => [(el as HTMLElement).dataset.key, el.textContent ?? '']),
  );
  const fields = ['name', 'contact', 'goal', 'privacy'].map(
    (name) => form.elements.namedItem(name) as Field,
  );

  const showError = (field: Field, invalid: boolean) => {
    field.setAttribute('aria-invalid', String(invalid));
    const error = form.querySelector<HTMLElement>(
      `[data-error-for="${field.name}"]`,
    );
    if (error) error.hidden = !invalid;
  };

  const setStatus = (status: Status) => {
    submit.disabled = status === 'sending';
    label.textContent = status === 'sending' ? copy.sending : copy.submit;
    message.hidden = status === 'idle' || status === 'sending';
    message.textContent = status === 'success' ? copy.success : copy.error;
    message.className =
      status === 'error' ? 'text-error-on-dark' : 'font-semibold text-chalk';
    fallback.hidden = status !== 'error';
  };

  // El error se retira en cuanto el campo es válido, mientras se escribe: si
  // esperara al `change` (al salir del campo), el texto que desaparece
  // movería el formulario justo bajo el dedo que toca el siguiente control.
  const recheck = (field: Field) => {
    if (field.getAttribute('aria-invalid') === 'true') {
      showError(field, !field.checkValidity());
    }
  };
  for (const field of fields) {
    field.addEventListener('input', () => {
      if (field.checkValidity()) recheck(field);
    });
    field.addEventListener('change', () => recheck(field));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalid = fields.filter((field) => !field.checkValidity());
    fields.forEach((field) => showError(field, invalid.includes(field)));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    setStatus('sending');
    const data = new FormData(form);
    data.delete('redirect');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
      };
      if (!response.ok || !result.success) throw new Error('send failed');
      track('form_submit', { goal: String(data.get('goal') ?? '') });
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });
}
