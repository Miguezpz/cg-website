import type { Testimonial } from './types';

// Reseñas públicas de Google Maps de la antigua sede (2024–2025), recortadas
// sin cambiar palabras (… = texto omitido). Se quitó lo que habla del lugar
// físico. Nombre con apellido abreviado, sin fotos de perfil ni logros
// inventados.
// [[PENDIENTE]] Autorización de uso de cada persona (spec §17.1.2, pendientes).
const googleMaps = 'Reseña en Google Maps';

export const testimonials: Testimonial[] = [
  {
    name: 'Roberto G.',
    quote:
      'César es un excelente coach, que te brinda todas las herramientas para superar tus propios límites, te impulsa constantemente además de acompañarte siempre…',
    source: googleMaps,
  },
  {
    name: 'Sofía H.',
    quote:
      '…gracias a los coaches con su entrenamiento tan personalizado he logrado progresar atléticamente como nunca lo había hecho. Recomendadísimo.',
    source: googleMaps,
  },
  {
    name: 'Asdrubal R.',
    quote: 'Excelente comunidad para aprender calistenia.',
    source: googleMaps,
  },
];
