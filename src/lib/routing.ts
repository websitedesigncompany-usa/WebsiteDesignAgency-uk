/**
 * URL construction and page-type resolution.
 *
 * The United States is the primary market and lives at the site root:
 *   /                              -> home, keyword "Website Design Company"
 *   /logo-design-services/        -> US service page
 * Every other market is prefixed:
 *   /uk/                           -> country hub
 *   /uk/logo-design-services/     -> country service page
 *   /uk/london/logo-design-services/ -> city service page
 */

import { City, Country, COUNTRIES, HOME_COUNTRY, COUNTRY_BY_CODE } from '../data/regions.js';
import { ORIGIN } from '../config/site.js';

/** Ensure a single leading slash and a trailing slash (directory-style URLs). */
export function url(...parts: (string | false | null | undefined)[]): string {
  // Map first (strip leading/trailing slashes), THEN drop empties — filtering
  // before mapping would let a bare '/' through and produce a `//` path.
  const clean = parts
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter((p) => p.length > 0);
  return clean.length ? `/${clean.join('/')}/` : '/';
}

/**
 * Resolve a static section link for an arbitrary location prefix.
 *
 * Static pages (services, packages, about, contact, blog, case studies,
 * portfolio, gallery, FAQ, free audit, industries index) are published at the
 * root and at country level, but not at every city — so `/albany/about/`
 * would 404. This walks the prefix up to the nearest ancestor that exists.
 */
export function resolveStatic(prefix: string, section: string, ...children: string[]): string {
  const segs = prefix.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const bases: string[] = ['/'];
  for (let i = 0; i < segs.length; i++) bases.push(`/${segs.slice(0, i + 1).join('/')}/`);
  for (const base of bases.reverse()) {
    if (STATIC_MATRIX[section]?.has(base)) return url(base, section, ...children);
  }
  return url('', section, ...children);
}

/**
 * Resolve a child page (e.g. an industry detail) for a location prefix,
 * walking up until a prefix that actually publishes it is found.
 */
export function resolveChild(prefix: string, section: string, child: string): string {
  const segs = prefix.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const bases = segs.length ? segs.map((_, i) => `/${segs.slice(0, i + 1).join('/')}/`) : ['/'];
  for (const base of [...bases].reverse()) {
    if (STATIC_MATRIX[section]?.has(base)) return url(base, section, child);
  }
  return url('', section, child);
}

/**
 * Which location prefixes each static section is actually published under.
 * The build registry is the source of truth; this mirrors it so link
 * resolution never points at a URL that was not generated.
 */
const COUNTRY_PREFIXES = COUNTRIES.filter((c) => c.slug).map((c) => `/${c.slug}/`);

const STATIC_MATRIX: Record<string, Set<string>> = {
  // Root-only sections
  services: new Set(['/services/']),
  packages: new Set(['/packages/']),
  about: new Set(['/about/']),
  contact: new Set(['/contact/']),
  'free-audit': new Set(['/free-audit/']),
  faq: new Set(['/faq/']),
  locations: new Set(['/locations/']),
  gallery: new Set(['/gallery/']),
  'privacy-policy': new Set(['/privacy-policy/']),
  'terms-of-service': new Set(['/terms-of-service/']),
  'cookie-policy': new Set(['/cookie-policy/']),
  checkout: new Set(['/checkout/']),
  'thank-you': new Set(['/thank-you/']),
  search: new Set(['/search/']),
  // Root + every country. Entries are LOCATION PREFIXES, not section URLs —
  // resolveStatic tests a base prefix against this set, then appends the section.
  industries: new Set(['/', ...COUNTRY_PREFIXES]),
  blog: new Set(['/', ...COUNTRY_PREFIXES]),
  'case-studies': new Set(['/', ...COUNTRY_PREFIXES]),
  portfolio: new Set(['/', ...COUNTRY_PREFIXES]),
  // Index pages published at the root only.
  compare: new Set(['/']),
  // Company/resource pages: root + every country.
  resources: new Set(['/', ...COUNTRY_PREFIXES]),
  insights: new Set(['/', ...COUNTRY_PREFIXES]),
  'start-a-project': new Set(['/', ...COUNTRY_PREFIXES]),
  'request-quote': new Set(['/', ...COUNTRY_PREFIXES]),
  press: new Set(['/', ...COUNTRY_PREFIXES]),
  methodology: new Set(['/', ...COUNTRY_PREFIXES]),
  sustainability: new Set(['/', ...COUNTRY_PREFIXES]),
  newsletter: new Set(['/', ...COUNTRY_PREFIXES]),
  onboarding: new Set(['/', ...COUNTRY_PREFIXES]),
  tools: new Set(['/', ...COUNTRY_PREFIXES]),
  sitemap: new Set(['/']),
};

