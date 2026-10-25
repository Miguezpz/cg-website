import type { Testimonial } from './types';

// [[PENDIENTE]] Testimonios reales con autorización de uso (spec §17.2).
// Los de abajo son de ejemplo: la sección muestra un aviso «Demo».
export const testimonials: Testimonial[] = [
  {
    name: 'Alumna principiante (ejemplo)',
    quote:
      'Nunca había hecho una dominada. En pocas semanas ya entrenaba con el grupo sin sentirme fuera de lugar.',
    achievement: 'Primera dominada',
  },
  {
    name: 'Alumno intermedio (ejemplo)',
    quote:
      'Las semanas de descarga cambiaron todo: dejé de lesionarme y por fin salió el muscle-up.',
    achievement: 'Primer muscle-up',
  },
  {
    name: 'Alumno online (ejemplo)',
    quote:
      'La rutina llegó clarísima, con cada ejercicio explicado. La sigo desde casa a mi ritmo.',
    achievement: 'Rutina personalizada',
  },
];
