import type { Result } from './types';
import before1 from '../assets/placeholders/before-1.jpg';
import after1 from '../assets/placeholders/after-1.jpg';
import before2 from '../assets/placeholders/before-2.jpg';
import after2 from '../assets/placeholders/after-2.jpg';

// [[PENDIENTE]] Casos reales de antes y después, con consentimiento escrito
// de cada alumno (spec §17.2). Si no llegan, se vacía y la sección se oculta (R-02).
export const results: Result[] = [
  {
    name: '[[PENDIENTE]] Alumno 1',
    duration: '[[PENDIENTE]] meses',
    achievement: '[[PENDIENTE]] Logro concreto',
    before: before1,
    after: after1,
    alt: {
      before: '[[PENDIENTE]] Descripción de la foto de antes',
      after: '[[PENDIENTE]] Descripción de la foto de después',
    },
  },
  {
    name: '[[PENDIENTE]] Alumno 2',
    duration: '[[PENDIENTE]] meses',
    achievement: '[[PENDIENTE]] Logro concreto',
    before: before2,
    after: after2,
    alt: {
      before: '[[PENDIENTE]] Descripción de la foto de antes',
      after: '[[PENDIENTE]] Descripción de la foto de después',
    },
  },
];
