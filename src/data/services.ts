import type { Service } from './types';

// Solo online y sin precios publicados (decisión del coach, 2026-10-26): el
// precio se comparte por WhatsApp.
export const services: Service[] = [
  {
    id: 'rutina',
    name: 'Rutina personalizada',
    audience:
      'Para quien entrena por su cuenta y quiere un plan hecho para su nivel.',
    // El seguimiento va primero: es lo que la distingue de un PDF cualquiera.
    // [[PENDIENTE]] Cómo es el seguimiento (¿por WhatsApp?, ¿revisa videos?).
    includes: [
      'Seguimiento conmigo después de recibirla',
      '2 rutinas en PDF para 4 semanas: una de carga y una de descarga',
      'Ejercicios explicados a detalle, con imágenes demostrativas',
      'Glosario de términos',
      'Entrega por correo en 7 a 12 días',
      'Dura 30 días y se puede renovar cada mes',
    ],
    note: 'el precio te lo paso por WhatsApp',
    cta: 'Quiero mi rutina',
    waInterest: 'la rutina personalizada',
  },
];
