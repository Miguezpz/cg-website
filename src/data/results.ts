import type { Result } from './types';
import gaelBefore from '../assets/results/gael-before.jpg';
import gaelAfter from '../assets/results/gael-after.jpg';

// Fotos recortadas a 4:5 para igualar el encuadre (el «antes» se acercó para
// que el torso quede a la misma escala) y sin metadatos EXIF.
// [[PENDIENTE]] Consentimiento escrito de Gael (spec §17.2), tiempo de
// entrenamiento entre las dos fotos y su logro concreto (por ahora se muestra
// lo que se ve en las fotos). Segundo atleta: lo manda el usuario después.
export const results: Result[] = [
  {
    demo: 'Atleta real de César. Falta: su consentimiento escrito, el tiempo de entrenamiento y su logro concreto.',
    name: 'Gael',
    achievement: 'Más músculo y definición',
    before: gaelBefore,
    after: gaelAfter,
    alt: {
      before:
        'Gael antes de entrenar: selfie sin camisa frente al espejo, complexión delgada y brazos finos',
      after:
        'Gael después de entrenar: selfie sin camisa frente al espejo, con hombros, brazos y abdomen marcados',
    },
  },
];
