import type { ImageMetadata } from 'astro';
import type { SkillId } from '../lib/skill-poses';

export type ServiceId = 'rutina';

export interface Service {
  id: ServiceId;
  name: string;
  audience: string;
  includes: string[];
  /** Anotación a mano bajo el botón (informativa). */
  note?: string;
  /** Aviso de contenido demo: qué falta reunir para que sea real. */
  demo?: string;
  /** Servicio aún sin definir: no se publica en los datos estructurados. */
  draft?: boolean;
  /** Texto del botón de WhatsApp de la tarjeta. */
  cta: string;
  /** Lo que completa «Hola, vi tu página web y me interesa …». */
  waInterest: string;
}

export interface Result {
  /** Aviso de contenido demo: qué falta reunir para que sea real. */
  demo?: string;
  name: string;
  duration: string;
  achievement: string;
  before: ImageMetadata;
  after: ImageMetadata;
  alt: { before: string; after: string };
}

export interface Testimonial {
  name: string;
  quote: string;
  achievement?: string;
  /** De dónde sale la cita (ej. «Reseña en Google Maps»). */
  source?: string;
  /** Plataforma de la reseña: muestra su logo junto a `source`. */
  platform?: 'google';
  photo?: ImageMetadata;
}

export interface FaqItem {
  q: string;
  a: string;
  /** Respuesta demo: qué falta confirmar. No se publica en el JSON-LD. */
  demo?: string;
  /** Enlace después de la respuesta (no se publica en el JSON-LD). */
  link?: { label: string; href: string };
}

export interface SocialLink {
  network: 'instagram' | 'tiktok';
  handle: string;
  url: string;
}

export interface Site {
  name: string;
  coach: string;
  tagline: string;
  slogan: string;
  area: string;
  email: string;
  whatsappNumber: string;
  social: SocialLink[];
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
}

export interface Skill {
  /** Clave de su dibujo en `src/lib/skill-poses.ts`. */
  id: SkillId;
  name: string;
  /** Texto del botón de WhatsApp de este skill. */
  cta: string;
  /** Lo que completa «Hola, vi tu página web y me interesa …». */
  waInterest: string;
}
