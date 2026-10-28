// JSON-LD: Person + Organization + Service por servicio + FAQPage (spec §9.4).
// Sin dirección pública no se usa LocalBusiness (D-06). Lo provisional o demo
// (borradores, respuestas `demo`, [[PENDIENTE]]) no se publica.
import type { FaqItem, Service, Site } from '../data/types';

const PENDING = '[[PENDIENTE]]';
const isReal = (...texts: string[]) => texts.every((t) => !t.includes(PENDING));

export interface CredentialGroup {
  kind: 'award' | 'certification';
  title: string;
  items: readonly { text: string; detail: string }[];
}

// Todo es online (2026-10-26); sin precios publicados no hay `offers`.
const areaServed: Record<Service['id'], object> = {
  rutina: { '@type': 'Country', name: 'México' },
};

export function buildStructuredData({
  site,
  siteUrl,
  services,
  faq,
  credentials = [],
  coachImage,
}: {
  site: Site;
  siteUrl: URL;
  services: Service[];
  faq: FaqItem[];
  credentials?: readonly CredentialGroup[];
  coachImage?: string;
}) {
  const credentialItems = (kind: CredentialGroup['kind']) =>
    credentials
      .filter((group) => group.kind === kind)
      .flatMap((group) => group.items)
      .filter((item) => isReal(item.text, item.detail));
  const awards = credentialItems('award').map((i) => `${i.text} (${i.detail})`);
  const certifications = credentialItems('certification').map((i) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'certificate',
    name: i.text,
    description: i.detail,
  }));

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
    ...(awards.length && { award: awards }),
    ...(certifications.length && { hasCredential: certifications }),
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