export function absUrl(path: string): string {
  return `${ORIGIN}${path}`;
}

// ── Core page URLs ───────────────────────────────────────────────────────────

export function homeUrl(): string {
  return '/';
}

export function servicesIndexUrl(prefix = ''): string {
  return url(prefix, 'services');
}

export function packagesIndexUrl(prefix = ''): string {
  return url(prefix, 'packages');
}

export function aboutUrl(prefix = ''): string {
  return url(prefix, 'about');
}

export function contactUrl(prefix = ''): string {
  return url(prefix, 'contact');
}

export function faqIndexUrl(prefix = ''): string {
  return url(prefix, 'faq');
}

export function privacyUrl(prefix = ''): string {
  return url(prefix, 'privacy-policy');
}

export function termsUrl(prefix = ''): string {
  return url(prefix, 'terms-of-service');
}

export function cookiesUrl(prefix = ''): string {
  return url(prefix, 'cookie-policy');
}

export function blogIndexUrl(prefix = ''): string {
  return url(prefix, 'blog');
}

export function blogPostUrl(prefix: string, slug: string): string {
  return url(prefix, 'blog', slug);
}

export function caseStudiesUrl(prefix = ''): string {
  return url(prefix, 'case-studies');
}

export function caseStudyUrl(prefix: string, slug: string): string {
  return url(prefix, 'case-studies', slug);
}

export function portfolioUrl(prefix = ''): string {
  return url(prefix, 'portfolio');
}

export function portfolioItemUrl(prefix: string, slug: string): string {
  return url(prefix, 'portfolio', slug);
}

export function galleryUrl(prefix = ''): string {
  return url(prefix, 'gallery');
}

export function industriesUrl(prefix = ''): string {
  return url(prefix, 'industries');
}

export function industryUrl(prefix: string, slug: string): string {
  return url(prefix, 'industries', slug);
}

export function checkoutUrl(sku: string, prefix = ''): string {
  return url(prefix, 'checkout', sku);
}

export function orderSuccessUrl(orderId: string, prefix = ''): string {
  return url(prefix, 'order', 'success', orderId);
}

export function freeAuditUrl(prefix = ''): string {
  return url(prefix, 'free-audit');
}

export function searchUrl(): string {
  return '/search/';
}

// ── Region-scoped URLs ───────────────────────────────────────────────────────

/** Path prefix for a country. Empty string for the USA. */
export function countryPrefix(country: Country): string {
  return country.slug ? `/${country.slug}` : '';
}

/** Path prefix for a country + optional city. */
export function locationPrefix(country: Country, city?: City): string {
  if (!city) return countryPrefix(country);
  if (!country.slug) return `/${city.slug}`;
  return `/${country.slug}/${city.slug}`;
}

/** Directory-style URLs, consistent with every other link on the site. */
export function countryHubUrl(country: Country): string {
  return url('/', country.slug);
}

export function cityHubUrl(country: Country, city: City): string {
  return url(locationPrefix(country, city));
}

/**
 * Service page URL.
 * `serviceSlug` of '' resolves to the home service, which only exists at the root.
 */
export function serviceUrl(country: Country, serviceSlug: string, city?: City): string {
  // The home service IS the homepage for the USA and has no separate page.
  if (serviceSlug === '') {
    return country.slug || city ? url(locationPrefix(country, city)) : '/';
  }
  return url(locationPrefix(country, city), serviceSlug);
}

/** Path prefix for a country + optional city, as a directory URL. */
export function locationPrefixUrl(country: Country, city?: City): string {
  return url(locationPrefix(country, city));
}

// ── Localisation helpers ─────────────────────────────────────────────────────

/** Human label for a location, e.g. "London, United Kingdom" or "Houston, Texas". */
export function locationLabel(country: Country, city?: City): string {
  if (city) return `${city.name}, ${country.longName}`;
  return country.longName;
}

