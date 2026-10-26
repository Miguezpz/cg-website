import type { Skill } from './types';

// Skills que enseña el coach (§17.1.2) y una progresión clásica de cada uno.
// [[PENDIENTE]] Que el coach confirme las etapas que usa en cada skill.
export const skills: Skill[] = [
  {
    id: 'handstand',
    name: 'Parada de manos',
    stages: [
      'Pike en cajón',
      'Pecho a la pared',
      'Tijera libre',
      'Parada libre',
    ],
    cta: 'Quiero mi parada de manos',
    waInterest: 'aprender la parada de manos',
  },
  {
    id: 'muscleup',
    name: 'Muscle-up',
    stages: [
      'Dominada al pecho',
      'Fondo en barra recta',
      'Transición',
      'Muscle-up',
    ],
    cta: 'Quiero mi primer muscle-up',
    waInterest: 'aprender el muscle-up',
  },
  {
    id: 'frontlever',
    name: 'Front lever',
    stages: ['Tuck', 'Tuck avanzado', 'Una pierna', 'Front lever'],
    cta: 'Quiero mi front lever',
    waInterest: 'aprender el front lever',
  },
  {
    id: 'planche',
    name: 'Planche',
    stages: ['Planche lean', 'Tuck', 'Tuck avanzado', 'Planche'],
    cta: 'Quiero mi planche',
    waInterest: 'aprender la planche',
  },
  {
    id: 'backlever',
    name: 'Back lever',
    stages: ['Tuck', 'Tuck avanzado', 'Una pierna', 'Back lever'],
    cta: 'Quiero mi back lever',
    waInterest: 'aprender el back lever',
  },
  {
    id: 'pistol',
    name: 'Pistol squat',
    stages: [
      'Sentadilla profunda',
      'Pistol a un cajón',
      'Pistol con apoyo',
      'Pistol squat',
    ],
    cta: 'Quiero mi pistol squat',
    waInterest: 'aprender la pistol squat',
  },
];
