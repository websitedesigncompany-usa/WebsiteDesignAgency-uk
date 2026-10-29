/**
 * Content registry + build orchestration.
 *
 * The build enumerates every URL the site should contain, renders it, and
 * writes it to dist/. The URL inventory is a first-class data structure so
 * that the sitemap, LLMs.txt, internal search index and CMS export are all
 * derived from the same source of truth.
 */

import { COUNTRIES, HOME_COUNTRY, PREFIXED_COUNTRIES, Country, City } from '../data/regions.js';
import { SERVICES, PAGE_SERVICES, SERVICE_BY_SLUG, Service } from '../data/services.js';
import { INDUSTRIES, Industry } from '../data/industries.js';
import { PORTFOLIO, PortfolioProject } from '../data/clients.js';
import { packagesFor } from '../data/packages.js';
import { serviceKeyword, toolKeyword, caseKeyword, industryKeyword } from '../lib/keywords.js';
import { TOOLS } from '../data/tools.js';
import { COMPANY_PAGES, COMPARISONS } from '../render/templates/company.js';
import { GeneratedPost, PostType, REDESIGN_TOPICS, generatePost } from '../content/posts.js';
import { generateCaseStudy, CaseStudy, flagshipCaseStudies } from '../content/case-studies.js';
import { slugify } from '../lib/html.js';
import { url, countryPrefix, locationPrefix, countryHubUrl, cityHubUrl, serviceUrl, resolveStatic } from '../lib/routing.js';

