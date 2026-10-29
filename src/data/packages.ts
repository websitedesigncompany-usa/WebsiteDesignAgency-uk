/**
 * Package catalogue.
 *
 * Three package families:
 *   1. STANDARD — one ladder reused across every service (per the brief).
 *   2. SEO       — the retainers from the client-supplied package document.
 *   3. PPC       — likewise.
 *
 * Services are simultaneously products, so every package is a sellable
 * `Product` with an `Offer`, a `priceSpecification` and SKU.
 *
 * Regional pricing: all base prices are USD. `convert()` maps a USD amount
 * into a local currency using the country FX rate, then rounds to a
 * commercially sensible figure per currency.
 */

import { Country } from './regions.js';

export type BillingPeriod = 'one-time' | 'monthly' | 'quarterly' | 'yearly';

export interface Tier {
  key: string;
  name: string;
  /** Base price in USD. */
  usd: number;
  period: BillingPeriod;
  /** Who this tier is built for. */
  suited: string;
  /** Deliverable bullets. Rendered as the package feature list. */
  features: string[];
  /** Delivery window. */
  eta: string;
  /** Most-visible badge label. */
  badge?: string;
  /** Pages / units allowed. */
  units?: string;
}

export interface Package {
  id: string;
  serviceSlug: string;
  name: string;
  usd: number;
  period: BillingPeriod;
  suited: string;
  features: string[];
  eta: string;
  badge?: string;
  units?: string;
  /** SKU used in Product schema and the checkout flow. */
  sku: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STANDARD LADDER — identical structure for every non-SEO/PPC service.
//    Per-service price scaling keeps the ladder honest for high-effort work.
// ─────────────────────────────────────────────────────────────────────────────

export const STANDARD_TIERS: Tier[] = [
  {
    key: 'starter',
    name: 'Starter',
    usd: 199,
    period: 'one-time',
    suited: 'New businesses, solo professionals and anyone who needs a credible online presence fast.',
    units: 'Up to 5 pages',
    eta: '5–7 days',
    features: [
      'Custom responsive design (no template resale)',
      'Up to 5 unique pages',
      'Mobile, tablet and desktop layouts',
      'Contact form with spam protection',
      'Basic on-page SEO setup',
      'Google Analytics and Search Console',
      'SSL certificate and security headers',
      'Google Business Profile setup',
      '1 round of concept concepts + unlimited revisions',
      '30 days of post-launch support',
    ],
  },
  {
    key: 'business',
    name: 'Business',
    usd: 399,
    period: 'one-time',
    suited: 'Growing businesses that need to look credible and generate real enquiries.',
    badge: 'Most Popular',
    units: 'Up to 10 pages',
    eta: '7–12 days',
    features: [
      'Everything in Starter, plus:',
      'Up to 10 unique pages',
      'Custom design system and component library',
      'CMS integration so you can edit content',
      'Blog or news section setup',
      'Full on-page SEO (meta, headings, schema, internal links)',
      'Image optimisation and WebP conversion',
      'Advanced contact and enquiry forms',
      'Social media meta and share images',
      'Speed optimisation and Core Web Vitals pass',
      '60 days of post-launch support',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    usd: 799,
    period: 'one-time',
    suited: 'Established businesses competing for competitive search terms.',
    units: 'Up to 20 pages',
    eta: '12–18 days',
    features: [
      'Everything in Business, plus:',
      'Up to 20 unique pages',
      'Advanced CMS with custom content types',
      'Blog strategy and initial content structure',
      'Complete schema markup (Service, Product, FAQ, Breadcrumb)',
      'Technical SEO foundation (sitemaps, robots, redirects)',
      'Third-party integration (CRM, booking, payments, email)',
      'Conversion-focused layout design',
      'A/B test variants on key pages',
      'Accessibility (WCAG 2.1 AA) compliance pass',
      '90 days of post-launch support',
    ],
  },
  {
    key: 'elite',
    name: 'Elite',
    usd: 1199,
    period: 'one-time',
    suited: 'Brands that need a flagship site and a real competitive moat.',
    units: 'Up to 35 pages',
    eta: '18–25 days',
    features: [
      'Everything in Professional, plus:',
      'Up to 35 unique pages',
      'Full brand-aligned design system',
      'Local SEO and multi-location page framework',
      'Advanced schema graph (Organization, Service, Product, Review)',
      'AI search / GEO optimisation foundation',
      'Advanced motion and interaction design',
      'Custom animations and micro-interactions',
      'Full analytics and conversion event tracking',
      'SEO keyword strategy for the full site architecture',
      'Monthly performance report for 6 months',
      'Priority support with 4-hour response',
    ],
  },
  {
    key: 'advanced',
    name: 'Advanced',
    usd: 1999,
    period: 'one-time',
    suited: 'E-commerce, portals and anything with real complexity behind it.',
    units: 'Up to 50 pages + store',
    eta: '25–40 days',
    features: [
      'Everything in Elite, plus:',
      'Up to 50 unique pages',
      'E-commerce / catalogue functionality',
      'Product, cart and checkout experience design',
      'Payment gateway and tax configuration',
      'Inventory and order management setup',
      'Email automation and abandoned cart flows',
      'Custom API and third-party integrations',
      'Dedicated project manager',
      'Weekly progress reporting',
      '6 months of priority support and iteration',
    ],
  },
  {
    key: 'custom',
    name: 'Custom / Enterprise',
    usd: 3999,
    period: 'one-time',
    suited: 'Complex applications, multi-brand groups and enterprise platforms.',
    units: 'Scoped individually',
    eta: '6–16 weeks',
    features: [
      'Everything in Advanced, plus:',
      'Unlimited pages and templates',
      'Custom web application development',
      'Headless CMS or custom backend architecture',
      'Multi-language and multi-region architecture',
      'Enterprise security and compliance requirements',
      'Custom integrations (ERP, CRM, internal systems)',
      'Load testing and performance engineering',
      'Dedicated strategy, design and engineering pod',
      'Fortnightly executive reporting',
      '12 months of priority support and roadmap sessions',
    ],
  },
];

/**
 * Per-service price scaling.
 * Keeps ONE package ladder across all services (per the brief) while keeping
 * prices honest — a custom software build is not the same effort as a logo.
 * Value is a multiplier applied to each base tier price.
 */
export const SERVICE_PRICE_SCALE: Record<string, number> = {
  '': 1,
  'website-design-services': 1,
  'website-development': 1.5,
  'wordpress-website-design': 1,
  'ecommerce-website-design': 1.5,
  'shopify-website-design': 1.75,
  'woocommerce-website-design': 1.5,
  'landing-page-design': 0.5,
  '3d-website-design': 2.5,
  'website-maintenance': 0.3,
  'web-hosting-services': 0.15,
  'logo-design-services': 1,
  '3d-logo-design': 1.5,
  'branding-services': 2,
  'print-design-services': 0.5,
  'seo-services': 0.5,
  'local-seo-services': 0.5,
  'ecommerce-seo-services': 0.75,
  'technical-seo-services': 0.75,
  'seo-geo-aeo-services': 0.75,
  'link-building-services': 0.75,
  'off-page-seo-services': 0.75,
  'seo-audit-services': 0.75,
  'core-web-vitals-optimization': 1,
  'google-business-profile-management': 0.5,
  'reputation-management': 0.5,
  'app-store-optimization': 0.75,
  'ppc-advertising-services': 0.75,
  'google-ads-management': 1,
  'meta-ads-management': 0.75,
  'content-marketing-services': 1.25,
  'content-writing-services': 0.75,
  'seo-content-writing-services': 0.75,
  'blog-writing-services': 1.25,
  'copywriting-services': 0.75,
  'ebook-design-services': 0.75,
  'graphic-design-services': 0.5,
  'social-media-marketing': 1.5,
  'social-media-management': 1.5,
  'email-marketing-services': 1,
  'marketing-automation-services': 2,
  'influencer-marketing-services': 2,
  'video-production-services': 1.25,
  'video-editing-services': 0.5,
  'video-animation-services': 2,
  'motion-graphics-animation': 1.5,
  'explainer-video-services': 1.75,
  'podcast-editing-services': 0.5,
  'audio-production-services': 0.75,
  'conversion-rate-optimization': 1.25,
  'analytics-setup-services': 1,
  'web-analytics-consulting': 1.5,
  'ui-ux-design': 1.5,
  'mobile-app-development': 5,
  'custom-software-development': 5,
  'ai-integration-services': 3.5,
  'chatbot-development': 2.5,
  'public-relations-services': 2.5,
  'crm-integration-services': 2,
  'web-security-services': 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// SIGNATURE PACKAGES
//
// Named, individually purchasable offers that sit alongside the standard
// ladder. These are the entry points a buyer actually lands on:
// a $99 single-page site, a logo-plus-site bundle, and the redesign family.
//
// Every one is priced in USD and converted to the local currency at build
// time, so they are available in every region at a local price.
// ─────────────────────────────────────────────────────────────────────────────

export const SIGNATURE_PACKAGES: Tier[] = [
  {
    key: 'landing-page',
    name: 'Landing Page',
    usd: 99,
    period: 'one-time',
    units: '1 page',
    eta: '3–5 days',
    suited: 'A single, focused page for one offer — a campaign, a new service line, an event or a local promotion.',
    features: [
      'One custom, conversion-focused page (not a template)',
      'Mobile-first responsive design',
      'Copy structure and headline options',
      'Contact or booking form with spam protection',
      'Basic on-page SEO — title, description, headings, schema',
      'SSL, analytics and Search Console setup',
      'Google Business Profile link',
      'Unlimited revisions on the chosen direction',
      '15 days of post-launch support',
    ],
  },
  {
    key: 'logo-and-website',
    name: 'Logo & Website Design',
    usd: 499,
    period: 'one-time',
    units: 'Logo + 5 pages',
    eta: '10–14 days',
    suited: 'A new business that needs a logo and a real website — the two together, designed as one system.',
    features: [
      'Everything in the Landing Page package',
      'Custom logo design with 3 distinct directions',
      'Colour palette and typography system',
      'Up to 5 custom pages including Home, About, Services, Contact',
      'CMS so you can update your own content',
      'Full on-page SEO across every page',
      'Social media profile images',
      'Brand guidelines (core, 8 pages)',
      '30 days of post-launch support',
    ],
  },
  {
    key: 'website-redesign',
    name: 'Website Redesign',
    usd: 449,
    period: 'one-time',
    units: 'Up to 10 pages',
    eta: '10–16 days',
    suited: 'You already have a website that looks dated, loads slowly or no longer reflects the business.',
    features: [
      'Full visual redesign of up to 10 pages',
      'Rebuild on a fast, modern, mobile-first stack',
      'Content kept, rewritten and re-structured for SEO',
      'Redirect map protecting your existing rankings',
      'Core Web Vitals optimisation',
      'Schema and structured data refreshed',
      'Accessibility and contrast audit',
      'Analytics and Search Console reconnected',
      '30 days of post-launch support',
    ],
  },
  {
    key: 'website-redesign-ecommerce',
    name: 'Website Redesign — Ecommerce',
    usd: 899,
    period: 'one-time',
    units: 'Up to 15 pages + store',
    eta: '16–25 days',
    suited: 'A store that converts poorly, loads slowly, or has outgrown the platform it was built on.',
    features: [
      'Everything in the Website Redesign package',
      'Product, category and cart experience redesign',
      'Conversion-focused product page templates',
      'Checkout flow review and friction removal',
      'Product feed and Merchant Centre setup',
      'Up to 15 templates including collection and search',
      'Performance tuning for large catalogues',
      '60 days of post-launch support',
    ],
  },
  {
    key: 'website-redesign-landing-page',
    name: 'Landing Page Redesign',
    usd: 249,
    period: 'one-time',
    units: '1 page',
    eta: '5–8 days',
    suited: 'A page that gets traffic but does not convert — the same offer, rebuilt around a tested structure.',
    features: [
      'Redesign of one existing landing page',
      'Headline, sub-headline and CTA variants for testing',
      'Message-match with the traffic source',
      'Social proof and trust elements restructured',
      'Form friction removed and validated',
      'A/B test setup for the winning variant',
      '15 days of post-launch support',
    ],
  },
  {
    key: 'logo-redesign',
    name: 'Logo & Brand Refresh',
    usd: 299,
    period: 'one-time',
    units: 'Logo refresh',
    eta: '6–10 days',
    suited: 'An existing logo that no longer works — but the brand, name and positioning are staying put.',
    features: [
      'Audit of the current logo against modern usage',
      '2 refined design directions, not a full rebrand',
      'Complete logo suite — primary, secondary, icon, monochrome',
      'Colour and typography refinement',
      'Updated brand guidelines',
      'Social, favicon and print applications',
      '15 days of post-launch support',
    ],
  },
  {
    key: 'rebrand-and-redesign',
    name: 'Rebrand & Website Redesign',
    usd: 899,
    period: 'one-time',
    units: 'Brand + 10 pages',
    eta: '18–28 days',
    suited: 'The business itself has moved on and the identity and site both need to catch up.',
    features: [
      'Everything in the Website Redesign package',
      'Brand refresh — positioning, palette, typography',
      'New or refined logo with full application suite',
      'Up to 10 pages rebuilt around the new positioning',
      'Messaging and copy refresh across every page',
      'Full brand guidelines document',
      'Rollout plan covering print, email and social',
      '60 days of post-launch support',
    ],
  },
  {
    key: 'full-website-redesign',
    name: 'Full Website Redesign',
    usd: 1299,
    period: 'one-time',
    units: 'Up to 25 pages',
    eta: '22–35 days',
    suited: 'A larger site that needs a complete rebuild — structure, design, performance and SEO together.',
    features: [
      'Everything in the Website Redesign package',
      'Up to 25 pages rebuilt with a shared design system',
      'Information architecture and sitemap redesign',
      'Content migration with URL mapping',
      'CMS architecture and editor training',
      'Full technical SEO migration plan',
      'Link building for every redirected URL',
      'Monthly performance report for 3 months',
      '90 days of post-launch support',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2 & 3. SEO + PPC PACKAGES — verbatim from the client package document.
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoPackage {
  id: string;
  name: string;
  usd: number;
  period: BillingPeriod;
  suited: string;
  features: string[];
  eta: string;
  sku: string;
  badge?: string;
  family: 'seo' | 'ppc' | 'geo';
  /** Strike-through "was" price used to show the discount honestly. */
  was?: number;
}

export const SEO_PACKAGES: SeoPackage[] = [
  {
    id: 'seo-booster',
    name: 'SEO Booster',
    usd: 99,
    was: 299,
    period: 'one-time',
    family: 'seo',
    sku: 'SEO-BOOST-001',
    suited: 'Initial SEO setup and foundational optimisation for a new or neglected site.',
    eta: '5–7 days',
    features: [
      'Search engine submissions (Google, Bing, and 3 directories)',
      'Meta title and description optimisation site-wide',
      'Image alt-tag optimisation',
      'XML sitemap creation and optimisation',
      'robots.txt configuration and directive review',
      'Google Analytics 4 integration',
      'Google Search Console setup and verification',
      'Google Maps indexing (where applicable)',
      'Keyword research and on-page opportunity map',
      'Detailed SEO performance report with next-step roadmap',
    ],
  },
  {
    id: 'seo-retainer',
    name: 'SEO Retainer',
    usd: 149,
    was: 499,
    period: 'monthly',
    family: 'seo',
    badge: 'Most Popular',
    sku: 'SEO-RET-002',
    suited: 'Continuous ranking improvement and authority growth month over month.',
    eta: 'Ongoing — first report in 14 days',
    features: [
      'Monthly keyword ranking reports (full SERP coverage)',
      'Ongoing on-page SEO optimisation',
      'Quality link building and digital PR outreach',
      'Technical SEO monitoring and issue alerting',
      'Google Analytics and Search Console tracking & reporting',
      'Sitemap and robots.txt maintenance',
      'Core Web Vitals monitoring and regression alerts',
      'Content strategy guidance and briefs',
      'Local SEO and Google Business Profile optimisation',
      'Monthly strategy call with a named SEO lead',
    ],
  },
  {
    id: 'seo-geo-aeo',
    name: 'SEO GEO AEO SXO Package',
    usd: 249,
    was: 499,
    period: 'one-time',
    family: 'geo',
    sku: 'GEO-AEO-003',
    suited: 'AI search, answer engine and search experience optimisation — built once, compounds forever.',
    eta: '7–14 days',
    features: [
      'Full GEO / AEO / AIO visibility audit across AI assistants',
      'Entity and knowledge-graph optimisation',
      'Answer-shaped content architecture and rewrite plan',
      'Structured data for AI parsing (all relevant schema types)',
      'llms.txt and detailed llms.txt authoring',
      'AI crawler (GPTBot, ClaudeBot, PerplexityBot) configuration',
      'Featured snippet and People Also Ask capture strategy',
      'Search Experience (SXO) optimisation plan',
      'llms.txt + AI citation monitoring dashboard',
      '60-day follow-up report measuring movement',
    ],
  },
  {
    id: 'seo-local',
    name: 'Local SEO Retainer',
    usd: 199,
    was: 599,
    period: 'monthly',
    family: 'seo',
    sku: 'SEO-LOC-004',
    suited: 'Local businesses competing for map-pack and "near me" visibility.',
    eta: 'Ongoing — first geo-grid report in 10 days',
    features: [
      'Google Business Profile full optimisation and posting',
      'Local citation building and NAP consistency cleanup',
      'Review generation system and response management',
      'Geo-grid and map-pack rank tracking',
      'Location and service-area page optimisation',
      'LocalBusiness and Service structured data',
      'Local link acquisition',
      'Call, directions and hours optimisation',
      'Monthly local visibility report',
    ],
  },
  {
    id: 'seo-ecommerce',
    name: 'Ecommerce SEO Retainer',
    usd: 299,
    was: 899,
    period: 'monthly',
    family: 'seo',
    sku: 'SEO-ECO-005',
    suited: 'Online stores that need category, product and crawl architecture handled properly.',
    eta: 'Ongoing — first audit in 10 days',
    features: [
      'Ecommerce technical and architecture audit',
      'Category and product template optimisation',
      'Faceted navigation and crawl budget control',
      'Product, Offer, Review and Merchant schema',
      'Internal linking and breadcrumb architecture',
      'Google Merchant Center feed optimisation',
      'Out-of-stock and seasonal URL strategy',
      'Scalable content strategy for large catalogues',
      'Monthly revenue and ranking reporting',
    ],
  },
];

export const PPC_PACKAGES: SeoPackage[] = [
  {
    id: 'ppc-startup',
    name: 'PPC Startup Support',
    usd: 199,
    was: 299,
    period: 'one-time',
    family: 'ppc',
    sku: 'PPC-START-006',
    suited: 'Launching a properly structured paid search campaign from scratch.',
    eta: '5–7 days',
    features: [
      'PPC account setup and restructure',
      'Keyword and competitor research',
      'Campaign planning and architecture',
      'Ad copy creation and launch',
      'Negative keyword foundation',
      'Conversion tracking setup',
      'Budget and bid strategy recommendation',
      'Launch performance report',
    ],
  },
  {
    id: 'ppc-ongoing',
    name: 'PPC Ongoing Support',
    usd: 249,
    was: 499,
    period: 'monthly',
    family: 'ppc',
    badge: 'Most Popular',
    sku: 'PPC-ONGO-007',
    suited: 'ROI-driven optimisation and performance scaling month over month.',
    eta: 'Ongoing — first optimisation pass in 7 days',
    features: [
      'PPC performance monitoring across all campaigns',
      'Bid and budget optimisation',
      'Conversion tracking and attribution maintenance',
      'Search term analysis and negative keyword management',
      'Ad copy and asset group testing',
      'Landing page performance recommendations',
      'Quality Score and Ad Rank improvement',
      'Monthly spend, ROAS and revenue reporting',
      'Ad spend paid directly to the platform — never marked up',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Currency conversion
// ─────────────────────────────────────────────────────────────────────────────

/** Round to a commercially sensible figure for the given currency. */
export function roundPrice(value: number, currency: string): number {
  if (currency === 'USD') return Math.round(value);
  if (currency === 'JPY') return Math.round(value / 10) * 10;
  if (value < 100) {
    // Sub-100 amounts: round to the nearest 5 for most, 10 for large units.
    if (currency === 'IQD' || currency === 'ARS' || currency === 'COP' || currency === 'CLP' || currency === 'IDR' || currency === 'KRW' || currency === 'VND') {
      return Math.round(value / 100) * 100;
    }
    return Math.round(value / 5) * 5;
  }
  if (value < 500) {
    if (['IDR', 'IQD', 'COP', 'CLP', 'KRW', 'VND', 'PKR', 'NGN', 'ARS'].includes(currency)) {
      return Math.round(value / 50) * 50;
    }
    return Math.round(value / 10) * 10;
  }
  if (value < 5000) {
    if (['IDR', 'IQD', 'COP', 'CLP', 'KRW', 'VND'].includes(currency)) {
      return Math.round(value / 500) * 500;
    }
    return Math.round(value / 50) * 50;
  }
  return Math.round(value / 100) * 100;
}

/** Convert a USD amount into the country's local currency. */
/**
 * Currencies where a price is held FLAT rather than FX-converted.
 *
 * The client asked for the SEO-GEO-AEO-SXO package to be priced at exactly
 * 249 in USD, GBP and EUR — the same number in each — while every other
 * currency is converted from the USD book.
 */
export const FLAT_PRICE_CURRENCIES = new Set(['USD', 'GBP', 'EUR']);

/** Prices that are held flat across the flat-price currencies. */
export const FLAT_PACKAGE_IDS = new Set(['seo-geo-aeo']);

export function convert(usd: number, country: Country, pkgId?: string): number {
  if (pkgId && FLAT_PACKAGE_IDS.has(pkgId) && FLAT_PRICE_CURRENCIES.has(country.currency)) {
    return 249;
  }
  return roundPrice(usd * country.usdRate, country.currency);
}

/** Format a price for display in the country's currency. */
export function formatPrice(usd: number, country: Country, pkgId?: string): string {
  const local = convert(usd, country, pkgId);
  return formatLocal(local, country);
}

const SYMBOL_FIRST = new Set(['$', '£', '€', 'A$', 'CA$', 'S$', 'NZ$', 'R$', 'MX$', 'HK$', 'NZ$', 'C$', 'AED', 'SAR', 'QAR', 'BD', 'KD', 'OMR', 'IQD', '₹', '₩', 'RM', 'Rp', '₱', 'EGP', '₺', 'zł', 'R', 'KSh', '₦', '৳']);

function formatLocal(amount: number, country: Country): string {
  const sym = country.symbol;
  const decimals = amount >= 1000 && !['IQD', 'COP', 'IDR', 'KRW', 'VND', 'PKR', 'NGN', 'ARS', 'CLP'].includes(country.currency) ? 0 : 0;
  const num = amount.toLocaleString('en-US', { maximumFractionDigits: decimals });
  if (SYMBOL_FIRST.has(sym)) return `${sym}${num}`;
  return `${num} ${sym}`;
}

/** Format a price with the currency code for structured data. */
export function priceForSchema(usd: number, country: Country, pkgId?: string): { amount: number; currency: string; display: string } {
  const local = convert(usd, country, pkgId);
  return { amount: local, currency: country.currency, display: formatLocal(local, country) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Package resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Which services carry the signature packages.
 * These are website-shaped offers, so they belong on the web-design family,
 * the brand family and the redesign services — not on, say, an SEO retainer.
 */
const SIGNATURE_SERVICE_ALLOW = new Set([
  '', 'website-design-services', 'website-development', 'landing-page-design',
  'website-redesign', 'logo-design-services', 'logo-and-website-design',
  'branding-services', 'rebranding-services', 'ecommerce-website-design',
  'wordpress-website-design', 'shopify-website-design', 'woocommerce-website-design',
  '3d-website-design', 'white-label-services', 'corporate-website-design',
]);

export function packagesFor(serviceSlug: string, family: 'standard' | 'seo' | 'ppc' | 'signature'): Package[] {
  if (family === 'signature') {
    return SIGNATURE_PACKAGES.map((t) => ({
      id: `sig-${t.key}`,
      serviceSlug,
      name: t.name,
      usd: t.usd,
      period: t.period,
      suited: t.suited,
      features: t.features,
      eta: t.eta,
      units: t.units,
      sku: `SIG-${t.key.toUpperCase().replace(/-/g, '')}`,
    }));
  }
  if (family === 'seo') {
    return SEO_PACKAGES.map((p) => ({
      id: p.id,
      serviceSlug,
      name: p.name,
      usd: p.usd,
      period: p.period,
      suited: p.suited,
      features: p.features,
      eta: p.eta,
      badge: p.badge,
      sku: p.sku,
    }));
  }
  if (family === 'ppc') {
    return PPC_PACKAGES.map((p) => ({
      id: p.id,
      serviceSlug,
      name: p.name,
      usd: p.usd,
      period: p.period,
      suited: p.suited,
      features: p.features,
      eta: p.eta,
      badge: p.badge,
      sku: p.sku,
    }));
  }
  const scale = SERVICE_PRICE_SCALE[serviceSlug] ?? 1;
  const ladder = STANDARD_TIERS.map((t) => ({
    id: `${serviceSlug || 'web'}-${t.key}`,
    serviceSlug,
    name: t.name,
    usd: Math.round(t.usd * scale),
    period: t.period,
    suited: t.suited,
    features: t.features,
    eta: t.eta,
    badge: t.badge,
    units: t.units,
    sku: `${(serviceSlug || 'web').toUpperCase().replace(/-/g, '')}-${t.key.toUpperCase()}`,
  }));

  // The signature packages lead the list on the web-design family.
  if (SIGNATURE_SERVICE_ALLOW.has(serviceSlug)) {
    const sig = packagesFor(serviceSlug, 'signature');
    return [...sig, ...ladder];
  }
  return ladder;
}

/** The cheapest package for a service, used for "from $X" schema and CTAs. */
export function entryPrice(serviceSlug: string, family: 'standard' | 'seo' | 'ppc'): number {
  const pkgs = packagesFor(serviceSlug, family);
  return pkgs.reduce((min, p) => Math.min(min, p.usd), Infinity);
}

/** All packages across all services — used for the /packages/ index and sitemap. */
export function allPackages(): Package[] {
  return [];
}
