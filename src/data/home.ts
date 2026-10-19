// Textos de la landing. Todo lo provisional va marcado con [[PENDIENTE]].

export const nav = [
  { label: 'Sobre mí', href: '/#sobre-mi' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Resultados', href: '/#resultados' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contacto', href: '/#contacto' },
] as const;

export const hero = {
  title: 'Desafía la gravedad',
  lede: 'Formamos deportistas hábiles y conscientes.',
  where: 'Calistenia en Morelia y online',
  primaryCta: 'Agenda tu clase muestra gratis',
  secondaryCta: { label: 'Ver planes y precios', href: '#servicios' },
  indicators: [
    { value: '5', label: 'disciplinas' },
    { value: 'Carga & Descarga', label: 'método propio' },
    { value: 'Gravedad Zero', label: 'evento que organizamos' },
  ],
  imageAlt:
    '[[PENDIENTE]] Foto del coach haciendo un skill en la barra (foto provisional)',
} as const;

export const about = {
  title: 'César Augusto',
  role: 'Coach y fundador de Control Gravedad',
  story: [
    '[[PENDIENTE]] Historia del coach (máximo 120 palabras): cómo empezó en la calistenia, qué lo llevó a fundar Control Gravedad y por qué entrena con el método Carga & Descarga.',
  ],
  credentials: [
    'Creador del método Carga & Descarga',
    'Organizador de Gravedad Zero, evento de calistenia en Morelia (enero 2026)',
    'Calistenia, streetlifting, movilidad, skills y entrenamiento funcional',
    '[[PENDIENTE]] Años de experiencia y certificaciones',
  ],
  photoAlt:
    'César Augusto, coach de Control Gravedad, con camisa negra y lentes, de pie con las manos en los bolsillos',
} as const;

export const servicesSection = {
  title: 'Planes y precios',
  intro:
    'Precios en pesos mexicanos. Se paga por transferencia SPEI; te enviamos los datos por WhatsApp.',
  ctaPrefix: 'Quiero',
} as const;

export const howItWorks = {
  title: 'Cómo funciona',
  steps: [
    {
      title: 'Escríbeme',
      text: 'Mándame un WhatsApp con tu nivel y lo que quieres lograr.',
    },
    {
      title: 'Clase muestra gratis',
      text: 'Entrenas una clase con el grupo, sin costo, para conocer el método.',
    },
    {
      title: 'Tu plan a la medida',
      text: 'Eliges el paquete o la rutina que mejor se adapta a tu tiempo y a tu meta.',
    },
  ],
  method: {
    title: 'Carga & Descarga',
    text: 'Las semanas se alternan. Así ganas fuerza sin acumular fatiga ni lesiones.',
    weeks: [
      {
        kind: 'carga',
        label: 'Semana de carga',
        text: 'Fuerza relativa y absoluta, resistencia y técnica pulcra en rangos de repetición adecuados.',
      },
      {
        kind: 'descarga',
        label: 'Semana de descarga',
        text: 'Biomecánica y técnica, descanso, movilidad y elasticidad para cuidar músculos y articulaciones.',
      },
    ],
    cycle: ['carga', 'descarga', 'carga', 'descarga'] as const,
  },
} as const;

export const offer = {
  title: 'Tu primera clase es gratis',
  text: 'Ven a una clase muestra, conoce el método y decide sin compromiso.',
  note: 'Sujeta a disponibilidad de horario y espacio dentro de la clase.',
  cta: 'Aparta tu clase muestra',
} as const;

export const faqSection = { title: 'Preguntas frecuentes' } as const;

export const resultsSection = {
  title: 'Resultados',
  intro: 'Mismo encuadre, misma luz: arrastra para comparar.',
  sliderLabel: 'Comparar antes y después',
  before: 'Antes',
  after: 'Después',
} as const;

export const testimonialsSection = {
  title: 'Lo que dicen los alumnos',
} as const;

export const contact = {
  title: 'Empieza hoy',
  text: 'Escríbeme por WhatsApp o déjame tus datos y te contacto.',
  whatsappCta: 'Escríbeme por WhatsApp',
  form: {
    title: 'Déjame tus datos',
    name: { label: 'Nombre', placeholder: 'Tu nombre…' },
    phone: { label: 'WhatsApp o teléfono', placeholder: '443 123 4567…' },
    goal: {
      label: 'Objetivo',
      placeholder: 'Elige una opción',
      options: [
        'Empezar desde cero',
        'Aprender skills (muscle-up, handstand…)',
        'Ganar fuerza (streetlifting)',
        'Mejorar mi movilidad',
        'Rutina personalizada (online)',
        'Otro',
      ],
    },
    message: {
      label: 'Mensaje (opcional)',
      placeholder: 'Cuéntame tu nivel o tus dudas…',
    },
    privacy: {
      before: 'Acepto el ',
      link: 'aviso de privacidad',
      after: '.',
    },
    submit: 'Enviar',
    sending: 'Enviando…',
    success: '¡Listo! Te escribo pronto por WhatsApp.',
    error:
      'No se pudo enviar. Inténtalo de nuevo o escríbeme directo por WhatsApp.',
    required: 'Obligatorio',
  },
} as const;

export const footer = {
  privacy: 'Aviso de privacidad',
  rights: 'Todos los derechos reservados.',
} as const;

export const thanks = {
  title: '¡Gracias!',
  text: 'Recibí tus datos. Te escribo pronto por WhatsApp; si prefieres no esperar, escríbeme tú.',
  back: 'Volver al inicio',
} as const;

export const notFound = {
  title: 'Aquí no hay barra',
  text: 'La página que buscas no existe o cambió de lugar.',
  back: 'Volver al inicio',
} as const;
