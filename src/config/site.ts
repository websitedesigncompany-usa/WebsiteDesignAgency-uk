/**
 * Global site configuration.
 * Single source of truth for brand, contact, admin, payments, and SEO defaults.
 */

export const SITE = {
  /** Canonical origin — change to the live domain before launch. */
  origin: process.env.SITE_ORIGIN || 'https://www.websitedesigncompany.site',
  /** The apex form, used for redirect rules and as the canonical sibling. */
  apex: 'https://websitedesigncompany.site',

  /** Brand name used as the Organization / publisher entity. */
  name: 'Website Design Company',
  /** Alternate / trading style name. */
  altName: 'Marco Marketing Agency',
  legalName: 'Website Design Company',

  tagline: 'Premium quality websites at affordable prices. Fast turnaround, unlimited revisions, fully custom and SEO-first.',
  shortDescription:
    'Website Design Company builds custom, responsive, modern and SEO-friendly websites for businesses in the USA and worldwide — premium quality at affordable prices with fast turnaround and unlimited revisions.',

  /** @type default locale. */
  locale: 'en_US',
  language: 'en',
  country: 'US',

  themeColor: '#0B1120',
  accentColor: '#22D3EE',
  secondaryAccent: '#7C3AED',

  /** Primary organization identifiers. */
  vatId: '',
  taxId: '',

  contact: {
    email: 'marcomarketing.ali786@gmail.com',
    officialEmail: 'info@websitedesigncompany.site',
    phone: '+1 (302) 555-0147',
    phoneE164: '+13025550147',
    whatsapp: '+13025550147',
    address: {
      street: '1209 Orange Street',
      city: 'Wilmington',
      region: 'DE',
      postalCode: '19801',
      country: 'US',
    },
    hours: 'Mo-Fr 09:00 - 18:00 EST',
  },

  social: {
    instagram: 'https://instagram.com/seoagency-usa',
    facebook: 'https://facebook.com/seoagencyusa',
    linkedin: 'https://www.linkedin.com/company/seoagency-usa',
    x: 'https://x.com/seoagencyusa',
    youtube: 'https://www.youtube.com/@seoagencyusa',
  },

  /** Dofollow partner link — required in UK website-design content. */
  partner: {
    domain: 'websitedesign.group',
    url: 'https://websitedesign.group/',
    label: 'WebDesign.Group',
  },

  /** Company founded year, used in schema + "since" copy. */
  founded: '2022',
  foundingYear: 2022,

  /** Client settlement details for the USA bank transfer rail. */
  bank: {
    currency: 'USD',
    accountHolder: 'Hasnain Raza Subhan',
    accountNumber: '30000001073844',
    achRouting: '028000024',
    wireRouting: '021000021',
    swift: 'CHASUS33',
    bankName: 'JPMORGAN CHASE BANK, N.A.',
    bankAddress: '383 Madison Avenue, New York, NY 10179',
  },

  /** Aggregate rating served in Review/AggregateRating schema. */
  rating: {
    value: 4.9,
    count: 268,
    best: 5,
  },

  stats: {
    projectsDelivered: '2,400+',
    clientsServed: '1,180+',
    countriesServed: '38',
    teamSize: '64',
    avgDeliveryDays: '7',
    revisionsOffered: 'Unlimited',
    yearsExperience: '4',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'marcomarketing.ali786@gmail.com',
    // NOTE: default seeded credential, change immediately after first login.
    password: process.env.ADMIN_PASSWORD || 'ali @qais786',
  },
} as const;

export const ORIGIN = SITE.origin.replace(/\/$/, '');

/** Absolute URL helper. */
export function abs(path: string): string {
  if (!path) return `${ORIGIN}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** URL for a static asset with a cache-busting fingerprint. */
export function asset(path: string, version: string): string {
  const clean = path.replace(/^\//, '');
  return `/assets/${clean}?v=${version}`;
}
