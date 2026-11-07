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

/**
 * Optional sub-path the site is served from.
 *
 * GitHub Pages serves a project site from `/<repo>/`, so every root-relative
 * link in the rendered HTML has to carry that prefix. The canonical domain
 * stays the real one — canonicals, sitemaps and hreflang never mention the
 * preview host — so this only affects navigational and asset URLs.
 */
export const BASE_PATH = (process.env.SITE_BASE_PATH || '').trim().replace(/\/+$/, '');

/**
 * Publish only text-servable assets.
 *
 * A GitHub Pages branch pushed through a text-only transport cannot carry the
 * WebP and PNG logo variants, so the build also writes the logo as an SVG
 * wrapper with the artwork embedded, and the pages point at that instead.
 */
export const TEXT_ASSETS = process.env.SITE_TEXT_ASSETS === '1';

/** Absolute URL helper. */
export function abs(path: string): string {
  if (!path) return `${ORIGIN}/`;
  if (/^https?:\/\//i.test(path)) return path;
  // A path that already carries the deployment sub-path is a canonical path
  // for the real domain — strip the prefix so canonicals stay clean.
  let p = path;
  if (BASE_PATH && (p === BASE_PATH || p.startsWith(`${BASE_PATH}/`))) {
    p = p.slice(BASE_PATH.length) || '/';
  }
  return `${ORIGIN}${p.startsWith('/') ? '' : '/'}${p}`;
}

/** URL for a static asset with a cache-busting fingerprint. */
export function asset(path: string, version: string): string {
  const clean = path.replace(/^\//, '');
  return `${BASE_PATH}/assets/${clean}?v=${version}`;
}
