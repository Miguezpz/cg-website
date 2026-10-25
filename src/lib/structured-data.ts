// JSON-LD: Person + Organization + Service por servicio + FAQPage (spec §9.4).
// Sin dirección pública no se usa LocalBusiness (D-06). Lo provisional o demo
// (borradores, respuestas `demo`, [[PENDIENTE]]) no se publica.
import type { FaqItem, Service, Site } from '../data/types';

const PENDING = '[[PENDIENTE]]';
const isReal = (...texts: string[]) => texts.every((t) => !t.includes(PENDING));

const areaServed: Record<Service['id'], object> = {
  presencial: {
    '@type': 'City',
    name: 'Morelia',
    containedInPlace: { '@type': 'State', name: 'Michoacán' },
  },
  rutina: { '@type': 'Country', name: 'México' },
  talleres: {
    '@type': 'City',
    name: 'Morelia',
    containedInPlace: { '@type': 'State', name: 'Michoacán' },
  },
};

export function buildStructuredData({
  site,
  siteUrl,
  services,
  faq,
  coachImage,
}: {
  site: Site;
  siteUrl: URL;
  services: Service[];
  faq: FaqItem[];
  coachImage?: string;
}) {
  const orgId = new URL('#organizacion', siteUrl).href;
  const personId = new URL('#coach', siteUrl).href;

  const organization = {
    '@type': 'SportsOrganization',
    '@id': orgId,
    name: site.name,
    slogan: site.tagline,
    url: siteUrl.href,
    logo: new URL(site.seo.ogImage, siteUrl).href,
    email: site.email,
    sport: 'Calistenia',
    sameAs: site.social.map((s) => s.url),
    founder: { '@id': personId },
  };

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: site.coach,
    jobTitle: 'Coach de calistenia',
    worksFor: { '@id': orgId },
    ...(coachImage && { image: new URL(coachImage, siteUrl).href }),
  };

  const serviceNodes = services
    .filter((s) => !s.draft && isReal(s.name, s.audience))
    .map((s) => ({
      '@type': 'Service',
      name: `${s.name} · ${site.name}`,
      serviceType: 'Entrenamiento de calistenia',
      description: s.audience,
      provider: { '@id': orgId },
      areaServed: areaServed[s.id],
      offers: s.plans
        .filter((p) => isReal(p.price, p.name))
        .map((p) => ({
          '@type': 'Offer',
          name: p.name,
          description: p.detail,
          price: p.price.replace(/[^0-9.]/g, ''),
          priceCurrency: 'MXN',
        })),
    }));

  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: faq
      .filter((item) => !item.demo && isReal(item.q, item.a))
      .map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, person, ...serviceNodes, faqPage],
  };
}
