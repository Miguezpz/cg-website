// Textos de la landing. Todo lo provisional va marcado con [[PENDIENTE]].

import { site } from './site';

export const nav = [
  { label: 'Sobre mí', href: '/#sobre-mi' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Resultados', href: '/#resultados' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contacto', href: '/#contacto' },
] as const;

export const hero = {
  // Bajo 640 px el header solo muestra el monograma: ahí el nombre va sobre el
  // título (desde 640 px ya lo lleva el header).
  brand: site.name,
  // La frase de la marca como título; el beneficio va en el subtítulo
  // (decisión del usuario, 2026-10-26).
  title: 'Desafía la gravedad',
  /** Palabra del título en vino claro. */
  accent: 'gravedad',
  lede: 'Calistenia online a tu nivel, para progresar con técnica y sin lesionarte.',
  where: 'Formamos deportistas hábiles y conscientes',
  primaryCta: 'Escríbeme por WhatsApp',
  note: 'precio y detalles por WhatsApp',
  secondaryCta: { label: 'Ver la rutina', href: '#servicios' },
  indicators: [
    { value: '7–12 días', label: 'para recibir tu rutina' },
    { value: 'Carga & Descarga', label: 'método de trabajo' },
    { value: 'Gravedad Zero', label: 'evento que organizamos' },
  ],
  // [[PENDIENTE]] La foto actual mide 540 × 960 px: falta la versión en alta
  // resolución (vertical, de al menos 1600 × 2000 px).
  imageAlt:
    'Atleta sin camiseta y con gorra en hollow back sobre barras paralelas bajas, en un parque con árboles',
  // El recorte 4:5 baja hasta las manos y las barras.
  imagePosition: '50% 75%',
  imageDemo:
    'Foto en baja resolución (540 × 960 px). Falta: la misma foto de al menos 1600 × 2000 px.',
} as const;

// Una puerta por perfil (PRODUCT.md · Users), cada una con su mensaje de WhatsApp.
export const audience = {
  title: '¿Para quién es?',
  mark: { word: 'quién', kind: 'underline' },
  profiles: [
    {
      id: 'principiante',
      title: 'Nunca he entrenado calistenia',
      text: 'Tu rutina se arma para tu nivel: empiezas con progresiones básicas y cuidas tus articulaciones desde el primer día.',
      cta: 'Empiezo desde cero',
      waInterest: 'empezar desde cero',
    },
    {
      id: 'skills',
      title: 'Ya entreno y quiero skills',
      text: 'Muscle-up, parada de manos, front lever o planche, con progresiones según tu nivel y técnica pulcra.',
      cta: 'Quiero mi primer skill',
      waInterest: 'aprender un skill',
    },
    {
      // [[PENDIENTE]] Cuánto dura cada sesión y cuántos días por semana pide la
      // rutina (lo confirma el coach); es la duda principal de este perfil.
      id: 'a-tu-ritmo',
      title: 'No tengo horario fijo',
      text: 'Recibes tu rutina en PDF y entrenas donde y cuando puedas, con seguimiento después de recibirla.',
      cta: 'Quiero entrenar a mi ritmo',
      waInterest: 'entrenar a mi ritmo',
    },
  ],
} as const;

export const about = {
  title: 'César Augusto',
  mark: { word: 'Augusto', kind: 'underline' },
  role: 'Coach y fundador de Control Gravedad',
  // [[PENDIENTE]] Historia real del coach (máx. 120 palabras).
  story: [
    'La calistenia me enseñó que la fuerza se construye con técnica, paciencia y constancia. Fundé Control Gravedad para entrenar así a más personas, estén donde estén: con un método que alterna semanas de carga y de descarga para progresar sin lastimarte.',
  ],
  demo: 'Historia de ejemplo. Falta: la historia real del coach (máx. 120 palabras), sus años de experiencia y sus certificaciones.',
  credentials: [
    'Implementa el método Carga & Descarga',
    'Organizador de Gravedad Zero, evento de calistenia (enero 2026)',
    'Calistenia, streetlifting, movilidad, skills y entrenamiento funcional',
    // [[PENDIENTE]] Años de experiencia y certificaciones reales. No se
    // muestra nada mientras tanto: «por confirmar» le resta autoridad.
  ],
  cta: { lead: '¿Entrenamos juntos?', label: 'Escríbeme por WhatsApp' },
  photoAlt:
    'César Augusto, coach de Control Gravedad, con camisa negra y lentes, de pie con las manos en los bolsillos',
} as const;

export const servicesSection = {
  title: 'Entrena online',
  mark: { word: 'online', kind: 'circle' },
  intro:
    'Escríbeme por WhatsApp con tu nivel y tu meta, y te comparto el precio y los detalles.',
  custom: {
    title: '¿Necesitas algo más personalizado?',
    text: 'Si buscas algo distinto a la rutina, escríbeme, cuéntame qué necesitas y vemos cómo te puedo ayudar.',
    cta: 'Escríbeme',
    waInterest: 'algo más personalizado',
  },
} as const;

export const skillsSection = {
  title: 'Tu ruta de skills',
  mark: { word: 'skills', kind: 'underline' },
  intro:
    'Ningún skill sale de golpe: se construye con progresiones. Empiezas donde estás y la rutina te lleva hasta él.',
  legend: 'Elige un skill',
} as const;

export const howItWorks = {
  title: 'Cómo funciona',
  mark: { word: 'funciona', kind: 'underline' },
  steps: [
    {
      title: 'Escríbeme',
      text: 'Mándame un WhatsApp con tu nivel y lo que quieres lograr; te comparto el precio y los detalles.',
    },
    {
      title: 'Recibe tu rutina',
      text: 'En 7 a 12 días te llegan por correo 2 rutinas en PDF hechas para tu nivel.',
    },
    {
      title: 'Entrena a tu ritmo',
      text: 'Alternas semanas de carga y de descarga durante 4 semanas, donde tú entrenes.',
    },
  ],
  method: {
    title: 'Carga & Descarga',
    text: 'Progresas sin estancarte ni lesionarte: las semanas de fuerza se alternan con semanas de técnica, movilidad y descanso.',
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
    legend: 'Elige una semana para ver su enfoque',
    hint: 'toca una semana para ver su enfoque',
  },
} as const;

export const tape = {
  label: 'Disciplinas',
  items: [
    'Calistenia',
    'Streetlifting',
    'Movilidad',
    'Skills Movements',
    'Funcional',
  ],
} as const;

export const faqSection = {
  title: 'Preguntas frecuentes',
  mark: { word: 'frecuentes', kind: 'double' },
} as const;

export const resultsSection = {
  title: 'Resultados',
  mark: { word: 'Resultados', kind: 'double' },
  intro: 'Arrastra la línea para comparar el antes y el después.',
  sliderLabel: 'Comparar antes y después',
  before: 'Antes',
  after: 'Después',
} as const;

export const testimonialsSection = {
  title: 'Lo que dicen los alumnos',
  mark: { word: 'alumnos', kind: 'underline' },
  swipeHint: 'Desliza para ver más',
  cta: { lead: '¿Quieres progresar así?', label: 'Escríbeme por WhatsApp' },
  demo: 'Reseñas reales de Google Maps. Falta: la autorización de uso de cada persona.',
} as const;

export const contact = {
  title: 'Empieza hoy',
  mark: { word: 'hoy', kind: 'circle', accent: true },
  text: 'Escríbeme por WhatsApp o déjame tus datos y te contacto.',
  whatsappCta: 'Escríbeme por WhatsApp',
  floatingLabel: 'Escríbeme por WhatsApp',
  form: {
    title: 'Déjame tus datos',
    name: { label: 'Nombre', placeholder: 'Tu nombre…' },
    phone: { label: 'WhatsApp o teléfono', placeholder: '55 1234 5678…' },
    goal: {
      label: 'Objetivo',
      placeholder: 'Elige una opción',
      // Las tres primeras son los perfiles de «¿Para quién es?».
      options: [
        'Empezar desde cero',
        'Aprender skills (muscle-up, parada de manos…)',
        'Entrenar a mi ritmo, sin horario fijo',
        'Ganar fuerza (streetlifting)',
        'Mejorar mi movilidad',
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
    note: 'solo uso tus datos para contactarte',
    submit: 'Enviar',
    sending: 'Enviando…',
    success: '¡Listo! Te escribo pronto por WhatsApp.',
    error:
      'No se pudo enviar. Inténtalo de nuevo o escríbeme directo por WhatsApp.',
    errors: {
      required: 'Este campo es obligatorio.',
      phone: 'Escribe un número de al menos 10 dígitos.',
      goal: 'Elige tu objetivo.',
      privacy: 'Acepta el aviso de privacidad para poder enviar.',
    },
    errorCta: 'Escribir por WhatsApp',
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
