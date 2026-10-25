import type { Service } from './types';

// Precios publicados en Instagram el 2024-12-18 (MXN). Vigencia: [[PENDIENTE]].
export const services: Service[] = [
  {
    id: 'presencial',
    name: 'Clases presenciales',
    audience:
      'Para quien está en Morelia y quiere entrenar en grupo con un coach al lado.',
    includes: [
      'Calistenia, streetlifting, movilidad, skills y funcional',
      'Método Carga & Descarga: semanas de fuerza y semanas de técnica y recuperación',
      'Todos los entrenamientos los imparte un coach capacitado',
      // [[PENDIENTE]] Horarios y ubicación reales.
      'Horario de ejemplo: lunes a viernes 7:00 y 19:00 · sábados 9:00',
    ],
    plans: [
      { name: 'Clase individual', price: '$60', detail: '1 clase' },
      {
        name: 'Paquete I',
        price: '$360',
        perWeek: 3,
        detail: '3 clases por semana · 30 días',
      },
      {
        name: 'Paquete II',
        price: '$500',
        perWeek: 5,
        detail: '5 clases por semana · 30 días',
      },
    ],
    note: 'los paquetes duran 30 días',
    demo: 'Horario de ejemplo. Falta: horarios reales y el lugar en Morelia (¿se puede publicar la dirección?).',
    cta: 'Quiero entrenar en Morelia',
    waInterest: 'las clases presenciales en Morelia',
  },
  {
    id: 'rutina',
    name: 'Rutina personalizada',
    audience:
      'Para quien no vive en Morelia o entrena por su cuenta y quiere un plan hecho para su nivel.',
    includes: [
      '2 rutinas en PDF para 4 semanas: una de carga y una de descarga',
      'Ejercicios explicados a detalle, con imágenes demostrativas',
      'Glosario de términos',
      'Entrega por correo en 7 a 12 días',
    ],
    plans: [
      { name: 'Rutina personalizada', price: '$860', detail: '4 semanas' },
    ],
    cta: 'Quiero mi rutina',
    waInterest: 'la rutina personalizada',
  },
  {
    id: 'talleres',
    name: 'Talleres',
    // [[PENDIENTE]] Talleres reales: temas, fechas, duración y precio.
    audience:
      'Sesiones especiales para dominar un skill concreto, en grupos reducidos y por nivel.',
    includes: [
      'Taller de parada de manos (ejemplo)',
      'Taller de muscle-up (ejemplo)',
      'Taller de movilidad para hombros y cadera (ejemplo)',
    ],
    demo: 'Talleres de ejemplo. Falta: temas reales, fechas, duración y precio.',
    draft: true,
    // [[PENDIENTE]] Precio de los talleres; sin precio real no se muestra la fila.
    plans: [],
    cta: 'Quiero info de talleres',
    waInterest: 'los talleres',
  },
];
