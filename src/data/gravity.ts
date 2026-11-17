// Textos e imágenes de la landing animada /gravedad (spec T5.1).
// Decisiones del usuario (2026-11-15): solo online, atleta anónimo generado
// con IA (nunca se presenta como el coach) y sin audios.

import { contact, footer as homeFooter } from './home';
import { services } from './services';
import { site } from './site';
import heroClear from '../assets/gravity/hero-clear.jpg';
import heroChalk from '../assets/gravity/hero-chalk.jpg';
import rig from '../assets/gravity/rig.jpg';
import gripStill from '../assets/gravity/grip-still.jpg';
import summit from '../assets/gravity/summit.jpg';
import level01 from '../assets/gravity/level-01.jpg';
import level02 from '../assets/gravity/level-02.jpg';
import level03 from '../assets/gravity/level-03.jpg';
import level04 from '../assets/gravity/level-04.jpg';
import level05 from '../assets/gravity/level-05.jpg';
import tool01 from '../assets/gravity/tool-01.png';
import tool02 from '../assets/gravity/tool-02.png';
import tool03 from '../assets/gravity/tool-03.png';
import tool04 from '../assets/gravity/tool-04.png';
import tool05 from '../assets/gravity/tool-05.png';
import ringCutout from '../assets/gravity/ring-cutout.png';

/** Las fotos son de un modelo ficticio: se dice a la vista (PRODUCT.md). */
const aiNote = {
  short: 'Imagen ilustrativa generada con IA',
  long: 'Las fotografías de esta página son ilustrativas, generadas con IA; no retratan al coach ni a sus alumnos.',
} as const;

const illustrative = '(imagen ilustrativa generada con IA)';

/** El único servicio publicado: lo nombran los CTA que piden la rutina. */
const routine = services[0];

export const seo = {
  title: `${site.name} · Domina tu propio peso con calistenia online`,
  description:
    'Calistenia online con César Augusto: un método paso a paso, cinco herramientas y una progresión de tu primera dominada al control total. Escríbenos por WhatsApp.',
} as const;

export const nav = [
  { label: 'Método', href: '#metodo' },
  { label: 'Sesiones', href: '#sesion' },
  { label: 'Equipo', href: '#equipo' },
  { label: 'Progresión', href: '#progresion' },
  { label: 'Contacto', href: '#contacto' },
] as const;

export const header = {
  brand: site.name,
  home: `${site.name}, inicio`,
  navLabel: 'Principal',
  menuLabel: 'Menú',
  mobileNavLabel: 'Menú móvil',
} as const;

export const loader = {
  text: 'Aplicando magnesio…',
} as const;

export const hero = {
  title: 'Control',
  /** Única palabra del título en vino claro. */
  accent: 'Gravedad',
  subheadline: `${site.coach} · Calistenia online`,
  tagline: 'Domina tu propio peso. Desde cero hasta el control total.',
  cta: contact.whatsappCta,
  image: heroClear,
  chalkImage: heroChalk,
  imageAlt: `Atleta de calistenia con top negro sin mangas y las manos con magnesia, del pecho hacia arriba, sobre un fondo de acero oscuro ${illustrative}`,
  note: aiNote.short,
} as const;

export const method = {
  title: 'El método, paso a paso.',
  text: 'Sin improvisar. Construimos fuerza real respetando tus articulaciones.',
  pathLabel:
    'Progresión del método en cuatro etapas: 01 escápula, 02 tirón, 03 empuje y 04 estáticos',
  checkpoints: [
    { n: '01', label: 'Escápula' },
    { n: '02', label: 'Tirón' },
    { n: '03', label: 'Empuje' },
    { n: '04', label: 'Estáticos' },
  ],
  stats: [
    { value: 'Online', label: 'Seguimiento personalizado' },
    { value: '100%', label: 'Adaptado a tu nivel actual' },
    { value: '7–12 días', label: 'Para recibir tu rutina' },
  ],
  cta: 'Preguntar por mi rutina en WhatsApp',
  service: routine,
} as const;

export const session = {
  title: 'En la sesión.',
  cues: [
    {
      n: '01',
      label: 'Técnica',
      text: 'Escápulas activas, abdomen bloqueado. Controla la bajada en tres segundos.',
    },
    {
      n: '02',
      label: 'Desde cero',
      text: 'No necesitas experiencia previa. Empezamos desde cero.',
    },
  ],
  image: rig,
  imageAlt: `Estructura de barras y paralelas de acero negro mate sobre un piso de concreto ${illustrative}`,
} as const;

