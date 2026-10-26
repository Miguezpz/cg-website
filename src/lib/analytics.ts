// GA4 diferido + un solo listener delegado (spec §9.3). Nunca se envía PII.

type EventName =
  | 'whatsapp_click'
  | 'form_submit'
  | 'social_click'
  | 'skill_view'
  | 'skill_stage';
type Params = Record<string, string>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.PUBLIC_GA_ID;

export function track(event: EventName, params: Params = {}): void {
  if (!GA_ID) {
    if (import.meta.env.DEV) console.debug('[analytics]', event, params);
    return;
  }
  window.gtag('event', event, params);
}

function onClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const el = target.closest<HTMLElement>('[data-track]');
  if (!el) return;
  const { track: kind, source = '', service = '', network = '' } = el.dataset;
  if (kind === 'whatsapp') track('whatsapp_click', { source, service });
  else if (kind === 'social') track('social_click', { network });
}

function loadGa(id: string): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js espera el objeto `arguments`, no un array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id);

  let loaded = false;
  const inject = () => {
    if (loaded) return;
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  };
  // Fuera del camino crítico: tras `load` (en tiempo libre) o en la primera interacción.
  const afterLoad = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(inject, { timeout: 3000 })
      : setTimeout(inject, 1500);
  if (document.readyState === 'complete') afterLoad();
  else addEventListener('load', afterLoad, { once: true });
  for (const type of ['pointerdown', 'keydown', 'scroll'] as const) {
    addEventListener(type, inject, { once: true, passive: true });
  }
}

export function initAnalytics(): void {
  if (GA_ID) loadGa(GA_ID);
  document.addEventListener('click', onClick);
}
