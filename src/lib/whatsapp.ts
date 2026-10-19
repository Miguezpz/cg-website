import { site } from '../data/site';
import type { Service } from '../data/types';

/** Dónde está el enlace; se envía a GA4 como `source` (spec §9.1). */
export type WaSource = 'hero' | 'services' | 'offer' | 'contact' | 'floating';

const DEFAULT_INTEREST = 'la clase muestra gratis';

export function waMessage(service?: Pick<Service, 'waInterest'>): string {
  return `Hola, vi tu página web y me interesa ${service?.waInterest ?? DEFAULT_INTEREST}.`;
}

export function waLink({
  service,
}: { service?: Pick<Service, 'waInterest'> } = {}): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(waMessage(service))}`;
}

/** Atributos de un enlace de WhatsApp: `href` + los `data-*` que lee la analítica. */
export function waAttrs({
  service,
  source,
}: {
  service?: Pick<Service, 'id' | 'waInterest'>;
  source: WaSource;
}) {
  return {
    href: waLink({ service }),
    'data-track': 'whatsapp',
    'data-source': source,
    'data-service': service?.id ?? 'clase-muestra',
    target: '_blank',
    rel: 'noopener',
  } as const;
}