export const tools = {
  title: 'Herramientas mínimas.',
  text: 'Cinco elementos. Cero máquinas. Todo tu cuerpo.',
  viewer: {
    label: 'Anilla de gimnasia de madera en 3D',
    hint: 'Arrastra o usa las flechas del teclado para girarla.',
    image: ringCutout,
    imageAlt: `Anilla de gimnasia de madera de abedul colgada de una correa negra ${illustrative}`,
  },
  items: [
    {
      n: '01',
      name: 'Anillas de madera',
      image: tool01,
      alt: `Par de anillas de madera con correas negras ${illustrative}`,
    },
    {
      n: '02',
      name: 'Paralelas bajas',
      image: tool02,
      alt: `Paralelas bajas de acero negro mate ${illustrative}`,
    },
    {
      n: '03',
      name: 'Barra fija',
      image: tool03,
      alt: `Barra fija de acero negro mate ${illustrative}`,
    },
    {
      n: '04',
      name: 'Bloque de magnesio y muñequeras',
      image: tool04,
      alt: `Bloque de magnesio blanco junto a un par de muñequeras negras ${illustrative}`,
    },
    {
      n: '05',
      name: 'Cinturón de lastre',
      image: tool05,
      alt: `Cinturón de lastre negro con cadena de acero ${illustrative}`,
    },
  ],
} as const;

export const progression = {
  title: 'De tu primera dominada al control.',
  levels: [
    {
      label: 'Nivel 01',
      text: 'Tu primera dominada estricta. Base sólida sin balanceos.',
      image: level01,
      alt: `Atleta en una dominada estricta sobre una barra negra, con el cuerpo en hueco ${illustrative}`,
    },
    {
      label: 'Nivel 02',
      text: 'Muscle-up limpio. Fuerza explosiva y transición controlada.',
      image: level02,
      alt: `Atleta sobre la barra al terminar un muscle-up, con magnesia en el aire ${illustrative}`,
    },
    {
      label: 'Nivel 03',
      text: 'Pino libre. Equilibrio y alineación vertical.',
      image: level03,
      alt: `Atleta en parada de manos libre sobre un piso de concreto ${illustrative}`,
    },
    {
      label: 'Nivel 04',
      text: 'Front lever. Tensión horizontal de pies a cabeza.',
      image: level04,
      alt: `Atleta en front lever, horizontal bajo una barra negra ${illustrative}`,
    },
    {
      label: 'Nivel 05',
      text: 'Full planche. Gravedad bajo control.',
      image: level05,
      alt: `Atleta en plancha completa sobre paralelas bajas negras ${illustrative}`,
    },
  ],
} as const;

export const finale = {
  skip: 'Saltar secuencia',
  grip: {
    title: 'La gravedad siempre está ahí.',
    text: 'Aprende a dominarla.',
    hold: 'Mantén para agarrar',
    holdHint:
      'Mantén presionado el control, o la barra espaciadora o Enter, durante 1.2 segundos.',
    held: 'Agarre firme.',
    image: gripStill,
    imageAlt: `Bloque de magnesio blanco junto a una anilla de madera y su correa negra sobre una superficie de acero oscuro ${illustrative}`,
  },
  tension: {
    text: 'Cinco segundos de tensión.',
    overlay: 'Gravedad bajo control.',
    readout: 'Control',
    posterAlt: `Atleta sosteniendo una plancha completa sobre paralelas bajas en un estudio de concreto ${illustrative}`,
  },
  summit: {
    /** Única palabra del cierre en vino claro. */
    accent: 'Empieza',
    rest: 'hoy.',
    text: 'Tu cuerpo es tu único gimnasio. Entrena desde casa, a tu ritmo.',
    cta: 'Pedir mi rutina por WhatsApp',
    service: routine,
    image: summit,
    imageAlt: `Atleta en parada de manos sobre una barra alta de acero frente a un muro de concreto ${illustrative}`,
  },
  form: {
    title: contact.form.title,
    text: contact.text,
    name: contact.form.name,
    contact: {
      label: 'Contacto (WhatsApp o correo)',
      placeholder: '55 1234 5678 o tu@correo.com…',
    },
    goal: contact.form.goal,
    privacy: contact.form.privacy,
    submit: contact.form.submit,
    sending: contact.form.sending,
    success: '¡Listo! Te escribo pronto.',
    error: contact.form.error,
    errors: {
      required: contact.form.errors.required,
      contact: 'Escribe un WhatsApp de al menos 10 dígitos o un correo.',
      goal: contact.form.errors.goal,
      privacy: contact.form.errors.privacy,
    },
    errorCta: contact.form.errorCta,
    subject: `Nuevo contacto desde /gravedad · ${site.name}`,
  },
} as const;

export const footer = {
  title: 'Nos vemos en la barra.',
  whatsapp: contact.whatsappCta,
  instagram: site.social.find((link) => link.network === 'instagram'),
  sectionsLabel: 'Secciones',
  top: 'Volver al inicio',
  copyright: `© 2026 ${site.name} · Online`,
  privacy: homeFooter.privacy,
  note: aiNote.long,
} as const;
