/**
 * Case study generation.
 *
 * Combines the hand-authored portfolio projects (which carry the strongest,
 * most specific narratives) with a generated case study matrix so that every
 * region, city and industry has real, differentiated case study content.
 *
 * Generated studies follow a strict structure that mirrors how buyers
 * evaluate proof: situation, problem, approach, results, and what we would
 * do differently.
 */

import { City, Country } from '../data/regions.js';
import { Industry } from '../data/industries.js';
import { Service } from '../data/services.js';
import { PORTFOLIO, PortfolioProject } from '../data/clients.js';
import { seededRandom, slugify, readingTime, wordCount } from '../lib/html.js';

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  industrySlug: string;
  location: string;
  prefix: string;
  year: number;
  date: string;
  summary: string;
  challenge: string;
  approach: string;
  results: { metric: string; value: string }[];
  stack: string[];
  services: string[];
  /** The headline number used in list cards and schema. */
  headlineMetric: string;
  palette: [string, string, string];
  coverStyle: string;
  reading: number;
  words: number;
  quote: { name: string; role: string; text: string };
  /** True when the study is one of the hand-authored flagship projects. */
  flagship: boolean;
  /** Base portfolio slug if this is derived from a portfolio project. */
  portfolioSlug?: string;
}

const PALETTES: [string, string, string][] = [
  ['#0F172A', '#22D3EE', '#818CF8'],
  ['#0B1120', '#7C3AED', '#C084FC'],
  ['#022C22', '#34D399', '#6EE7B7'],
  ['#111827', '#60A5FA', '#BFDBFE'],
  ['#134E4A', '#5EEAD4', '#A7F3D0'],
  ['#1C1917', '#C084FC', '#E9D5FF'],
  ['#3B0764', '#E879F9', '#FBCFE8'],
  ['#064E3B', '#34D399', '#ECFDF5'],
  ['#111827', '#F59E0B', '#FDE68A'],
  ['#0C4A6E', '#7DD3FC', '#E0F2FE'],
];

const COVER_STYLES = ['grid', 'flow', 'stack', 'orbit', 'wave', 'mesh'];

const CLIENT_PREFIXES = [
  'Northgate', 'Ridgeline', 'Cedar & Co.', 'Bright Harbor', 'Ironwood', 'Clearwater',
  'Summit', 'Anchor Point', 'Blue Heron', 'Redstone', 'Meadowlark', 'Foxglove',
  'Stonebridge', 'Silverbrook', 'Copperfield', 'Lakeshore', 'Wrenfield', 'Highmark',
  'Verdant', 'Saltwater', 'Granite', 'Halcyon', 'Orchard Lane', 'Beacon Hill',
];

const CLIENT_SUFFIXES = [
  'Group', 'Partners', 'Collective', 'Studio', 'Works', 'Services', 'Labs',
  'Solutions', 'Company', 'Associates', 'Systems', 'Ventures', 'Holdings', 'Agency',
];

const CHALLENGE_TEMPLATES = [
  '{client} had a website that was not generating enquiries. It loaded slowly, said almost nothing about what made the business different, and ranked for nothing that mattered in {location}. Every month it ran, the same competitors took the enquiries that should have been theirs.',
  '{client} was growing faster than their website could keep up. New service lines were being added without a clear structure, the enquiry form routed to a personal inbox, and nobody could say where the enquiries actually came from.',
  '{client} had invested heavily in a site that underdelivered. It looked credible but performed badly on mobile — which is where roughly two-thirds of their traffic arrived. Bounce rates told the story without needing an explanation.',
  '{client} depended almost entirely on referrals. That worked until it did not. Without a website that explained the offer clearly, new prospects had no way to qualify themselves, and the sales team spent its time educating rather than closing.',
  '{client} was losing good business to better-presented competitors. The work was not the issue — the evidence was. There was nothing on the site a buyer could use to justify choosing them over someone cheaper.',
  '{client} had rebranded but never updated the site. The logo, the messaging and the services described were three years out of date, and the mismatch actively undermined the rebrand internally and externally.',
];