/** Short label used in tight UI, e.g. "London" or "United Kingdom". */
export function shortLabel(country: Country, city?: City): string {
  return city ? city.name : country.name;
}

/** "in Houston, Texas" style prepositional phrase. */
export function inPhrase(country: Country, city?: City): string {
  if (city) return `in ${city.name}, ${city.region === country.longName ? country.longName : city.region}`;
  return country.slug ? `in ${country.longName}` : 'in the United States';
}

/** Region keyword used as the supporting keyword on every page. */
export function supportKeyword(country: Country, city?: City): string {
  return city ? `${city.name} ${country.longName}` : country.longName;
}

/** hreflang code for a location. */
export function hreflangFor(country: Country): string {
  return country.code === 'US' ? 'en-us' : country.code.toLowerCase();
}

// ── Breadcrumbs ──────────────────────────────────────────────────────────────

export interface Crumb {
  name: string;
  url: string;
}

export function buildCrumbs(
  path: Crumb[],
  current: { name: string; url: string },
  parentPageName?: string,
): { name: string; url: string; type?: string }[] {
  return [...path, { name: parentPageName || 'Home', url: '/' }, { name: current.name, url: current.url }];
}

// ── Reserved top-level segments that are NOT country codes ───────────────────

export const RESERVED_SEGMENTS = new Set([
  'admin', 'api', 'assets', 'blog', 'search', 'contact', 'about', 'services',
  'packages', 'case-studies', 'portfolio', 'gallery', 'industries', 'checkout',
  'order', 'privacy-policy', 'terms-of-service', 'cookie-policy', 'faq',
  'free-audit', 'reviews', 'sitemap.xml', 'robots.txt', 'llms.txt', 'llms-detailed.txt',
  'humans.txt', 'security.txt', 'manifest.webmanifest', 'sitemap', 'thank-you',
  'best-seo-services', 'coupons', 'deals', 'videos', 'images', 'files', 'downloads',
  'wp-admin', 'wp-content', 'feed', 'rss', 'news', 'events', 'careers', 'team',
  'pricing', 'payment', 'checkout-success', 'account', 'login', 'logout',
]);

/** Heuristic: does this first path segment look like a country code we support? */
export function resolveCountryFromSegment(segment: string): Country | null {
  const key = segment.toLowerCase();
  return (
    Object.values(COUNTRY_BY_CODE).find((c) => c.slug === key) || null
  );
}


/**
 * Services that keep a city-level page in the 'cdn' tier — the ones with
 * genuine local search intent. Every other service resolves its city link
 * up to the country (or root) so no page ever links to something that was
 * not published.
 */
export const CITY_SERVICE_SLUGS = new Set([
  'website-design-services', 'website-development', 'seo-services',
  'local-seo-services', 'ecommerce-website-design', 'google-ads-management',
  'social-media-management', 'google-business-profile-management',
  'website-maintenance', 'wordpress-website-design', 'shopify-website-design',
  'logo-design-services',
]);

/** Is this prefix a city scope rather than a country/root scope? */
function isCityPrefix(prefix: string): { country: string; city: string } | null {
  const segs = prefix.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (!segs.length) return null;
  if (segs.length === 1) {
    // A single segment is a US city (the USA has no country prefix).
    return { country: '', city: segs[0] };
  }
  if (segs.length === 2) return { country: segs[0], city: segs[1] };
  return null;
}

/**
 * Resolve a service link for a location prefix, falling back to the nearest
 * scope where that service page actually exists.
 */
export function resolveServiceLink(prefix: string, slug: string): string {
  if (!slug) return url(prefix);
  const city = isCityPrefix(prefix);
  if (city && !CITY_SERVICE_SLUGS.has(slug)) {
    // Not published for this city — point at the country (or the root).
    return url(city.country ? `/${city.country}` : '', slug);
  }
  return url(prefix, slug);
}

/**
 * Resolve a tool link for a location prefix. City-level tool pages are only
 * published in the 'full' tier, so a city link falls back to the country.
 */
export function resolveToolLink(prefix: string, slug: string): string {
  const city = isCityPrefix(prefix);
  if (city) return url(city.country ? `/${city.country}` : '', 'tools', slug);
  return url(prefix, 'tools', slug);
}
