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
      'Horarios y ubicación: [[PENDIENTE]]',
    ],
    plans: [
      { name: 'Clase individual', price: '$60', detail: '1 clase' },
      {
        name: 'Paquete I',
        price: '$360',
        detail: '3 clases por semana · 30 días',
      },
      {
        name: 'Paquete II',
        price: '$500',
        detail: '5 clases por semana · 30 días',
      },
    ],
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
    waInterest: 'la rutina personalizada',
  },
  {
    id: 'talleres',
    name: 'Talleres',
    audience: '[[PENDIENTE]] Temas, frecuencia y a quién van dirigidos.',
    includes: ['[[PENDIENTE]]'],
    plans: [
      { name: 'Taller', price: '[[PENDIENTE]]', detail: '[[PENDIENTE]]' },
    ],
    waInterest: 'los talleres',
  },
];