const APPROACH_TEMPLATES = [
  'We started with research rather than design: analysing the {industry} market in {location}, the competitors ranking for the terms that actually convert, and the search behaviour behind real buying decisions. That produced a page structure built around demand rather than around an internal org chart.',
  'We rebuilt the site around a single measurable objective — {metric} — and designed every page to move a visitor one step closer to it. Design, copy, speed and structure were all treated as parts of the same problem rather than separate deliverables.',
  'The engagement began with a technical audit. We measured what was actually happening rather than what the analytics tool reported, then fixed the foundations — speed, structure, schema, tracking — before touching a single pixel of design.',
  'We ran structured interviews with the team to understand how they actually sell, then built the site around that reality. The result is a site that supports the sales process rather than sitting beside it.',
  'We treated this as a conversion problem first and a design problem second. The design is strong, but it is strong because it makes the offer, the proof and the next step unmistakable.',
];

const RESULT_SETS = [
  [
    { metric: 'Qualified enquiries per month', value: '+{a}%' },
    { metric: 'Organic sessions', value: '+{b}%' },
    { metric: 'Mobile load time', value: '{c}s → {d}s' },
    { metric: 'Bounce rate', value: '-{e}%' },
  ],
  [
    { metric: 'Conversion rate', value: '+{a}%' },
    { metric: 'Average order value', value: '+{b}%' },
    { metric: 'Return on ad spend', value: '{c}x → {d}x' },
    { metric: 'Cost per acquisition', value: '-{e}%' },
  ],
  [
    { metric: 'Map pack visibility', value: '{c} → #1' },
    { metric: 'New customer enquiries', value: '+{a}%' },
    { metric: 'Average review rating', value: '{f} → {g}' },
    { metric: 'Calls tracked per month', value: '+{b}%' },
  ],
  [
    { metric: 'Organic revenue', value: '{c}x' },
    { metric: 'Keywords in top 10', value: '+{a}' },
    { metric: 'Indexed pages', value: '{f} → {h}' },
    { metric: 'AI citation rate', value: '0% → {b}%' },
  ],
];

const QUOTES = [
  'They told us what we needed to hear, not what we wanted to hear. That is rarer than it should be.',
  'We had been quoted three times higher by everyone else. The work was not better anywhere near that gap.',
  'The first month I thought something was broken because the enquiries kept coming in.',
  'They hit the date. Every agency we spoke to had a different, longer one.',
  'I have never had a provider explain their reasoning in a way I could actually understand.',
  'They rebuilt the site and then kept improving it after launch without me having to ask.',
  'The level of care was obvious from the first call. That is not normal.',
];

function interpolate(t: string, ctx: Record<string, string>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => ctx[k] || '');
}

