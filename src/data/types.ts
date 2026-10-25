import type { ImageMetadata } from 'astro';

export type ServiceId = 'presencial' | 'rutina' | 'talleres';

export interface Plan {
  name: string;
  price: string;
  detail: string;
  /** Clases por semana: se dibujan como marcas de gis junto al plan. */
  perWeek?: number;
}

export interface Service {
  id: ServiceId;
  name: string;
  audience: string;
  includes: string[];
  plans: Plan[];
  /** Anotación a mano junto a los precios (informativa). */
  note?: string;
  /** Texto del botón de WhatsApp de la tarjeta. */
  cta: string;
  /** Lo que completa «Hola, vi tu página web y me interesa …». */
  waInterest: string;
}

export interface Result {
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
  photo?: ImageMetadata;
}

export interface FaqItem {
  q: string;
  a: string;
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
