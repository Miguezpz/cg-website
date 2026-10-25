import type { Result } from './types';
import before1 from '../assets/demo/result-1-before.jpg';
import after1 from '../assets/demo/result-1-after.jpg';
import before2 from '../assets/demo/result-2-before.jpg';
import after2 from '../assets/demo/result-2-after.jpg';

// [[PENDIENTE]] Casos reales de antes y después, con consentimiento escrito
// de cada alumno (spec §17.2). Las fotos actuales son de stock (ver
// src/assets/demo/CREDITOS.md) y el «antes» es la misma foto en gris.
const demo =
  'Fotos de stock: el «antes» es la misma foto en gris. Falta: casos reales con mismo encuadre, tiempo de entrenamiento y consentimiento escrito.';

export const results: Result[] = [
  {
    demo,
    name: 'Alumno de ejemplo',
    duration: '6 meses',
    achievement: 'Primer «skin the cat» en anillas',
    before: before1,
    after: after1,
    alt: {
      before:
        'Foto de ejemplo en gris: atleta colgado de cabeza en anillas dentro de un gimnasio',
      after:
        'Foto de ejemplo a color: atleta colgado de cabeza en anillas dentro de un gimnasio',
    },
  },
  {
    demo,
    name: 'Alumno de ejemplo',
    duration: '4 meses',
    achievement: 'Primer muscle-up completo',
    before: before2,
    after: after2,
    alt: {
      before:
        'Foto de ejemplo en gris: hombre poniéndose magnesia en las manos en una pista al aire libre',
      after:
        'Foto de ejemplo a color: hombre poniéndose magnesia en las manos en una pista al aire libre',
    },
  },
];