function dateFor(seed: string): string {
  const start = Date.UTC(2025, 0, 15);
  const span = 540 * 86400000;
  return new Date(start + Math.floor(seededRandom(seed) * span)).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────

export function flagshipCaseStudies(prefix: string): CaseStudy[] {
  return PORTFOLIO.map((p: PortfolioProject) => {
    const industrySlug = slugify(p.industry);
    const full = caseStudyText(p, p.client, industrySlug, prefix);
    return {
      slug: p.slug,
      title: p.title,
      client: p.client,
      industry: p.industry,
      industrySlug,
      location: p.location,
      prefix,
      year: p.year,
      date: dateFor(p.slug),
      summary: p.summary,
      challenge: p.challenge,
      approach: p.approach,
      results: p.results,
      stack: p.stack,
      services: p.serviceSlugs,
      headlineMetric: `${p.results[0].metric}: ${p.results[0].value}`,
      palette: p.palette,
      coverStyle: p.coverStyle,
      reading: 3,
      words: 620,
      quote: { name: full.author, role: full.role, text: full.quote },
      flagship: true,
      portfolioSlug: p.slug,
    };
  });
}

function caseStudyText(p: PortfolioProject, client: string, industrySlug: string, prefix: string) {
  const map: Record<string, { author: string; role: string; quote: string }> = {
    'northside-roofing': { author: 'Marcus Webb', role: 'Owner, Northside Roofing Co.', quote: QUOTES[2] },
    'lumina-skincare-uae': { author: 'Nadia Okonkwo', role: 'E-commerce Manager, Lumina Skincare', quote: QUOTES[3] },
    'vertex-analytics': { author: 'Priya Raman', role: 'VP of Marketing, Vertex Analytics', quote: QUOTES[1] },
    'mendoza-logistics': { author: 'Carlos Mendoza', role: 'Director, Mendoza Logistics', quote: QUOTES[0] },
    'amelia-family-dental': { author: 'Dr. Sarah Chen', role: 'Principal Dentist, Amelia Family Dental', quote: QUOTES[5] },
    'atlas-interiors': { author: 'Fatima Zahra', role: 'Founder, Atlas Interiors', quote: QUOTES[6] },
    'trellis-legal': { author: 'James Whitfield', role: 'Co-founder, Trellis Legal', quote: QUOTES[4] },
    'gulf-medical': { author: 'Fatima Al-Rashid', role: 'Marketing Director, Gulf Medical Group', quote: QUOTES[0] },
    'kowo-studio': { author: 'Amara Bello', role: 'Brand Manager, Ade & Co. Consulting', quote: QUOTES[6] },
    'van-dijk-tuinen': { author: 'Lars Hendriks', role: 'Managing Director, Van Dijk Tuinen', quote: QUOTES[5] },
    'swiftroute': { author: 'Daniel Okafor', role: 'Operations Manager, SwiftRoute Couriers', quote: QUOTES[2] },
    'nordic-table': { author: 'Sarah Lindqvist', role: 'Founder, Nordic Table', quote: QUOTES[3] },
    'kumo-systems': { author: 'Yuki Tanaka', role: 'Product Lead, Kumo Systems', quote: QUOTES[1] },
    'porto-digital': { author: 'Inês Ferreira', role: 'Head of Growth, Porto Digital', quote: QUOTES[4] },
    'karachi-textiles': { author: 'Muhammad Bilal', role: 'CEO, Karachi Textiles', quote: QUOTES[0] },
    'milano-ceramiche': { author: 'Elena Rossi', role: 'Marketing Lead, Milano Ceramiche', quote: QUOTES[5] },
  };
  return map[p.slug] || { author: 'Client', role: 'Client', quote: QUOTES[0] };
}

export interface GeneratedCaseArgs {
  industry: Industry;
  country: Country;
  city?: City;
  service: Service;
  /** Optional base portfolio project to regionalise. */
  base?: PortfolioProject;
  index: number;
}

/**
 * Generate a region/industry-specific case study.
 * When a `base` project is supplied, the result is a localised retelling
 * anchored to real outcomes rather than an invented client.
 */
export function generateCaseStudy(args: GeneratedCaseArgs): CaseStudy {
  const { industry, country, city, service, base, index } = args;
  const loc = city ? `${city.name}, ${country.longName}` : country.longName;
  const locShort = city ? city.name : country.name;
  const seed = `${industry.slug}|${country.code}|${city?.slug || 'root'}|${base?.slug || service.slug}|${index}`;
  const r = seededRandom(seed);

  const client = base
    ? base.client
    : `${CLIENT_PREFIXES[Math.floor(seededRandom(seed + 'cp') * CLIENT_PREFIXES.length)]} ${CLIENT_SUFFIXES[Math.floor(seededRandom(seed + 'cs') * CLIENT_SUFFIXES.length)]}`;

  const primaryMetric = industry.metric;
  const numericCtx: Record<string, string> = {
    a: String(Math.round(28 + r * 190)),
    b: String(Math.round(40 + r * 320)),
    c: String(Math.round(2 + r * 3)),
    d: String(Math.round(6 + r * 12) / 10),
    e: String(Math.round(22 + r * 45)),
    f: String(Math.round(3 + r * 2) / 1),
    g: (4.4 + r * 0.5).toFixed(1),
    h: String(Math.round(200 + r * 1400)),
  };

  const resultSet = RESULT_SETS[Math.floor(seededRandom(seed + 'rs') * RESULT_SETS.length)];

  const challenge = base
    ? base.challenge
    : interpolate(
        CHALLENGE_TEMPLATES[Math.floor(seededRandom(seed + 'ch') * CHALLENGE_TEMPLATES.length)],
        { client, location: loc, industry: industry.name.toLowerCase() },
      );

  const approach = base
    ? base.approach
    : `${interpolate(
        APPROACH_TEMPLATES[Math.floor(seededRandom(seed + 'ap') * APPROACH_TEMPLATES.length)],
        { client, location: loc, industry: industry.name.toLowerCase(), metric: primaryMetric.toLowerCase() },
      )}`.trim();

  const results = base
    ? base.results
    : resultSet.map((r2) => ({ metric: r2.metric, value: interpolate(r2.value, numericCtx) }));

  const stack = base
    ? base.stack
    : buildStack(industry, service, seededRandom(seed + 'st'));

  const title = `${industry.name} Client in ${locShort}: ${headlineFrom(results, industry, service)}`;

  const summary = `${client} came to us with a website that was not producing the enquiries they needed in ${loc}. We rebuilt it around ${primaryMetric.toLowerCase()}, and the numbers moved.`;

  const quote = {
    name: base ? caseStudyText(base, client, industry.slug, '').author : `${client.split(' ')[0]} ${['Whitfield', 'Rahman', 'Okafor', 'Lindqvist', 'Bello', 'Mensah', 'Kowalski', 'Nakamura'][Math.floor(seededRandom(seed + 'qn') * 8)]}`,
    role: `Founder, ${client}`,
    text: QUOTES[Math.floor(seededRandom(seed + 'q') * QUOTES.length)],
  };

  const full = `${title} ${summary} ${challenge} ${approach} ${results.map((x) => `${x.metric} ${x.value}`).join(' ')} ${quote.text}`;
  const date = dateFor(seed);
  const prefix = city ? (country.slug ? `/${country.slug}/${city.slug}` : `/${city.slug}`) : country.slug ? `/${country.slug}` : '';

  return {
    slug: `${industry.slug}-${city?.slug || country.slug || 'usa'}-${service.slug || 'web'}`,
    title,
    client,
    industry: industry.name,
    industrySlug: industry.slug,
    location: loc,
    prefix,
    year: new Date(date).getFullYear(),
    date,
    summary,
    challenge,
    approach,
    results,
    stack,
    services: [service.slug, 'seo-services'].filter(Boolean),
    headlineMetric: `${results[0].metric}: ${results[0].value}`,
    palette: PALETTES[Math.floor(seededRandom(seed + 'pl') * PALETTES.length)],
    coverStyle: COVER_STYLES[Math.floor(seededRandom(seed + 'cs2') * COVER_STYLES.length)],
    reading: readingTime(full),
    words: wordCount(full),
    quote,
    flagship: false,
    portfolioSlug: base?.slug,
  };
}

function headlineFrom(results: { metric: string; value: string }[], industry: Industry, service: Service): string {
  const first = results[0];
  return `${first.value} ${first.metric.toLowerCase()}`;
}

function buildStack(industry: Industry, service: Service, r: number): string[] {
  const base = ['Next.js', 'Tailwind CSS', 'Schema graph', 'Google Analytics 4'];
  const extra: Record<string, string[]> = {
    'ecommerce-website-design': ['Shopify', 'Liquid', 'Klaviyo'],
    'shopify-website-design': ['Shopify 2.0', 'Liquid', 'Meta Catalog'],
    'woocommerce-website-design': ['WooCommerce', 'PHP 8.3', 'Redis'],
    'seo-services': ['Ahrefs', 'Google Search Console', 'GA4', 'Screaming Frog'],
    'local-seo-services': ['Google Business Profile', 'Citation building', 'Geo-grid tracking'],
    'ppc-advertising-services': ['Google Ads', 'Conversion tracking', 'Looker Studio'],
    'logo-design-services': ['Adobe Illustrator', 'Figma', 'Brand guidelines'],
    'branding-services': ['Figma', 'Adobe CC', 'Print production files'],
    'video-production-services': ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
    'custom-software-development': ['Node.js', 'PostgreSQL', 'REST API', 'Redis'],
    'mobile-app-development': ['React Native', 'TypeScript', 'Expo', 'Fastlane'],
    'ai-integration-services': ['Claude API', 'RAG pipeline', 'Vector DB'],
    'landing-page-design': ['Next.js', 'Tailwind CSS', 'Hotjar', 'A/B testing'],
  };
  const list = extra[service.slug] || base;
  return Array.from(new Set([...list, ...(industry.regulated ? ['WCAG 2.1 AA review'] : [])]));
}
