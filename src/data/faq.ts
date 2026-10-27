import type { FaqItem } from './types';

export const faq: FaqItem[] = [
  {
    q: '¿Necesito experiencia o fuerza para empezar?',
    // [[PENDIENTE]] Respuesta del coach.
    a: 'No. Tu rutina se arma para tu nivel: empiezas con progresiones básicas y avanzas a tu ritmo con el método Carga & Descarga.',
    demo: 'Respuesta de ejemplo. Confirmar con el coach.',
  },
  {
    // Precio y pago van juntos para dejar sitio a «¿Por qué no solo sigo
    // videos?» sin pasar de 8 preguntas (RF-09).
    q: '¿Cuánto cuesta y cómo pago?',
    a: 'Escríbeme por WhatsApp con tu nivel y lo que quieres lograr, y te comparto el precio y los detalles. Se paga por transferencia SPEI: te enviamos los datos por WhatsApp; al pagar, pon tu nombre y apellido en el concepto y manda la captura del comprobante.',
  },
  {
    q: '¿Qué recibo y cuándo?',
    a: 'Por correo, en 7 a 12 días, 2 rutinas en PDF para 4 semanas (una de carga y una de descarga), con cada ejercicio explicado e ilustrado y un glosario de términos. Después te doy seguimiento. El plan vence a los 30 días y lo puedes renovar cada mes.',
  },
  {
    q: '¿Por qué no solo sigo videos de YouTube?',
    // [[PENDIENTE]] Respuesta del coach.
    a: 'Un video no conoce tu nivel ni te corrige. Tu rutina se arma para ti, alterna semanas de carga y de descarga para que progreses sin lesionarte, y después de recibirla te doy seguimiento.',
    demo: 'Respuesta de ejemplo. Confirmar con el coach.',
  },
  {
    q: '¿Qué skills puedo aprender?',
    a: 'Parada de manos, muscle-up, front lever, planche, back lever y pistol squat, siempre con progresiones según tu nivel.',
    link: { label: 'Ver cada skill en movimiento', href: '#skills' },
  },
  {
    q: '¿Necesito equipo?',
    // [[PENDIENTE]] Qué necesita el alumno.
    a: 'Ropa cómoda, agua y toalla.',
    demo: 'Respuesta de ejemplo. Confirmar qué necesita el alumno.',
  },
  {
    q: '¿Hay edad mínima o requisitos de salud?',
    a: 'A partir de 15 años; los menores, con permiso de un adulto. Antes de empezar te envío un formulario para conocer tu estado de salud y si tienes alguna lesión.',
  },
  {
    q: '¿Y si necesito algo más personalizado?',
    a: 'Escríbeme por WhatsApp, cuéntame qué necesitas y vemos cómo te puedo ayudar.',
  },
];
