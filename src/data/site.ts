import type { Site } from './types';

export const site: Site = {
  name: 'Control Gravedad',
  coach: 'César Augusto',
  tagline: 'Formamos deportistas hábiles y conscientes.',
  slogan: 'Desafía la gravedad',
  area: 'Morelia, Michoacán · Online',
  email: 'controlgravedad@gmail.com',
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '524433019533',
  social: [
    {
      network: 'instagram',
      handle: '@controlgravedad',
      url: 'https://www.instagram.com/controlgravedad',
    },
    {
      network: 'tiktok',
      handle: '@controlgravedad',
      url: 'https://www.tiktok.com/@controlgravedad',
    },
  ],
  seo: {
    title:
      'Control Gravedad · Clases de calistenia en Morelia y online con César Augusto',
    description:
      'Calistenia, streetlifting, movilidad y skills en Morelia y online. Método Carga & Descarga para progresar con técnica y sin lesiones. Tu primera clase muestra es gratis.',
    ogImage: '/og-image.jpg',
  },
};