export interface RegistryEntry {
  path: string;
  type: PageType;
  title: string;
  /** Primary keyword for this URL. */
  keyword: string;
  country?: Country;
  city?: City;
  serviceSlug?: string;
  service?: Service;
  toolSlug?: string;
  industry?: Industry;
  post?: GeneratedPost;
  caseStudy?: CaseStudy;
  portfolio?: PortfolioProject;
  /** Search/filter facets used by the client-side search index. */
  excerpt: string;
  updated: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

export type PageType =
  | 'home'
  | 'service'
  | 'country'
  | 'city'
  | 'blog-index'
  | 'blog-post'
  | 'case-index'
  | 'case-study'
  | 'portfolio-index'
  | 'portfolio-item'
  | 'gallery'
  | 'industry'
  | 'industries-index'
  | 'services-index'
  | 'packages'
  | 'about'
  | 'contact'
  | 'free-audit'
  | 'faq'
  | 'legal'
  | 'locations'
  | 'checkout'
  | 'thank-you'
  | 'search'
  | 'tools-index'
  | 'tool'
  | 'company'
  | 'comparison'
  | 'comparison-index'
  | 'sitemap-index';

export type BuildTier = 'full' | 'cdn' | 'preview';

export interface BuildConfig {
  /**
   * 'full'  — everything: every service in every city.
   * 'cdn'   — sized to fit a free host that caps files per deployment
   *           (Cloudflare Pages / Workers Free = 20,000 files).
   * 'preview' — a small, internally consistent subset for a public review
   *           build. Links to anything outside the subset resolve to the
   *           canonical domain, so a reviewer never hits a 404.
   */
  tier: BuildTier;
  /** Posts generated per location scope. */
  postsPerLocation: number;
  /** Case studies generated per location scope. */
  casesPerLocation: number;
  /** Posts generated per COUNTRY (overrides postsPerLocation for countries). */
  postsPerCountry: number;
  /** Case studies generated per COUNTRY. */
  casesPerCountry: number;
  /** Posts generated per CITY (overrides postsPerLocation for cities). */
  postsPerCity: number;
  /** Case studies generated per CITY. */
  casesPerCity: number;
  /** Generate service×city pages (in addition to service×country). */
  cityServicePages: boolean;
  /** Generate regional blog/case-study indexes. */
  regionalIndexes: boolean;
  /** Services to include in the city matrix (empty = all). */
  cityServiceFilter: string[];
  /** In the 'cdn' tier, publish city tool pages. */
  cityTools: boolean;
  /** In the 'cdn' tier, the services that get a city page. */
  cityServices: string[];
  /** In the 'preview' tier, the countries that are published. */
  previewCountries: string[];
  /** In the 'preview' tier, the cities that are published. */
  previewCities: string[];
}

export const DEFAULT_CONFIG: BuildConfig = {
  tier: 'full',
  postsPerLocation: 3,
  casesPerLocation: 1,
  // The brief asks for 100+ blogs and case studies per region. Country scope
  // is the "region"; city scope is a deeper local cut.
  postsPerCountry: 100,
  casesPerCountry: 20,
  postsPerCity: 10,
  casesPerCity: 3,
  cityServicePages: true,
  regionalIndexes: true,
  cityServiceFilter: [],
  cityTools: true,
  cityServices: [],
  previewCountries: [],
  previewCities: [],
};

/**
 * Services that carry genuine local search intent, so a city page for them
 * is worth publishing. Used by the 'cdn' tier to keep the deployment under
 * a free host's file cap without dropping the pages that earn their place.
 */
export const CORE_CITY_SERVICES = [
  'website-design-services', 'website-development', 'seo-services',
  'local-seo-services', 'ecommerce-website-design', 'google-ads-management',
  'social-media-management', 'google-business-profile-management',
  'website-maintenance', 'wordpress-website-design', 'shopify-website-design',
  'logo-design-services',
];

/**
 * The 'preview' tier: a coherent slice small enough to publish for review.
 * Eight full countries, twelve cities, the twelve services with local intent,
 * and a thin content layer. Everything outside resolves to the canonical
 * domain rather than a 404.
 */
export const PREVIEW_COUNTRIES = ['uk', 'uae', 'pk', 'de'];
export const PREVIEW_CITIES = [
  'london', 'manchester', 'dubai', 'abu-dhabi', 'karachi', 'lahore', 'berlin', 'munich',
];
const PREVIEW_CITY_SERVICES = [
  'website-design-services', 'seo-services', 'local-seo-services',
  'ecommerce-website-design', 'google-ads-management', 'website-development',
];
const PREVIEW_TIER = {
  postsPerLocation: 3,
  casesPerLocation: 1,
  postsPerCountry: 15,
  casesPerCountry: 3,
  postsPerCity: 2,
  casesPerCity: 1,
  cityTools: false,
  cityServices: PREVIEW_CITY_SERVICES,
  previewCountries: PREVIEW_COUNTRIES,
  previewCities: PREVIEW_CITIES,
};

/** The 'cdn' tier's depth. Chosen so the whole site lands under 20,000 files. */
const CDN_TIER = {
  postsPerCountry: 50,
  casesPerCountry: 10,
  postsPerCity: 3,
  casesPerCity: 1,
  cityTools: false,
  cityServices: CORE_CITY_SERVICES,
};

export function loadConfig(overrides: Partial<BuildConfig> = {}): BuildConfig {
  // An explicit override beats the environment variable.
  const tier: BuildTier =
    (overrides.tier as BuildTier) || (process.env.BUILD_TIER as BuildTier) || 'full';
  const envPosts = Number(process.env.BUILD_POSTS_PER_LOCATION);
  const envCases = Number(process.env.BUILD_CASES_PER_LOCATION);
  const base: BuildConfig = {
    ...DEFAULT_CONFIG,
    ...(tier === 'cdn' ? CDN_TIER : tier === 'preview' ? PREVIEW_TIER : {}),
    tier,
    ...overrides,
  };
  return {
    ...base,
    postsPerLocation: Number.isFinite(envPosts) && envPosts > 0 ? envPosts : base.postsPerLocation,
    casesPerLocation: Number.isFinite(envCases) && envCases > 0 ? envCases : base.casesPerLocation,
    postsPerCountry: Number(process.env.BUILD_POSTS_PER_COUNTRY) || base.postsPerCountry,
    casesPerCountry: Number(process.env.BUILD_CASES_PER_COUNTRY) || base.casesPerCountry,
    postsPerCity: Number(process.env.BUILD_POSTS_PER_CITY) || base.postsPerCity,
    casesPerCity: Number(process.env.BUILD_CASES_PER_CITY) || base.casesPerCity,
    cityServicePages: process.env.BUILD_CITY_PAGES !== '0',
  };
}

const POST_TYPES: PostType[] = [
  'cost-guide', 'how-to', 'local-guide', 'best-of', 'comparison',
  'mistakes', 'industry-playbook', 'checklist', 'trend-report', 'explainer',
  'seasonal', 'regulatory',
];

const SERVICE_FOR_TYPE: Record<PostType, string[]> = {
  redesign: ['website-redesign', 'rebranding-services', 'logo-and-website-design', 'website-design-services', 'website-development', 'branding-services'],
  'how-to': ['', 'website-development', 'seo-services'],
  'cost-guide': ['', 'seo-services', 'logo-design-services', 'ppc-advertising-services'],
  comparison: ['', 'website-development', 'social-media-marketing'],
  'best-of': ['', 'seo-services', 'branding-services', 'content-marketing-services'],
  mistakes: ['', 'website-development', 'seo-services', 'ecommerce-website-design'],
  'local-guide': ['', 'seo-services', 'local-seo-services', 'logo-design-services'],
  'trend-report': ['seo-geo-aeo-services', 'ai-integration-services', 'website-development'],
  explainer: ['', 'seo-services', 'ui-ux-design', 'conversion-rate-optimization'],
  checklist: ['', 'website-development', 'content-marketing-services', 'website-maintenance'],
  'industry-playbook': ['', 'seo-services', 'ecommerce-website-design', 'ppc-advertising-services'],
  seasonal: ['', 'ecommerce-website-design', 'email-marketing-services'],
  regulatory: ['', 'website-design-services', 'web-security-services', 'seo-services'],
};

/** Service slugs that carry their own product schema on city pages. */
const CITY_SERVICES = SERVICES.filter((s) => s.slug !== '').map((s) => s.slug);

function locPrefix(country: Country, city?: City): string {
  if (city) return country.slug ? `/${country.slug}/${city.slug}` : `/${city.slug}`;
  return country.slug ? `/${country.slug}` : '';
}

// ─────────────────────────────────────────────────────────────────────────────

export function buildRegistry(config: BuildConfig): RegistryEntry[] {
  const out: RegistryEntry[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // ── Home ───────────────────────────────────────────────────────────────────
  out.push({
    path: '/',
    type: 'home',
    title: 'Website Design Company',
    keyword: 'Website Design Company',
    country: HOME_COUNTRY,
    serviceSlug: '',
    service: SERVICE_BY_SLUG[''],
    excerpt: SERVICE_BY_SLUG[''].summary,
    updated: today,
    changefreq: 'weekly',
    priority: 1.0,
  });

  // ── Service pages: US (root) ───────────────────────────────────────────────
  for (const s of PAGE_SERVICES) {
    out.push({
      path: serviceUrl(HOME_COUNTRY, s.slug),
      type: 'service',
      title: s.primaryKeyword,
      keyword: s.primaryKeyword,
      country: HOME_COUNTRY,
      serviceSlug: s.slug,
      service: s,
      excerpt: s.summary,
      updated: today,
      changefreq: 'monthly',
      priority: 0.9,
    });
  }

  // ── Service pages: country scope ───────────────────────────────────────────
  for (const c of PREFIXED_COUNTRIES) {
    if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
    for (const s of PAGE_SERVICES) {
      out.push({
        path: serviceUrl(c, s.slug),
        type: 'service',
        title: `${s.primaryKeyword} in ${c.longName}`,
        keyword: serviceKeyword(s.primaryKeyword, c),
        country: c,
        serviceSlug: s.slug,
        service: s,
        excerpt: s.summary,
        updated: today,
        changefreq: 'monthly',
        priority: 0.8,
      });
    }
  }

  // ── Service pages: city scope ──────────────────────────────────────────────
  if (config.cityServicePages) {
    const allow = new Set(
      config.cityServiceFilter.length
        ? config.cityServiceFilter
        : config.cityServices.length
          ? config.cityServices
          : [],
    );
    const unrestricted = allow.size === 0;
    for (const c of COUNTRIES) {
      for (const city of c.cities) {
        if (config.previewCities.length && !config.previewCities.includes(city.slug)) continue;
        for (const s of PAGE_SERVICES) {
          if (!unrestricted && !allow.has(s.slug)) continue;
          out.push({
            path: serviceUrl(c, s.slug, city),
            type: 'service',
            title: `${s.primaryKeyword} in ${city.name}`,
            keyword: serviceKeyword(s.primaryKeyword, c, city),
            country: c,
            city,
            serviceSlug: s.slug,
            service: s,
            excerpt: s.summary,
            updated: today,
            changefreq: 'monthly',
            priority: 0.7,
          });
        }
      }
    }
  }

  // ── Country + city hubs ────────────────────────────────────────────────────
  for (const c of PREFIXED_COUNTRIES) {
    if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
    out.push({
      path: countryHubUrl(c),
      type: 'country',
      title: `Digital Services in ${c.longName}`,
      keyword: `Web Design Company ${c.longName}`,
      country: c,
      excerpt: c.note,
      updated: today,
      changefreq: 'monthly',
      priority: 0.8,
    });
    for (const city of c.cities) {
      out.push({
        path: cityHubUrl(c, city),
        type: 'city',
        title: `Web Design Company ${city.name}`,
        keyword: `Web Design Company ${city.name}`,
        country: c,
        city,
        excerpt: city.note,
        updated: today,
        changefreq: 'monthly',
        priority: 0.65,
      });
    }
  }
  // US city hubs live under the root prefix
  for (const city of HOME_COUNTRY.cities) {
    if (config.previewCities.length && !config.previewCities.includes(city.slug)) continue;
    out.push({
      path: cityHubUrl(HOME_COUNTRY, city),
      type: 'city',
      title: `Web Design Company ${city.name}`,
      keyword: `Web Design Company ${city.name}`,
      country: HOME_COUNTRY,
      city,
      excerpt: city.note,
      updated: today,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }

  // ── Blog indexes ───────────────────────────────────────────────────────────
  out.push({
    path: url('', 'blog'),
    type: 'blog-index',
    title: 'Blog',
    keyword: 'Digital Marketing Blog',
    country: HOME_COUNTRY,
    excerpt: 'Guides on website design, SEO, content and digital marketing.',
    updated: today,
    changefreq: 'daily',
    priority: 0.8,
  });
  if (config.regionalIndexes) {
    for (const c of PREFIXED_COUNTRIES) {
      out.push({
        path: url('', c.slug, 'blog'),
        type: 'blog-index',
        title: `Blog — ${c.longName}`,
        keyword: `Digital Marketing Blog ${c.longName}`,
        country: c,
        excerpt: `Digital marketing guides for ${c.longName} businesses.`,
        updated: today,
        changefreq: 'daily',
        priority: 0.6,
      });
    }
  }

  // ── Case study indexes ─────────────────────────────────────────────────────
  out.push({
    path: url('', 'case-studies'),
    type: 'case-index',
    title: 'Case Studies',
    keyword: 'Digital Agency Case Studies',
    country: HOME_COUNTRY,
    excerpt: 'Real client projects with measured outcomes.',
    updated: today,
    changefreq: 'monthly',
    priority: 0.8,
  });
  if (config.regionalIndexes) {
    for (const c of PREFIXED_COUNTRIES) {
      out.push({
        path: url('', c.slug, 'case-studies'),
        type: 'case-index',
        title: `Case Studies — ${c.longName}`,
        keyword: `Case Studies ${c.longName}`,
        country: c,
        excerpt: `Client results from ${c.longName}.`,
        updated: today,
        changefreq: 'monthly',
        priority: 0.55,
      });
    }
  }

  // ── Portfolio ──────────────────────────────────────────────────────────────
  out.push({
    path: url('', 'portfolio'),
    type: 'portfolio-index',
    title: 'Portfolio',
    keyword: 'Web Design Portfolio',
    country: HOME_COUNTRY,
    excerpt: 'Selected web design and development projects.',
    updated: today,
    changefreq: 'monthly',
    priority: 0.75,
  });
  for (const p of PORTFOLIO) {
    out.push({
      path: url('', 'portfolio', p.slug),
      type: 'portfolio-item',
      title: p.title,
      keyword: `${p.industry} Web Design Project`,
      country: HOME_COUNTRY,
      portfolio: p,
      excerpt: p.summary,
      updated: today,
      changefreq: 'yearly',
      priority: 0.6,
    });
  }
  if (config.regionalIndexes) {
    for (const c of PREFIXED_COUNTRIES) {
      out.push({
        path: url('', c.slug, 'portfolio'),
        type: 'portfolio-index',
        title: `Portfolio — ${c.longName}`,
        keyword: `Web Design Portfolio ${c.longName}`,
        country: c,
        excerpt: `Selected projects for ${c.longName} clients.`,
        updated: today,
        changefreq: 'monthly',
        priority: 0.5,
      });
    }
  }

  // ── Gallery ────────────────────────────────────────────────────────────────
  out.push({
    path: url('', 'gallery'),
    type: 'gallery',
    title: 'Design Gallery',
    keyword: 'Web Design Gallery',
    country: HOME_COUNTRY,
    excerpt: 'A visual showcase of our design work.',
    updated: today,
    changefreq: 'monthly',
    priority: 0.6,
  });

  // ── HTML sitemap ──────────────────────────────────────────────────────────
  out.push({
    path: url('', 'sitemap'),
    type: 'sitemap-index',
    title: 'Site Map',
    keyword: 'Website Design Company Site Map',
    country: HOME_COUNTRY,
    excerpt: 'A complete human-readable index of every page on this website.',
    updated: today,
    changefreq: 'weekly',
    priority: 0.4,
  });

  // ── Company / resource pages ──────────────────────────────────────────────
  for (const cp of COMPANY_PAGES) {
    out.push({
      path: url('', cp.slug),
      type: 'company',
      title: cp.h1,
      keyword: cp.keyword,
      country: HOME_COUNTRY,
      excerpt: cp.description,
      updated: today,
      changefreq: 'monthly',
      priority: 0.6,
    });
    for (const c of PREFIXED_COUNTRIES) {
      if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
      out.push({
        path: url('', c.slug, cp.slug),
        type: 'company',
        title: `${cp.h1} — ${c.longName}`,
        keyword: `${cp.keyword} ${c.longName}`,
        country: c,
        excerpt: cp.description,
        updated: today,
        changefreq: 'monthly',
        priority: 0.45,
      });
    }
  }

  // ── Comparison pages ──────────────────────────────────────────────────────
  out.push({
    path: url('', 'compare'),
    type: 'comparison-index',
    title: 'Service Comparisons',
    keyword: 'Web Design Service Comparisons',
    country: HOME_COUNTRY,
    excerpt: 'Honest side-by-side comparisons of our services, including when each is the wrong choice.',
    updated: today,
    changefreq: 'monthly',
    priority: 0.6,
  });
  for (const cm of COMPARISONS) {
    out.push({
      path: url('', 'compare', cm.slug),
      type: 'comparison',
      title: cm.h1,
      keyword: cm.keyword,
      country: HOME_COUNTRY,
      excerpt: cm.intro.slice(0, 150),
      updated: today,
      changefreq: 'monthly',
      priority: 0.65,
    });
    for (const c of PREFIXED_COUNTRIES) {
      if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
      out.push({
        path: url('', c.slug, 'compare', cm.slug),
        type: 'comparison',
        title: `${cm.h1} — ${c.longName}`,
        keyword: `${cm.keyword} ${c.longName}`,
        country: c,
        excerpt: cm.intro.slice(0, 150),
        updated: today,
        changefreq: 'monthly',
        priority: 0.5,
      });
    }
  }

  // ── Free tools ────────────────────────────────────────────────────────────
  // Root index + one page per tool, then a clustered regional page per
  // country and per city. This is what gives each tool genuine regional
  // search coverage rather than 14 near-identical root pages.
  out.push({
    path: url('', 'tools'),
    type: 'tools-index',
    title: 'Free Online Tools',
    keyword: 'Free Web Design Tools',
    country: HOME_COUNTRY,
    excerpt: 'Free browser-based tools for content, design, SEO and business — no account, nothing uploaded.',
    updated: today,
    changefreq: 'monthly',
    priority: 0.7,
  });
  for (const t of TOOLS) {
    out.push({
      path: url('', 'tools', t.slug),
      type: 'tool',
      title: t.primaryKeyword,
      keyword: t.primaryKeyword,
      country: HOME_COUNTRY,
      toolSlug: t.slug,
      excerpt: t.summary,
      updated: today,
      changefreq: 'monthly',
      priority: 0.65,
    });
  }
  for (const c of PREFIXED_COUNTRIES) {
    if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
    out.push({
      path: url('', c.slug, 'tools'),
      type: 'tools-index',
      title: `Free Online Tools — ${c.longName}`,
      keyword: `Free Web Design Tools in ${c.longName}`,
      country: c,
      excerpt: `Free browser-based tools for businesses in ${c.longName}.`,
      updated: today,
      changefreq: 'monthly',
      priority: 0.55,
    });
    for (const t of TOOLS) {
      out.push({
        path: url('', c.slug, 'tools', t.slug),
        type: 'tool',
        title: `${t.primaryKeyword} in ${c.longName}`,
        keyword: toolKeyword(t.primaryKeyword, c),
        country: c,
        toolSlug: t.slug,
        excerpt: t.summary,
        updated: today,
        changefreq: 'monthly',
        priority: 0.55,
      });
    }
  }
  for (const c of COUNTRIES) {
    if (!config.cityTools) break;
    for (const city of c.cities) {
      if (config.previewCities.length && !config.previewCities.includes(city.slug)) continue;
      for (const t of TOOLS) {
        out.push({
          path: url(locationPrefix(c, city), 'tools', t.slug),
          type: 'tool',
          title: `${t.primaryKeyword} in ${city.name}`,
          keyword: toolKeyword(t.primaryKeyword, c, city),
          country: c,
          city,
          toolSlug: t.slug,
          excerpt: t.summary,
          updated: today,
          changefreq: 'monthly',
          priority: 0.45,
        });
      }
    }
  }

  // ── Industries ─────────────────────────────────────────────────────────────
  out.push({
    path: url('', 'industries'),
    type: 'industries-index',
    title: 'Industries We Serve',
    keyword: 'Industry Web Design Services',
    country: HOME_COUNTRY,
    excerpt: 'Sector-specific web design and digital marketing.',
    updated: today,
    changefreq: 'monthly',
    priority: 0.7,
  });
  for (const ind of INDUSTRIES) {
    out.push({
      path: url('', 'industries', ind.slug),
      type: 'industry',
      title: `${ind.name} Website Design Services`,
      keyword: `${ind.name} Website Design Services`,
      country: HOME_COUNTRY,
      industry: ind,
      excerpt: ind.context,
      updated: today,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }
  // Country-scoped industry pages — these give regional industry pages real
  // destinations and make city-scoped links resolve to a live page.
  for (const c of PREFIXED_COUNTRIES) {
    if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
    for (const ind of INDUSTRIES) {
      out.push({
        path: url('/', c.slug, 'industries', ind.slug),
        type: 'industry',
        title: `${ind.name} Website Design Services in ${c.longName}`,
        keyword: industryKeyword(ind.name, c),
        country: c,
        industry: ind,
        excerpt: ind.context,
        updated: today,
        changefreq: 'monthly',
        priority: 0.6,
      });
    }
  }

  // ── Static ─────────────────────────────────────────────────────────────────
  const staticPages: { path: string; type: PageType; title: string; keyword: string; excerpt: string }[] = [
    { path: url('', 'services'), type: 'services-index', title: 'All Services', keyword: 'Digital Agency Services', excerpt: 'Our complete service catalogue.' },
    { path: url('', 'packages'), type: 'packages', title: 'Pricing & Packages', keyword: 'Web Design Packages', excerpt: 'Fixed prices for every service.' },
    { path: url('', 'about'), type: 'about', title: 'About Us', keyword: 'About Website Design Company', excerpt: 'Who we are and how we work.' },
    { path: url('', 'contact'), type: 'contact', title: 'Contact', keyword: 'Contact Web Design Company', excerpt: 'Get a fixed quote within one business day.' },
    { path: url('', 'free-audit'), type: 'free-audit', title: 'Free SEO Audit', keyword: 'Free SEO Audit', excerpt: 'A free, detailed audit of your website.' },
    { path: url('', 'faq'), type: 'faq', title: 'FAQs', keyword: 'Web Design FAQs', excerpt: 'Answers to common questions.' },
    { path: url('', 'locations'), type: 'locations', title: 'Service Locations', keyword: 'Web Design Company Locations', excerpt: 'All countries and cities we serve.' },
    { path: '/search/', type: 'search', title: 'Search', keyword: 'Search', excerpt: 'Search services, locations and guides.' },
    { path: '/thank-you/', type: 'thank-you', title: 'Thank You', keyword: 'Order Received', excerpt: 'Your order has been received.' },
    { path: url('', 'privacy-policy'), type: 'legal', title: 'Privacy Policy', keyword: 'Privacy Policy', excerpt: 'How we handle your data.' },
    { path: url('', 'terms-of-service'), type: 'legal', title: 'Terms of Service', keyword: 'Terms of Service', excerpt: 'The terms that govern our services.' },
    { path: url('', 'cookie-policy'), type: 'legal', title: 'Cookie Policy', keyword: 'Cookie Policy', excerpt: 'The cookies we use and why.' },
  ];
  for (const s of staticPages) {
    out.push({ ...s, country: HOME_COUNTRY, updated: today, changefreq: 'monthly', priority: 0.6 });
  }

  // ── Checkout pages (one per SKU) ───────────────────────────────────────────
  const seenSku = new Set<string>();
  // The preview tier publishes a representative slice of checkout pages so the
  // build stays inside the publish size cap.
  const previewSkuLimit = config.tier === 'preview' ? 24 : Infinity;
  let previewSkus = 0;
  for (const s of SERVICES) {
    for (const p of packagesFor(s.slug, s.packageSet)) {
      if (seenSku.has(p.sku)) continue;
      if (previewSkus >= previewSkuLimit) continue;
      seenSku.add(p.sku);
      previewSkus += 1;
      out.push({
        path: url('', 'checkout', p.sku),
        type: 'checkout',
        title: `Checkout — ${p.name}`,
        keyword: `${s.primaryKeyword} ${p.name}`,
        country: HOME_COUNTRY,
        serviceSlug: s.slug,
        service: s,
        excerpt: p.suited,
        updated: today,
        changefreq: 'monthly',
        priority: 0.4,
      });
    }
  }

  // ── Blog posts ─────────────────────────────────────────────────────────────
  const postRegistry = generatePosts(config);
  for (const [p, entry] of postRegistry) {
    out.push({ ...entry, post: p });
  }

  // ── Paginated blog indexes ────────────────────────────────────────────────
  // The blog index paginates, so every page number it links to must exist.
  const PER_PAGE = 12;
  const postsByScope = new Map<string, number>();
  for (const [, entry] of postRegistry) {
    const key = entry.path.includes('/blog/')
      ? entry.path.replace(/\/blog\/[^/]+\/$/, '/blog/')
      : '/blog/';
    postsByScope.set(key, (postsByScope.get(key) || 0) + 1);
  }
  for (const [scopePath, count] of postsByScope) {
    const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));
    if (totalPages <= 1) continue;
    const segs = scopePath.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    const scopeCountry = segs.length > 1 ? COUNTRIES.find((c) => c.slug === segs[0]) : HOME_COUNTRY;
    const scopeCity = segs.length > 2 ? scopeCountry?.cities.find((c) => c.slug === segs[1]) : undefined;
    for (let n = 2; n <= totalPages; n++) {
      const scopeName = segs.length > 1 ? (scopeCountry?.longName || '') : '';
      const paginatedKeyword = scopeName
        ? `Digital Marketing Blog — ${scopeName} Page ${n}`
        : `Digital Marketing Blog Page ${n}`;
      out.push({
        path: `${scopePath}page/${n}/`,
        type: 'blog-index',
        title: paginatedKeyword,
        keyword: paginatedKeyword,
        country: scopeCountry || HOME_COUNTRY,
        city: scopeCity,
        excerpt: `Page ${n} of the blog.`,
        updated: today,
        changefreq: 'weekly',
        priority: 0.3,
      });
    }
  }

  // ── Case studies ───────────────────────────────────────────────────────────
  const caseRegistry = generateCases(config);
  for (const [c, entry] of caseRegistry) {
    out.push({ ...entry, caseStudy: c });
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Post generation
// ─────────────────────────────────────────────────────────────────────────────

type Pair<A, B> = [A, B];

export function generatePosts(config: BuildConfig): Pair<GeneratedPost, Omit<RegistryEntry, 'post'>>[] {
  const out: Pair<GeneratedPost, Omit<RegistryEntry, 'post'>>[] = [];
  const seen = new Set<string>();

  // Scopes: root, each country, each city.
  const scopes: { country: Country; city?: City; prefix: string }[] = [
    { country: HOME_COUNTRY, prefix: '' },
    ...PREFIXED_COUNTRIES
      .filter((c) => !config.previewCountries.length || config.previewCountries.includes(c.slug))
      .map((c) => ({ country: c, prefix: `/${c.slug}` })),
    ...COUNTRIES.flatMap((c) =>
      c.cities
        .filter((city) => !config.previewCities.length || config.previewCities.includes(city.slug))
        .map((city) => ({ country: c, city, prefix: locPrefix(c, city) })),
    ),
  ];

  for (const scope of scopes) {
    const depth = scope.city ? config.postsPerCity : scope.country.slug ? config.postsPerCountry : config.postsPerLocation;
    // Within a scope every post must be a distinct angle on a distinct
    // keyword. The redesign topics take the first slots so each region gets
    // exactly one post per redesign keyword; the remaining slots walk the
    // general archetypes with a service offset that never repeats.
    const redesignCount = Math.min(REDESIGN_TOPICS.length, depth);
    for (let i = 0; i < depth; i++) {
      const isRedesign = i < redesignCount;
      const type: PostType = isRedesign ? 'redesign' : POST_TYPES[i % POST_TYPES.length];
      const slugs = SERVICE_FOR_TYPE[type];
      const service = SERVICE_BY_SLUG[slugs[(i * 3) % slugs.length]] || SERVICE_BY_SLUG[''];
      const industry = INDUSTRIES[(i * 3 + scopes.indexOf(scope)) % INDUSTRIES.length];

      const p = generatePost({
        service,
        country: scope.country,
        city: scope.city,
        industry,
        type,
        angle: isRedesign ? i : undefined,
        seedKey: `${scope.prefix}|${i}|${type}`,
        serviceUrl: serviceUrl(scope.country, service.slug, scope.city),
        blogIndexUrl: resolveStatic(scope.prefix, 'blog'),
      });

      // De-duplicate slugs within a scope.
      // The key MUST be recomputed each iteration — recomputing it only before
      // the loop is an infinite loop the moment two posts share a base slug,
      // which happens as soon as a scope holds more posts than archetypes.
      let slug = p.meta.slug;
      let n = 2;
      while (seen.has(`${scope.prefix}::${slug}`)) {
        slug = `${p.meta.slug}-${n}`;
        n += 1;
      }
      seen.add(`${scope.prefix}::${slug}`);
      p.meta.slug = slug;

      out.push([
        p,
        {
          path: url(scope.prefix, 'blog', slug),
          type: 'blog-post',
          title: p.meta.title,
          keyword: p.meta.primaryKeyword,
          country: scope.country,
          city: scope.city,
          serviceSlug: service.slug,
          excerpt: p.meta.excerpt,
          updated: p.meta.modified,
          changefreq: 'monthly',
          priority: scope.city ? 0.55 : 0.65,
        },
      ]);
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Case study generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateCases(config: BuildConfig): Pair<CaseStudy, Omit<RegistryEntry, 'caseStudy'>>[] {
  const out: Pair<CaseStudy, Omit<RegistryEntry, 'caseStudy'>>[] = [];
  const seen = new Set<string>();

  // Flagship studies at the root, plus one per country.
  for (const cs of flagshipCaseStudies('')) {
    out.push([
      cs,
      {
        path: url('', 'case-studies', cs.slug),
        type: 'case-study',
        title: cs.title,
        keyword: `${cs.industry} Case Study`,
        country: HOME_COUNTRY,
        excerpt: cs.summary,
        updated: cs.date,
        changefreq: 'yearly',
        priority: 0.7,
      },
    ]);
  }
  for (const c of PREFIXED_COUNTRIES) {
    const base = PORTFOLIO[(c.code.charCodeAt(0) + c.code.length) % PORTFOLIO.length];
    const cs = generateCaseStudy({
      industry: INDUSTRIES[(c.code.charCodeAt(1) + c.cities.length) % INDUSTRIES.length],
      country: c,
      service: SERVICES[(c.code.charCodeAt(0)) % SERVICES.length],
      base,
      index: 0,
    });
    cs.slug = `${cs.slug}-${c.slug}`;
    out.push([
      cs,
      {
        path: url('', c.slug, 'case-studies', cs.slug),
        type: 'case-study',
        title: cs.title,
        keyword: `${cs.industry} Case Study ${c.longName}`,
        country: c,
        excerpt: cs.summary,
        updated: cs.date,
        changefreq: 'yearly',
        priority: 0.55,
      },
    ]);
  }

  // Extra country-level studies, so every country carries its own set.
  for (const c of PREFIXED_COUNTRIES) {
    if (config.previewCountries.length && !config.previewCountries.includes(c.slug)) continue;
    for (let i = 0; i < config.casesPerCountry; i++) {
      const base = PORTFOLIO[(c.code.charCodeAt(0) + i * 7) % PORTFOLIO.length];
      const cs = generateCaseStudy({
        industry: INDUSTRIES[(c.code.charCodeAt(1) + i * 3) % INDUSTRIES.length],
        country: c,
        service: SERVICES[(c.code.charCodeAt(0) + i) % SERVICES.length],
        base,
        index: 100 + i,
      });
      let slug = `${cs.slug}-${c.slug}-${i}`;
      let n = 2;
      while (seen.has(slug)) { slug = `${cs.slug}-${c.slug}-${i}-${n}`; n += 1; }
      seen.add(slug);
      cs.slug = slug;
      const caseKw = caseKeyword(cs.industry, c.longName);
      out.push([
        cs,
        {
          path: url('', c.slug, 'case-studies', slug),
          type: 'case-study',
          title: cs.title,
          keyword: caseKw,
          country: c,
          excerpt: cs.summary,
          updated: cs.date,
          changefreq: 'yearly',
          priority: 0.5,
        },
      ]);
    }
  }

  // City-level studies derived from flagship narratives.
  for (const c of COUNTRIES) {
    for (let i = 0; i < Math.min(config.casesPerCity, c.cities.length); i++) {
      const city = c.cities[i % c.cities.length];
      if (config.previewCities.length && !config.previewCities.includes(city.slug)) continue;
      const base = PORTFOLIO[(city.slug.length + i) % PORTFOLIO.length];
      const cs = generateCaseStudy({
        industry: INDUSTRIES[(i + city.slug.length) % INDUSTRIES.length],
        country: c,
        city,
        service: SERVICES[(i + 1) % SERVICES.length],
        base,
        index: i,
      });
      let slug = cs.slug;
      let n = 2;
      while (seen.has(slug)) {
        slug = `${cs.slug}-${n}`;
        n += 1;
      }
      seen.add(slug);
      cs.slug = slug;
      out.push([
        cs,
        {
          path: url('', locPrefix(c, city).replace(/^\//, ''), 'case-studies', slug),
          type: 'case-study',
          title: cs.title,
          keyword: `${cs.industry} Case Study ${city.name}`,
          country: c,
          city,
          excerpt: cs.summary,
          updated: cs.date,
          changefreq: 'yearly',
          priority: 0.5,
        },
      ]);
    }
  }

  return out;
}
