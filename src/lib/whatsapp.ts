import { site } from '../data/site';

/** Lo que se ofrece en el enlace: un servicio o el bloque «a la medida». */
interface WaInterest {
  id: string;
  /** Lo que completa «Hola, vi tu página web y me interesa …». */
  waInterest: string;
}

/** Dónde está el enlace; se envía a GA4 como `source` (spec §9.1). */
export type WaSource = 'hero' | 'services' | 'contact' | 'floating';

const DEFAULT_INTEREST = 'entrenar contigo';

export function waMessage(service?: Pick<WaInterest, 'waInterest'>): string {
  return `Hola, vi tu página web y me interesa ${service?.waInterest ?? DEFAULT_INTEREST}.`;
}

export function waLink({
  service,
}: { service?: Pick<WaInterest, 'waInterest'> } = {}): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(waMessage(service))}`;
}

/** Atributos de un enlace de WhatsApp: `href` + los `data-*` que lee la analítica. */
export function waAttrs({
  service,
  source,
}: {
  service?: WaInterest;
  source: WaSource;
}) {
  return {
    href: waLink({ service }),
    'data-track': 'whatsapp',
    'data-source': source,
    'data-service': service?.id ?? 'general',
    target: '_blank',
    rel: 'noopener',
  } as const;
}
