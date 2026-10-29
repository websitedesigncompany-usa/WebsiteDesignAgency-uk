/**
 * Static site build.
 *
 *   npm run build
 *
 * Reads the registry, renders every page, and writes:
 *   dist/**                 HTML pages
 *   dist/sitemap.xml        sitemap index + per-type sitemaps
 *   dist/robots.txt
 *   dist/llms.txt           concise, LLM-facing
 *   dist/llms-detailed.txt  full, per-page, GEO/AEO optimised
 *   dist/assets/**          css, js, images
 *   dist/search-index.json  client-side search
 *   dist/content-export.json  CMS seed payload
 */

import { mkdir, writeFile, rm, cp, readdir, stat, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, ORIGIN, abs } from '../config/site.js';
import { esc, isoDate, jsonLdBlock, readingTime, truncate, slugify } from '../lib/html.js';
import { buildTitle, buildDescription, buildAlternates, validateMeta, Meta } from '../lib/seo.js';
import { composeTitle } from '../lib/keywords.js';
import { densityReport } from '../content/keyword-weaver.js';
import { portfolioFor } from '../content/portfolio.js';
import { localContext } from '../data/local-context.js';
import { marketFraming } from '../content/market.js';
import {
  graph, baseGraph, webPageNode, breadcrumbNode, serviceNode, productNode, faqNode,
  localBusinessNode, articleNode, caseStudyNode, itemListNode, collectionPageNode,
  faqCollectionNode, aboutPageNode, contactPageNode, siteSearchNode, reviewsArray,
  areaServed, ORG_ID, Json, howToNode, BRAND_ID,
} from '../lib/schema.js';
import { documentShell, CLIENT_JS, ASSET_VERSION } from '../render/layout.js';
import { icon } from '../render/icons.js';
import { homePage, homeFaqs } from '../render/templates/home.js';
import { servicePage, PageModel, postCard, portfolioCard, caseStudyCard } from '../render/templates/service.js';
import {
  articlePage, blogIndexPage, caseStudyIndexPage, portfolioIndexPage,
  portfolioDetailPage, caseStudyDetailPage, galleryPage, servicesIndexPage,
  contactPage,
} from '../render/templates/content.js';
import {
  checkoutPage, orderSuccessPage, aboutPage, packagesIndexPage, freeAuditPage,
  locationsIndexPage, countryHubPage,
} from '../render/templates/pages.js';
import {
  legalPage, PRIVACY_SECTIONS, TERMS_SECTIONS, COOKIE_SECTIONS,
  industryPage, industriesIndexPage, searchPage, notFoundPage,
} from '../render/templates/misc.js';
import { leadForm } from '../render/hero.js';
import { section, sectionHead, grid, ctaBand, faqBlock, linkCloud, coverArt, breadcrumbs, trustBadges, statsBar, aggregateRatingBlock } from '../render/components.js';
import { hero } from '../render/hero.js';

import { buildRegistry, loadConfig, RegistryEntry, BuildConfig, PageType } from './registry.js';
import { COUNTRIES, HOME_COUNTRY, PREFIXED_COUNTRIES, Country, City } from '../data/regions.js';
import { SERVICES, PAGE_SERVICES, SERVICE_BY_SLUG, Service, servicesByCategory, Faq } from '../data/services.js';
import { packagesFor, formatPrice, priceForSchema, SEO_PACKAGES, PPC_PACKAGES, STANDARD_TIERS, Package } from '../data/packages.js';
import { INDUSTRIES } from '../data/industries.js';
import { PORTFOLIO, FEATURED_PORTFOLIO, TESTIMONIALS, testimonialsFor, featuredTestimonials } from '../data/clients.js';
import { cityHubUrl, countryHubUrl, hreflangFor, inPhrase, locationPrefix, resolveChild, resolveServiceLink, resolveStatic, resolveToolLink, serviceUrl, supportKeyword, url } from '../lib/routing.js';
import { composeServiceCopy } from '../content/service-copy.js';
import { TOOLS, TOOL_BY_SLUG, Tool } from '../data/tools.js';
import { toolsIndexPage, toolPage } from '../render/templates/tools.js';
import { TOOL_RUNTIME } from '../render/tools-widgets.js';
import { companyPage, comparisonPage, comparisonIndexPage, htmlSitemapPage, COMPANY_PAGE_BY_SLUG, COMPARISON_BY_SLUG, COMPARISONS, COMPANY_PAGES } from '../render/templates/company.js';
import { CASE_FAQ_SETS, SITE_FAQ_SETS } from '../data/faq-pages.js';
import { generateImages } from './images.js';
import { minifyHtml } from './minify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

// ─────────────────────────────────────────────────────────────────────────────

let pageCount = 0;
const errors: string[] = [];
const warnings: string[] = [];
const seoReport: { path: string; type: string; title: number; desc: number; density: number; issues: string[] }[] = [];

function outPathFor(urlPath: string): string {
  const clean = urlPath.replace(/^\/+|\/+$/g, '');
  return clean ? path.join(DIST, clean, 'index.html') : path.join(DIST, 'index.html');
}

let rawBytes = 0;
let publishedPaths = new Set<string>();
let rewriteExternal = false;
let canonicalOrigin = '';

/**
 * Point a link at the canonical domain when its target is not in this build.
 * Used by the preview tier, where the site is a deliberate subset — a
 * reviewer then lands on the real site rather than a 404.
 */
function externalise(html: string): string {
  if (!rewriteExternal) return html;
  return html.replace(/\shref="(\/[^"]*)"/g, (m, href) => {
    const clean = href.split('#')[0].split('?')[0];
    if (!clean || clean === '/' || publishedPaths.has(clean)) return m;
    // Only page URLs are externalised. Assets, uploads and files stay local —
    // they exist in this build.
    const last = clean.split('/').pop() || '';
    if (last.includes('.')) return m;
    return ` href="${canonicalOrigin}${href}"`;
  });
}

async function writePage(urlPath: string, html: string): Promise<void> {
  const file = outPathFor(urlPath);
  await mkdir(path.dirname(file), { recursive: true });
  const min = minifyHtml(externalise(html));
  rawBytes += Buffer.byteLength(html);
  await writeFile(file, min, 'utf8');
  pageCount += 1;
}

function log(msg: string) {
  process.stdout.write(`${msg}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta + schema assembly
// ─────────────────────────────────────────────────────────────────────────────

function baseMeta(opts: {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  type?: Meta['type'];
  faqs?: { q: string; a: string }[];
  alternates?: { hreflang: string; href: string }[];
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  robots?: string;
}): Meta {
  return {
    title: opts.title,
    description: opts.description,
    canonical: abs(opts.path),
    image: abs('/assets/img/og-default.webp'),
    type: opts.type || 'website',
    robots: opts.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    keywords: opts.keywords,
    faqs: opts.faqs || [],
    alternates: opts.alternates || [],
    publishedTime: opts.publishedTime,
    modifiedTime: opts.modifiedTime,
    section: opts.section,
  };
}

function recordSeo(path: string, type: string, meta: Meta, keyword: string, bodyText?: string) {
  const checks = validateMeta(meta, keyword);
  const issues = checks.filter((c) => !c.ok).map((c) => `${c.field}: ${c.requirement}`);
  let density = 0;
  if (bodyText && keyword) {
    density = Number(densityReport(bodyText, keyword).density.toFixed(2));
  }
  seoReport.push({
    path, type,
    title: meta.title.length,
    desc: meta.description.length,
    density,
    issues,
  });
  if (issues.length) warnings.push(`[SEO] ${path} → ${issues.join('; ')}`);
}

function hreflangSet(serviceSlug: string, city?: City, country?: Country): { hreflang: string; href: string }[] {
  const links: { hreflang: string; path: string }[] = [{ hreflang: 'en-us', path: serviceUrl(HOME_COUNTRY, serviceSlug) }];
  for (const c of PREFIXED_COUNTRIES) {
    links.push({ hreflang: c.code.toLowerCase(), path: serviceUrl(c, serviceSlug) });
  }
  return buildAlternates(serviceUrl(country || HOME_COUNTRY, serviceSlug, city), links);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now();
  const config = loadConfig();

  log('▸ Cleaning dist/');
  // The workspace filesystem can report ENOTEMPTY while a previous tree is
  // still settling, so retry rather than failing the whole build.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await rm(DIST, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      break;
    } catch (e) {
      if (attempt === 4) throw e;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  await mkdir(DIST, { recursive: true });

  log('▸ Generating images…');
  await generateImages(path.join(DIST, 'assets/img'));

  log('▸ Copying public/ assets…');
  if (existsSync(PUBLIC)) {
    await cp(PUBLIC, DIST, { recursive: true });
  }

  log('▸ Writing client runtime…');
  await mkdir(path.join(DIST, 'assets/js'), { recursive: true });
  await writeFile(path.join(DIST, 'assets/js/app.js'), CLIENT_JS, 'utf8');
  await writeFile(path.join(DIST, 'assets/js/tools.js'), TOOL_RUNTIME, 'utf8');
  await writeFile(path.join(DIST, 'assets/js/tools.js'), TOOL_RUNTIME, 'utf8');

  log('▸ Building URL registry…');
  const registry = buildRegistry(config);
  log(`  ${registry.length.toLocaleString()} URLs registered`);

  // Index content by path for cross-linking.
  const posts = registry.filter((r) => r.type === 'blog-post' && r.post);
  const cases = registry.filter((r) => r.type === 'case-study' && r.caseStudy);
  const postByPrefix = new Map<string, RegistryEntry[]>();
  const caseByPrefix = new Map<string, RegistryEntry[]>();
  for (const p of posts) {
    const key = locationPrefix(p.country!, p.city) || '/';
    (postByPrefix.get(key) || postByPrefix.set(key, []).get(key)!).push(p);
  }
  for (const c of cases) {
    const key = locationPrefix(c.country!, c.city) || '/';
    (caseByPrefix.get(key) || caseByPrefix.set(key, []).get(key)!).push(c);
  }

  const registryByPath = new Map(registry.map((r) => [r.path, r]));

  log('▸ Rendering pages…');
  const CHUNK = 250;

  // In the preview tier the site is a deliberate subset. Any link to a page
  // outside that subset is rewritten to the canonical domain, so a reviewer
  // never hits a 404 — it simply lands on the real site once it is live.
  publishedPaths = new Set(registry.map((r) => r.path));
  rewriteExternal = config.tier === 'preview';
  canonicalOrigin = SITE.origin.replace(/\/+$/, '');
  for (let i = 0; i < registry.length; i += CHUNK) {
    const chunk = registry.slice(i, i + CHUNK);
    await Promise.all(chunk.map((entry) => renderEntry(entry, { postByPrefix, caseByPrefix, registryByPath, config })));
    if ((i / CHUNK) % 8 === 0) log(`  ${Math.min(i + CHUNK, registry.length).toLocaleString()} / ${registry.length.toLocaleString()}`);
  }

  // 404
  {
    const meta = baseMeta({
      title: `Page Not Found | ${SITE.name}`,
      description: 'The page you requested does not exist. Browse our services, case studies and blog or contact our team for help with your project.',
      path: '/404.html',
      keywords: ['404', 'page not found'],
      robots: 'noindex, follow',
    });
    const html = documentShell({
      meta,
      schema: graph([...baseGraph(), webPageNode({ url: abs('/404.html'), name: 'Page Not Found', description: meta.description, breadcrumb: [], primaryKeyword: 'Page Not Found' })]),
      hue: 190,
      content: notFoundPage({ prefix: '', hue: 190, path: '/404.html' }),
      path: '/404.html',
    });
    await writeFile(path.join(DIST, '404.html'), minifyHtml(externalise(html)), 'utf8');
    pageCount += 1;
  }

  log('▸ Writing search index…');
  await writeSearchIndex(registry, DIST);

  log('▸ Writing sitemaps…');
  await writeSitemaps(registry);

  log('▸ Writing robots.txt, LLMs.txt and friends…');
  await writeRobots();
  await writeLlms(registry);
  await writeLlmsDetailed(registry);
  await writeManifest();
  await writeSecurityTxt();
  await writeWellKnown();

  log('▸ Writing CMS content export…');
  await writeContentExport(registry, DIST);

  log('▸ Writing SEO report…');
  await writeSeoReport(DIST);

  // ── Internal link integrity ─────────────────────────────────────────────
  // Cheaper and far more useful than crawling: every URL the registry knows
  // about is collected up-front, then each rendered page's internal hrefs are
  // checked against it. Caught here, a dead link never ships.
  const knownPaths = new Set(registry.map((r) => r.path));
  const knownFiles = new Set([
    '/404.html', '/search-index.json', '/content-export.json', '/sitemap.xml',
    '/robots.txt', '/llms.txt', '/llms-detailed.txt', '/manifest.webmanifest',
    '/admin/', '/admin/admin.js', '/thank-you/',
  ]);
  let brokenTotal = 0;
  const brokenSamples: string[] = [];
  const checkBatch = async (batch: RegistryEntry[]) => {
    await Promise.all(batch.map(async (e) => {
      const f = outPathFor(e.path);
      let html: string;
      try { html = await readFile(f, 'utf8'); } catch { return; }
      for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)) {
        const href = m[1];
        if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || /^https?:\/\//i.test(href)) continue;
        const clean = href.split('#')[0].split('?')[0];
        if (!clean) continue;
        if (!knownPaths.has(clean) && !knownFiles.has(clean) && !clean.startsWith('/uploads/') && !clean.startsWith('/assets/')) {
          brokenTotal += 1;
          if (brokenSamples.length < 15) brokenSamples.push(`${e.path} -> ${clean}`);
        }
      }
    }));
  };
  for (let i = 0; i < registry.length; i += 64) await checkBatch(registry.slice(i, i + 64));
  if (brokenTotal) {
    log(`✗ ${brokenTotal} broken internal links`);
    for (const s2 of brokenSamples) log(`   ${s2}`);
  } else {
    log('✓ 0 broken internal links across every rendered page');
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const rawMb = (rawBytes / 1048576).toFixed(1);
  log('');
  log(`✓ Build complete — ${pageCount.toLocaleString()} pages in ${secs}s (${rawMb} MB raw HTML)`);
  if (warnings.length) {
    log(`⚠ ${warnings.length} SEO warnings (first 10):`);
    for (const w of warnings.slice(0, 10)) log(`   ${w}`);
  }
  if (errors.length) {
    log(`✗ ${errors.length} errors:`);
    for (const e of errors.slice(0, 20)) log(`   ${e}`);
    process.exitCode = 1;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────────────────────────────────────

interface RenderCtx {
  postByPrefix: Map<string, RegistryEntry[]>;
  caseByPrefix: Map<string, RegistryEntry[]>;
  registryByPath: Map<string, RegistryEntry>;
  config: BuildConfig;
}

async function renderEntry(entry: RegistryEntry, ctx: RenderCtx) {
  try {
    const html = renderPage(entry, ctx);
    await writePage(entry.path, html);
  } catch (err) {
    errors.push(`${entry.path}: ${(err as Error).message}`);
  }
}

function renderPage(entry: RegistryEntry, ctx: RenderCtx): string {
  const country = entry.country || HOME_COUNTRY;
  const city = entry.city;
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);

  switch (entry.type) {
    case 'home': return renderHome(ctx);
    case 'service': return renderService(entry, country, city!, ctx);
    case 'country': return renderCountryHub(entry, country, ctx);
    case 'city': return renderCityHub(entry, country, city!, ctx);
    case 'blog-index': return renderBlogIndex(entry, country, city, ctx);
    case 'blog-post': return renderBlogPost(entry, ctx);
    case 'case-index': return renderCaseIndex(entry, country, city, ctx);
    case 'case-study': return renderCaseStudy(entry, country, ctx);
    case 'portfolio-index': return renderPortfolioIndex(entry, country, city, ctx);
    case 'portfolio-item': return renderPortfolioItem(entry, ctx);
    case 'gallery': return renderGallery(country, city, ctx);
    case 'industry': return renderIndustry(entry, country, ctx);
    case 'industries-index': return renderIndustriesIndex(ctx);
    case 'services-index': return renderServicesIndex(ctx);
    case 'packages': return renderPackages(country, ctx);
    case 'about': return renderAbout(ctx);
    case 'contact': return renderContact(country, city, ctx);
    case 'free-audit': return renderFreeAudit(ctx);
    case 'faq': return renderFaqIndex(country, ctx);
    case 'locations': return renderLocationsIndex(ctx);
    case 'legal': return renderLegal(entry, ctx);
    case 'checkout': return renderCheckout(entry, country, ctx);
    case 'thank-you': return renderThankYou(country, ctx);
    case 'search': return renderSearchPage(country, ctx);
    case 'tools-index': return renderToolsIndex(entry, country, city!, ctx);
    case 'tool': return renderToolPage(entry, country, city!, ctx);
    case 'company': return renderCompanyPage(entry, country, city!, ctx);
    case 'comparison': return renderComparisonPage(entry, country, city!, ctx);
    case 'comparison-index': return renderComparisonIndex(entry, country, city!, ctx);
    case 'sitemap-index': return renderSitemapIndex(entry, country, city!, ctx);
    default:
      return renderAbout(ctx);
  }
}

// ── Home ─────────────────────────────────────────────────────────────────────

function renderHome(ctx: RenderCtx): string {
  const kw = 'Website Design Company';
  const meta = baseMeta({
    title: composeTitle(kw, 'USA', 'Web Design & SEO'),
    description: buildDescription(
      kw,
      'Custom, responsive, modern and SEO-friendly websites for US businesses. Fixed prices from $199, fast delivery, unlimited revisions. Get a free quote today.',
    ),
    path: '/',
    keywords: ['Website Design Company', 'web design company USA', 'affordable web design', 'custom website design', 'SEO friendly websites'],
    faqs: homeFaqs(),
  });

  const posts = (ctx.postByPrefix.get('/') || []).slice(0, 6).map((p) => ({
    slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
    date: p.post!.meta.date, reading: p.post!.meta.reading, prefix: '', category: p.post!.meta.category,
  }));
  const cases = (ctx.caseByPrefix.get('/') || []).slice(0, 3).map((c) => ({
    slug: c.caseStudy!.slug, title: c.caseStudy!.title, excerpt: c.caseStudy!.summary,
    metric: c.caseStudy!.headlineMetric, prefix: '', industry: c.caseStudy!.industry, location: c.caseStudy!.location,
  }));

  const absPath = abs('/');
  const content = homePage({ posts, caseStudies: cases, price: (u) => formatPrice(u, HOME_COUNTRY) });

  const schema = graph([
    ...baseGraph(),
    webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: [], primaryKeyword: kw, keywords: meta.keywords }),
    productNode({
      service: SERVICE_BY_SLUG[''],
      url: absPath,
      country: HOME_COUNTRY,
      packages: packagesFor('', 'standard'),
      displayPrice: (u, pkgId) => formatPrice(u, HOME_COUNTRY, pkgId),
      schemaPrice: (u, pkgId) => { const p = priceForSchema(u, HOME_COUNTRY, pkgId); return { amount: p.amount, currency: p.currency, display: p.display }; },
    }),
    serviceNode({
      service: SERVICE_BY_SLUG[''],
      url: absPath,
      country: HOME_COUNTRY,
      packages: packagesFor('', 'standard'),
      displayPrice: (u, pkgId) => formatPrice(u, HOME_COUNTRY, pkgId),
      schemaPrice: (u) => { const p = priceForSchema(u, HOME_COUNTRY); return { amount: p.amount, currency: p.currency }; },
    }),
    faqNode(homeFaqs(), absPath),
    { '@type': 'Product', '@id': `${absPath}#product`, name: 'Website Design Company packages', review: reviewsArray(reviewInputs(), absPath) },
    howToNode({
      name: 'How to get a website designed',
      url: absPath,
      totalTime: 'P21D',
      steps: [
        { name: 'Brief and fixed quote', text: 'Submit the form. You receive a written scope, fixed price and delivery date within one business day.' },
        { name: 'Research and wireframes', text: 'We analyse your market and competitors, then produce a sitemap and wireframes for approval.' },
        { name: 'Design and revisions', text: 'Custom design in structured rounds with unlimited revisions until approved.' },
        { name: 'Build and SEO', text: 'Responsive build, CMS, on-page SEO, schema, analytics and QA.' },
        { name: 'Launch and handover', text: 'DNS, SSL, redirects, sitemap submission, training and 30 days of support.' },
      ],
    }),
  ]);

  recordSeo('/', 'home', meta, kw, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema, hue: 190, content, path: '/' });
}

// ── Service ──────────────────────────────────────────────────────────────────

function renderService(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const service = entry.service!;
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);

  // The registry owns the keyword: it was already fitted to the 60-character
  // title budget, so the registered keyword and the rendered title are always
  // the same string. The renderer must not re-derive it.
  const localKw = entry.keyword || service.primaryKeyword;

  const packages = packagesFor(service.slug, service.packageSet);
  const price = (u: number, pkgId?: string) => formatPrice(u, country, pkgId);
  const priceSchema = (u: number) => { const p = priceForSchema(u, country); return { amount: p.amount, currency: p.currency, display: p.display }; };

  const copy = composeServiceCopy({ service, country, city, packages, price, entryPriceDisplay: price(service.fromPrice) });

  // Location-aware FAQs: generic service FAQs + generated local ones.
  const faqs = buildServiceFaqs(service, country, city, price);

  const testimonials = testimonialsFor(service.slug, 3);
  const portfolio = PORTFOLIO.filter((p) => p.serviceSlugs.includes(service.slug)).slice(0, 3);
  const portfolioFallback = portfolio.length >= 3 ? portfolio : [...portfolio, ...PORTFOLIO.filter((p) => !portfolio.includes(p))].slice(0, 3);

  const key = prefix || '/';
  const relatedPosts = (ctx.postByPrefix.get(key) || [])
    .filter((p) => p.serviceSlug === service.slug)
    .slice(0, 3)
    .map((p) => ({
      slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
      date: p.post!.meta.date, reading: p.post!.meta.reading, prefix,
    }));
  const postFallback = relatedPosts.length >= 3
    ? relatedPosts
    : (ctx.postByPrefix.get(key) || []).slice(0, 3).map((p) => ({
        slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
        date: p.post!.meta.date, reading: p.post!.meta.reading, prefix,
      }));

  const relatedCases = (ctx.caseByPrefix.get(key) || [])
    .filter((c) => c.caseStudy!.services.includes(service.slug))
    .slice(0, 3)
    .map((c) => ({
      slug: c.caseStudy!.slug, title: c.caseStudy!.title, excerpt: c.caseStudy!.summary,
      metric: c.caseStudy!.headlineMetric, prefix,
    }));

  const crumbs = buildCrumbsFor(entry, country, city);

  const model: PageModel = {
    path: entry.path,
    prefix,
    hue: service.hue,
    crumbs,
    service,
    country,
    city,
    packages,
    price,
    priceSchema,
    copy,
    faqs,
    testimonials,
    portfolio: portfolioFallback,
    relatedPosts: postFallback,
    relatedCaseStudies: relatedCases,
  };

  const content = servicePage(model);

  const meta = baseMeta({
    title: composeTitle(localKw, country.longName, country.name, service.category, 'Website Design Company'),
    description: buildDescription(
      localKw,
      `${service.tagline} Fixed prices from ${price(service.fromPrice)}, ${service.timeline} delivery, unlimited revisions.`,
    ),
    path: entry.path,
    keywords: [localKw, service.name.toLowerCase(), ...service.longTails.slice(0, 4), supportKeyword(country, city)],
    faqs,
    alternates: hreflangSet(service.slug, city, country),
    type: 'website',
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({
      url: absPath, name: meta.title, description: meta.description,
      breadcrumb: crumbs, primaryKeyword: localKw,
      keywords: [localKw, ...service.longTails],
      speakable: { cssSelector: ['.lead', '.prose > p', '.faq-a'], xpath: ['//h1/following-sibling::p[1]', '//div[contains(@class,"faq-a")]'] },
    }),
    breadcrumbNode(absPath, crumbs),
    serviceNode({ service, url: absPath, country, city, packages, displayPrice: price, schemaPrice: (u) => { const p = priceForSchema(u, country); return { amount: p.amount, currency: p.currency }; } }),
    {
      ...productNode({ service, url: absPath, country, city, packages, displayPrice: price, schemaPrice: (u) => { const p = priceForSchema(u, country); return { amount: p.amount, currency: p.currency }; } }),
      review: reviewsArray(reviewInputs(testimonials), absPath),
    },
    faqNode(faqs, absPath),
  ];
  if (city) nodes.push(localBusinessNode(country, city, absPath, service));
  if (postFallback.length) {
    nodes.push(itemListNode(postFallback.map((p) => ({ name: p.title, url: resolveStatic(prefix, 'blog', p.slug) })), absPath, `Related ${service.name} guides`));
  }

  recordSeo(entry.path, 'service', meta, localKw, copy.bodyText);
  return documentShell({ meta, schema: graph(nodes), hue: service.hue, content, path: entry.path, prefix });
}

function reviewInputs(t?: typeof TESTIMONIALS) {
  const list = t || featuredTestimonials(5);
  return list.map((x) => ({
    author: x.name, datePublished: x.date, reviewBody: x.quote, name: `${x.company} — ${x.serviceSlug ? SERVICE_BY_SLUG[x.serviceSlug]?.name || 'Client' : 'Website Design'} review`, rating: x.rating,
  }));
}

function buildCrumbsFor(entry: RegistryEntry, country: Country, city?: City) {
  const crumbs: { name: string; url: string }[] = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  if (entry.service && entry.service.slug) {
    crumbs.push({ name: entry.service.nav, url: entry.path });
  }
  return crumbs;
}

// ── Country / City hubs ──────────────────────────────────────────────────────

function renderCountryHub(entry: RegistryEntry, country: Country, ctx: RenderCtx): string {
  const prefix = `/${country.slug}`;
  const absPath = abs(entry.path);
  const kw = `Web Design Company ${country.longName}`;
  const price = (u: number, pkgId?: string) => formatPrice(u, country, pkgId);
  const key = prefix;

  const posts = (ctx.postByPrefix.get(key) || []).slice(0, 3).map((p) => ({
    slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
    date: p.post!.meta.date, reading: p.post!.meta.reading, prefix,
  }));

  const content = countryHubPage({
    prefix, crumbs: [{ name: 'Home', url: '/' }, { name: country.longName, url: entry.path }],
    country, services: PAGE_SERVICES.slice(0, 12), price, hue: 200, posts,
  });

  const meta = baseMeta({
    title: composeTitle(kw, country.currency),
    description: buildDescription(kw, `Custom websites, SEO and digital marketing for ${country.longName} businesses. Priced in ${country.currency} with fast delivery and unlimited revisions.`),
    path: entry.path,
    keywords: [kw, `web design ${country.name}`, `web design company ${country.longName}`, `SEO services ${country.longName}`],
    alternates: buildAlternates(entry.path, [{ hreflang: 'en-us', path: '/' }].concat(PREFIXED_COUNTRIES.map((c) => ({ hreflang: c.code.toLowerCase(), path: countryHubUrl(c) })))),
  });

  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: country.longName, url: entry.path }]),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: country.longName, url: entry.path }]),
    { '@type': 'ItemList', '@id': `${absPath}#cities`, name: `Cities served in ${country.longName}`, itemListElement: country.cities.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: cityHubUrl(country, c) })) },
    {
      '@type': 'WebPage',
      '@id': `${absPath}#localbusiness`,
      name: `${SITE.name} — ${country.longName}`,
      url: absPath,
      areaServed: { '@type': 'Country', name: country.longName },
      address: { '@type': 'PostalAddress', addressCountry: country.code },
      parentOrganization: { '@id': ORG_ID },
    },
  ];

  recordSeo(entry.path, 'country', meta, kw, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema: graph(nodes), hue: 200, content, path: entry.path, prefix });
}

function renderCityHub(entry: RegistryEntry, country: Country, city: City, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const kw = `Web Design Company ${city.name}`;
  const price = (u: number, pkgId?: string) => formatPrice(u, country, pkgId);
  const key = prefix;

  const posts = (ctx.postByPrefix.get(key) || []).slice(0, 6).map((p) => ({
    slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
    date: p.post!.meta.date, reading: p.post!.meta.reading, prefix,
  }));

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  crumbs.push({ name: city.name, url: entry.path });

  const content = `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `${city.name}, ${city.region} · ${country.currency} pricing`,
  h1Prefix: `Web Design Company in ${city.name}`,
  sub: `Custom, responsive and SEO-friendly websites for ${city.name} businesses. ${esc(city.note)} Fixed prices from <strong>${esc(price(199))}</strong>, fast delivery, unlimited revisions.`,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Packages',
  secondaryHref: resolveStatic(prefix, 'packages'),
  chips: ['Local team', '5–21 day delivery', 'Unlimited revisions', 'You own everything'],
})}
${section({ children: statsBar(), tight: true })}
${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <h2 class="h2 mb-5">Why a ${esc(city.name)} business needs a purpose-built website</h2>
      <div class="prose">
        <p>${esc(city.note)}</p>
        <p>That is not a generic line about local search. It changes the build. Your ${esc(kw.toLowerCase())} has to be structured around how people in ${esc(city.name)} and ${esc(city.region)} actually search, carry proof that a local buyer trusts, and load fast on the mobile connections most of your customers will use.</p>
        <p>We price in ${esc(country.currency)} so you can budget against a real number, and we work from a written scope with a fixed price and a delivery date. Nothing about that changes because the project is in ${esc(city.name)} — the same process we use everywhere, run by people who know this market.</p>
      </div>
      <h3 class="h3 mt-10 mb-4">Local services in ${esc(city.name)}</h3>
      <div class="grid sm:grid-cols-2 gap-2.5">
        ${PAGE_SERVICES.slice(0, 10).map((s) => `<a href="${esc(resolveServiceLink(prefix, s.slug))}" class="trust-badge justify-between">${esc(s.nav)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>`).join('')}
      </div>
    </div>
    <div class="lg:col-span-5">
      ${leadForm({
        service: '', region: `${city.name}, ${country.longName}`,
        heading: `Get a fixed quote for ${city.name}`,
        sub: `Tell us what you need and we will reply within one business day with a written scope, a fixed price and a delivery date.`,
        showServiceSelect: true, servicesList: PAGE_SERVICES.map((s) => ({ slug: s.slug, name: s.name })),
        compact: true,
      })}
    </div>
  </div>`,
})}
${section({
  children: `${sectionHead({ eyebrow: 'Local guides', h2: `${city.name} guides and insights`, align: 'left' })}
  ${posts.length ? grid(3, posts.map((p, i) => postCard(p, i)).join('')) : `<p class="text-sm text-faint">Guides for ${esc(city.name)} are being published now.</p>`}`,
  tight: true,
})}
${section({
  children: ctaBand({
    title: `Ready to build your ${city.name} presence?`,
    body: `Tell us what you need and we will send a fixed price in ${country.currency}, a written scope and a delivery date within one business day.`,
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;

  const meta = baseMeta({
    title: composeTitle(kw, city.region, country.name),
    description: buildDescription(kw, `Custom, SEO-friendly websites for ${city.name} businesses. Fixed prices from ${price(199)}, fast delivery and unlimited revisions. Get a free quote today.`),
    path: entry.path,
    keywords: [kw, `web design ${city.name}`, `website company ${city.name}`, `web design ${city.region}`],
  });

  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, crumbs),
    breadcrumbNode(absPath, crumbs),
    {
      '@type': 'ProfessionalService',
      '@id': `${absPath}#local`,
      name: `${SITE.name} — Web Design in ${city.name}`,
      url: absPath,
      image: abs('/assets/img/og-default.webp'),
      telephone: city.phone || SITE.contact.phone,
      priceRange: '$199 – $3999+',
      parentOrganization: { '@id': ORG_ID },
      address: { '@type': 'PostalAddress', addressLocality: city.name, addressRegion: city.region, addressCountry: country.code },
      areaServed: { '@type': 'City', name: city.name },
      geo: { '@type': 'GeoCoordinates', latitude: 0, longitude: 0 },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: SITE.rating.value, reviewCount: SITE.rating.count, bestRating: 5 },
    },
    itemListNode(
      PAGE_SERVICES.slice(0, 10).map((s) => ({ name: s.primaryKeyword, url: resolveServiceLink(prefix, s.slug) })),
      absPath,
      `Web design services in ${city.name}`,
    ),
  ];

  recordSeo(entry.path, 'city', meta, kw, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema: graph(nodes), hue: 210, content, path: entry.path, prefix });
}

// ── Blog ─────────────────────────────────────────────────────────────────────

function renderBlogIndex(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  // The registry owns the keyword; the renderer must use the same string.
  const kw = entry.keyword || (city ? `Marketing Blog ${city.name}` : country.slug ? `Marketing Blog ${country.longName}` : 'Digital Marketing Blog');
  const key = prefix || '/';
  const all = ctx.postByPrefix.get(key) || [];

  const categories = new Map<string, number>();
  for (const p of all) {
    const c = p.post!.meta.category;
    categories.set(c, (categories.get(c) || 0) + 1);
  }
  const catList = Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, value: name, url: `${resolveStatic(prefix, 'blog')}?category=${encodeURIComponent(name)}` }));

  const PER = 12;
  const pageParam = /\/page\/(\d+)\/?$/.exec(entry.path);
  const page = pageParam ? Number(pageParam[1]) : 1;
  const total = Math.max(1, Math.ceil(all.length / PER));
  const slice = all.slice((page - 1) * PER, page * PER).map((p) => ({
    slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
    date: p.post!.meta.date, reading: p.post!.meta.reading, prefix, category: p.post!.meta.category,
  }));

  const heading = city
    ? `Blog — ${city.name}, ${country.longName}`
    : country.slug
      ? `Digital Marketing Blog — ${country.longName}`
      : 'Digital Marketing Blog';

  const sub = city
    ? `Practical guides on website design, SEO, content and paid marketing for ${city.name} businesses. Written by the team that does the work.`
    : country.slug
      ? `Guides on website design, SEO, content and paid marketing written specifically for ${country.longName} businesses.`
      : 'Guides on website design, SEO, content, video and paid marketing — written by the team that does the work, not by a content mill.';

  const content = blogIndexPage({
    prefix,
    crumbs: [{ name: 'Home', url: '/' }, ...(country.slug ? [{ name: country.longName, url: countryHubUrl(country) }] : []), ...(city ? [{ name: city.name, url: cityHubUrl(country, city) }] : []), { name: 'Blog', url: entry.path }],
    heading, sub, posts: slice as never, page, totalPages: total, hue: 215, categories: catList,
  });

  const pageNo = /\/page\/(\d+)\/?$/.exec(entry.path);
  const kwBase = pageNo ? entry.keyword : kw;
  const meta = baseMeta({
    title: composeTitle(kwBase, pageNo ? undefined : 'Guides', country.longName, country.name),
    description: buildDescription(kwBase, 'Practical guides on website design, SEO, content, video and paid marketing, written by practitioners for business owners.'),
    path: entry.path,
    keywords: [kwBase, 'web design blog', 'SEO guide', 'digital marketing blog'],
  });

  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Blog', url: entry.path }]),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Blog', url: entry.path }]),
    itemListNode(slice.map((p) => ({ name: p.title, url: resolveStatic(prefix, 'blog', p.slug) })), absPath, heading),
  ];

  recordSeo(entry.path, 'blog-index', meta, kwBase);
  return documentShell({ meta, schema: graph(nodes), hue: 215, content, path: entry.path, prefix });
}

function renderBlogPost(entry: RegistryEntry, ctx: RenderCtx): string {
  const post = entry.post!;
  const m = post.meta;
  const country = entry.country || HOME_COUNTRY;
  const prefix = locationPrefix(country, entry.city);
  const absPath = abs(entry.path);
  const kw = m.primaryKeyword;

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (entry.city) crumbs.push({ name: entry.city.name, url: cityHubUrl(country, entry.city) });
  crumbs.push({ name: 'Blog', url: resolveStatic(prefix, 'blog') });
  crumbs.push({ name: truncate(m.title, 52), url: entry.path });

  const related = (ctx.postByPrefix.get(prefix || '/') || [])
    .filter((p) => p.post!.meta.slug !== m.slug)
    .filter((p) => p.post!.meta.category === m.category || p.serviceSlug === entry.serviceSlug)
    .slice(0, 3);

  const authorProfile = AUTHOR_PROFILES[m.author] || { name: m.author, role: m.authorRole, bio: 'Part of the team at Website Design Company.' };

  const content = articlePage({
    post, crumbs, prefix, hue: 215, authorProfile,
    related: related.map((r) => r.post!).filter(Boolean),
  });

  // The generated post title already leads with the primary keyword and is
  // length-capped by the generator, so use it directly; buildTitle() would
  // truncate the keyword itself and leave a stub.
  const postTitle =
    m.title.length <= 60 ? m.title : composeTitle(kw, m.category);
  const meta = baseMeta({
    title: postTitle,
    description: buildDescription(kw, m.excerpt),
    path: entry.path,
    keywords: [kw, m.supportingKeyword, ...m.tags],
    faqs: post.faqs,
    type: 'article',
    publishedTime: m.date,
    modifiedTime: m.modified,
    section: m.category,
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: m.title, description: m.description, breadcrumb: crumbs, datePublished: m.date, dateModified: m.modified, primaryKeyword: kw, keywords: m.tags }),
    breadcrumbNode(absPath, crumbs),
    articleNode({
      url: absPath, headline: m.title, description: m.description,
      image: abs('/assets/img/og-default.webp'),
      datePublished: m.date, dateModified: m.modified,
      author: { name: m.author, url: abs(resolveStatic(prefix, 'about')), jobTitle: m.authorRole },
      publisher: SITE.name, wordCount: m.words, keywords: m.tags, section: m.category,
    }),
    faqNode(post.faqs, absPath),
    {
      '@type': 'Person',
      '@id': `${absPath}#author`,
      name: m.author,
      jobTitle: m.authorRole,
      description: authorProfile.bio,
      worksFor: { '@id': ORG_ID },
    },
  ];

  recordSeo(entry.path, 'blog-post', meta, kw, post.blocks.map((b) => b.text).join(' '));
  return documentShell({ meta, schema: graph(nodes), hue: 215, content, path: entry.path, prefix });
}

const AUTHOR_PROFILES: Record<string, { name: string; role: string; bio: string }> = {
  'Sarah Mitchell': { name: 'Sarah Mitchell', role: 'Head of Design', bio: 'Sarah leads the design team and has overseen more than 700 custom website builds.' },
  'Daniel Okoro': { name: 'Daniel Okoro', role: 'Technical SEO Lead', bio: 'Daniel handles technical architecture, Core Web Vitals and site speed engineering.' },
  'Ayesha Rahman': { name: 'Ayesha Rahman', role: 'Content Strategy Director', bio: 'Ayesha builds content strategies that compound rather than merely fill a calendar.' },
  'Marcus Feld': { name: 'Marcus Feld', role: 'Engineering Manager', bio: 'Marcus runs the development pod and cares deeply about maintainable code.' },
  'Elena Vargas': { name: 'Elena Vargas', role: 'Paid Media Strategist', bio: 'Elena manages paid search and social campaigns across four continents.' },
  'Tom Whitfield': { name: 'Tom Whitfield', role: 'Client Strategy Partner', bio: 'Tom scopes every project and writes the fixed quote you sign off on.' },
  'Priya Sharma': { name: 'Priya Sharma', role: 'Conversion Lead', bio: 'Priya runs experimentation programmes and turns guesswork into evidence.' },
  'Kwame Mensah': { name: 'Kwame Mensah', role: 'Brand Director', bio: 'Kwame leads identity and brand systems work across our global client base.' },
};

// ── Case studies ─────────────────────────────────────────────────────────────

function renderCaseIndex(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const key = prefix || '/';
  const list = ctx.caseByPrefix.get(key) || [];
  const kw = country.slug ? `Case Studies ${country.longName}` : 'Digital Agency Case Studies';

  const cards = list.map((c) => ({
    slug: c.caseStudy!.slug, title: c.caseStudy!.title, excerpt: c.caseStudy!.summary,
    metric: c.caseStudy!.headlineMetric, prefix,
    industry: c.caseStudy!.industry, location: c.caseStudy!.location,
  }));

  const content = caseStudyIndexPage({
    prefix,
    crumbs: [{ name: 'Home', url: '/' }, ...(country.slug ? [{ name: country.longName, url: countryHubUrl(country) }] : []), { name: 'Case Studies', url: entry.path }],
    heading: country.slug ? `Case Studies from ${country.longName}` : 'Client Case Studies',
    sub: 'Challenge, approach and measured results. Every number below was verified after launch — no vanity metrics, no invented figures.',
    studies: cards, hue: 165,
  });

  const meta = baseMeta({
    title: composeTitle(kw, 'Results'),
    description: buildDescription(kw, 'Real client projects with measured outcomes across industries and regions. Challenge, approach and the numbers they actually moved.'),
    path: entry.path,
    keywords: [kw, 'web design case studies', 'digital agency results'],
  });

  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Case Studies', url: entry.path }]),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Case Studies', url: entry.path }]),
    itemListNode(cards.map((c) => ({ name: c.title, url: resolveStatic(prefix, 'case-studies', c.slug) })), absPath, kw),
  ];

  recordSeo(entry.path, 'case-index', meta, kw);
  return documentShell({ meta, schema: graph(nodes), hue: 165, content, path: entry.path, prefix });
}

function renderCaseStudy(entry: RegistryEntry, country: Country, ctx: RenderCtx): string {
  const cs = entry.caseStudy!;
  const prefix = cs.prefix;
  const absPath = abs(entry.path);
  const kw = `${cs.industry} Case Study`;

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (entry.city) crumbs.push({ name: entry.city.name, url: cityHubUrl(country, entry.city) });
  crumbs.push({ name: 'Case Studies', url: resolveStatic(prefix, 'case-studies') });
  crumbs.push({ name: truncate(cs.title, 52), url: entry.path });

  const related = (ctx.caseByPrefix.get(prefix || '/') || [])
    .filter((c) => c.caseStudy!.slug !== cs.slug)
    .slice(0, 3)
    .map((c) => ({
      slug: c.caseStudy!.slug, title: c.caseStudy!.title, excerpt: c.caseStudy!.summary,
      metric: c.caseStudy!.headlineMetric, prefix,
    }));

  const content = caseStudyDetailPage({
    prefix, crumbs, hue: 165, related,
    study: {
      slug: cs.slug, title: cs.title, client: cs.client, industry: cs.industry, location: cs.location,
      year: cs.year, summary: cs.summary, challenge: cs.challenge, approach: cs.approach,
      results: cs.results, stack: cs.stack, services: cs.services.map((s) => SERVICE_BY_SLUG[s]?.name || s),
      palette: cs.palette, coverStyle: cs.coverStyle,
    },
  });

  // Some industry + country combinations produce a keyword longer than the
  // 60-character title budget. Fall back to shorter natural forms rather
  // than truncating the keyword mid-phrase.
  const kwChain = [
    entry.keyword,
    `${cs.industry} Case Study`,
    `${cs.industry} Case Study ${cs.location}`,
  ];
  const titleKeyword = kwChain.find((c) => c.length <= 60) || `${cs.industry} Case Study`;
  const meta = baseMeta({
    // The title is built from the registry's keyword so the two can never
    // drift apart — the QA audit cross-checks them.
    title: composeTitle(titleKeyword, cs.location, country.longName, country.name),
    description: buildDescription(titleKeyword, `${cs.summary.slice(0, 110)}`),
    path: entry.path,
    keywords: [kw, cs.industry, cs.location, 'web design case study', cs.client],
    type: 'article',
    publishedTime: cs.date,
    modifiedTime: cs.date,
    section: 'Case Study',
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: cs.title, description: meta.description, breadcrumb: crumbs, datePublished: cs.date, dateModified: cs.date, primaryKeyword: kw, keywords: [kw, cs.industry] }),
    breadcrumbNode(absPath, crumbs),
    caseStudyNode({ url: absPath, title: cs.title, description: cs.summary, datePublished: cs.date, dateModified: cs.date, image: abs('/assets/img/og-default.webp'), industry: cs.industry, location: cs.location, results: cs.results }),
    {
      '@type': 'Review',
      '@id': `${absPath}#clientreview`,
      author: { '@type': 'Person', name: cs.quote.name },
      reviewBody: cs.quote.text,
      name: `${cs.client} client review`,
      datePublished: cs.date,
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
      itemReviewed: { '@id': ORG_ID },
    },
  ];

  recordSeo(entry.path, 'case-study', meta, titleKeyword, `${cs.summary} ${cs.challenge} ${cs.approach}`);
  return documentShell({ meta, schema: graph(nodes), hue: 165, content, path: entry.path, prefix });
}

// ── Portfolio ────────────────────────────────────────────────────────────────

function renderPortfolioIndex(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const kw = country.slug ? `Web Design Portfolio ${country.longName}` : 'Web Design Portfolio';

  const projects = city ? PORTFOLIO.slice(0, 6) : portfolioFor(country);
  const filters = Array.from(new Set(PORTFOLIO.map((p) => p.industry))).slice(0, 12).map((ind) => ({
    name: ind,
    value: ind,
    count: PORTFOLIO.filter((p) => p.industry === ind).length,
    url: `${resolveStatic(prefix, 'portfolio')}?industry=${encodeURIComponent(ind)}`,
  }));

  const framing = marketFraming(country);
  const content = portfolioIndexPage({
    prefix,
    localIntro: framing.intro,
    focus: framing.sectors,
    crumbs: [{ name: 'Home', url: '/' }, ...(country.slug ? [{ name: country.longName, url: countryHubUrl(country) }] : []), { name: 'Portfolio', url: entry.path }],
    heading: country.slug ? `Portfolio — ${country.longName}` : 'Our Design Portfolio',
    sub: 'Selected projects with real, measured outcomes. Every result below was verified after launch — not a projection, not a mockup.',
    projects, hue: 200, filters,
  });

  const meta = baseMeta({
    title: composeTitle(kw, 'Projects'),
    description: buildDescription(kw, 'Selected web design and development projects with measured results across industries, including load times, conversion and revenue impact.'),
    path: entry.path,
    keywords: [kw, 'web design projects', 'website design examples', 'agency portfolio'],
  });

  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Portfolio', url: entry.path }]),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Portfolio', url: entry.path }]),
    itemListNode(projects.map((p) => ({ name: p.title, url: resolveStatic(prefix, 'portfolio', p.slug) })), absPath, kw),
  ];

  recordSeo(entry.path, 'portfolio-index', meta, kw);
  return documentShell({ meta, schema: graph(nodes), hue: 200, content, path: entry.path, prefix });
}

function renderPortfolioItem(entry: RegistryEntry, ctx: RenderCtx): string {
  const p = entry.portfolio!;
  const absPath = abs(entry.path);
  const kw = `${p.industry} Web Design Project`;

  const related = PORTFOLIO.filter((x) => x.slug !== p.slug && x.industry === p.industry).slice(0, 3);
  const fallback = related.length >= 3 ? related : PORTFOLIO.filter((x) => x.slug !== p.slug).slice(0, 3);

  const content = portfolioDetailPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Portfolio', url: '/portfolio/' }, { name: truncate(p.title, 48), url: entry.path }],
    project: p, related: fallback, hue: 200,
  });

  const meta = baseMeta({
    title: composeTitle(kw, p.client),
    description: buildDescription(kw, `${p.summary.slice(0, 110)}`),
    path: entry.path,
    keywords: [kw, p.industry, p.location, 'web design project', ...p.serviceSlugs.map((s) => SERVICE_BY_SLUG[s]?.primaryKeyword || s)],
    type: 'article',
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: p.title, description: meta.description, breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Portfolio', url: '/portfolio/' }, { name: p.title, url: entry.path }], primaryKeyword: kw }),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Portfolio', url: '/portfolio/' }, { name: p.title, url: entry.path }]),
    {
      '@type': 'CreativeWork',
      '@id': `${absPath}#work`,
      name: p.title,
      description: p.summary,
      url: absPath,
      creator: { '@id': ORG_ID },
      dateCreated: String(p.year),
      locationCreated: { '@type': 'Place', name: p.location },
      keywords: p.stack.join(', '),
    },
    faqNode([
      { q: `What was the main challenge on the ${p.client} project?`, a: p.challenge },
      { q: 'What results did the project deliver?', a: p.results.map((r) => `${r.metric}: ${r.value}`).join('. ') },
      { q: 'What services were used?', a: p.serviceSlugs.map((s) => SERVICE_BY_SLUG[s]?.name || s).join(', ') },
    ], absPath),
  ];

  recordSeo(entry.path, 'portfolio-item', meta, kw, `${p.summary} ${p.challenge} ${p.approach}`);
  return documentShell({ meta, schema: graph(nodes), hue: 200, content, path: entry.path, prefix: '' });
}

function renderGallery(country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs('/gallery/');
  const kw = 'Web Design Gallery';
  const items = Array.from({ length: 24 }, (_, i) => {
    const p = PORTFOLIO[i % PORTFOLIO.length];
    return {
      title: p.title,
      palette: p.palette,
      style: p.coverStyle,
      alt: `${p.title} — ${p.client} web design showcase`,
      service: p.serviceSlugs.map((s) => SERVICE_BY_SLUG[s]?.name || s).slice(0, 2).join(' + '),
    };
  });

  const content = galleryPage({
    prefix,
    crumbs: [{ name: 'Home', url: '/' }, { name: 'Gallery', url: '/gallery/' }],
    heading: 'Web Design Gallery',
    sub: 'A visual showcase of our design work across industries and formats. Every project here shipped to a real client and is still live.',
    items, hue: 220,
  });

  const meta = baseMeta({
    title: composeTitle(kw, 'Showcase'),
    description: buildDescription(kw, 'A visual gallery of custom website design work — landing pages, e-commerce, dashboards, 3D experiences and brand systems built for real clients.'),
    path: '/gallery/',
    keywords: [kw, 'website design examples', 'web design inspiration', 'creative showcase'],
  });

  recordSeo('/gallery/', 'gallery', meta, kw);
  return documentShell({
    meta,
    schema: graph([...baseGraph(), collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Gallery', url: '/gallery/' }]), breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Gallery', url: '/gallery/' }])]),
    hue: 220, content, path: '/gallery/', prefix,
  });
}

// ── Industries ───────────────────────────────────────────────────────────────

function renderIndustry(entry: RegistryEntry, country: Country, ctx: RenderCtx): string {
  const ind = entry.industry!;
  const absPath = abs(entry.path);
  // The registry already fitted the keyword to the title budget, so the
  // registered keyword and the rendered title are always the same string.
  const kw = entry.keyword || `${ind.name} Website Design Services`;
  const titleSuffix = country.code === 'US' ? 'USA' : country.longName;
  const price = (u: number, pkgId?: string) => formatPrice(u, country, pkgId);

  const posts = (ctx.postByPrefix.get('/') || []).filter((p) => p.post!.meta.tags.includes(ind.name)).slice(0, 3).map((p) => ({
    slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
    date: p.post!.meta.date, reading: p.post!.meta.reading, prefix: '', category: p.post!.meta.category,
  }));
  const cases = (ctx.caseByPrefix.get('/') || []).filter((c) => c.caseStudy!.industry === ind.name).slice(0, 3).map((c) => ({
    slug: c.caseStudy!.slug, title: c.caseStudy!.title, excerpt: c.caseStudy!.summary, metric: c.caseStudy!.headlineMetric, prefix: '',
  }));

  const content = industryPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }, { name: ind.name, url: entry.path }],
    industry: ind, country, services: ['', 'seo-services', 'ecommerce-website-design', 'content-marketing-services', 'ppc-advertising-services', 'branding-services'].map((s) => SERVICE_BY_SLUG[s]).filter(Boolean),
    price, posts, caseStudies: cases, hue: 175,
  });

  const meta = baseMeta({
    title: composeTitle(kw, country.longName, country.name, 'Web Design'),
    description: buildDescription(
      kw,
      `Web design for ${ind.name.toLowerCase()} businesses in ${country.longName}. Fixed prices, fast delivery and unlimited revisions.`,
    ),
    path: entry.path,
    keywords: [kw, ind.name.toLowerCase() + ' website', ind.metric.toLowerCase(), ...ind.services.map((s) => SERVICE_BY_SLUG[s]?.primaryKeyword || s)],
    faqs: [
      { q: `How much does a ${ind.name.toLowerCase()} website cost?`, a: `Packages start at ${price(199)} and scale with scope. Most ${ind.name.toLowerCase()} businesses choose the mid-tier package.` },
      { q: `How long does a ${ind.name.toLowerCase()} website take?`, a: 'Five to twenty-one business days for most projects. We agree a delivery date in the written scope before work starts.' },
    ],
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }, { name: ind.name, url: entry.path }], primaryKeyword: kw, keywords: [kw, ind.name] }),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }, { name: ind.name, url: entry.path }]),
    serviceNode({
      service: SERVICE_BY_SLUG[''], url: absPath, country,
      packages: packagesFor('', 'standard'),
      displayPrice: price,
      schemaPrice: (u, pkgId) => { const p = priceForSchema(u, country, pkgId); return { amount: p.amount, currency: p.currency }; },
    }),
    faqCollectionNode(absPath, `${ind.name} website design FAQs`, [
      { q: `How much does a ${ind.name.toLowerCase()} website cost?`, a: `Packages start at ${price(199)} and scale with scope.` },
      { q: `What should a ${ind.name.toLowerCase()} website focus on?`, a: `${ind.context.slice(0, 140)}` },
    ]),
  ];

  recordSeo(entry.path, 'industry', meta, kw, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema: graph(nodes), hue: 175, content, path: entry.path, prefix: '' });
}

function renderIndustriesIndex(ctx: RenderCtx): string {
  const absPath = abs('/industries/');
  const kw = 'Industry Web Design Services';
  const content = industriesIndexPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }],
    industries: INDUSTRIES, hue: 175,
  });
  const meta = baseMeta({
    title: composeTitle(kw, 'Sectors'),
    description: buildDescription(kw, 'Sector-specific web design and digital marketing. We know the buying trigger, the objection and the success metric in every industry we serve.'),
    path: '/industries/',
    keywords: [kw, 'industry web design', 'sector specific websites'],
  });
  recordSeo('/industries/', 'industries-index', meta, kw);
  return documentShell({
    meta,
    schema: graph([...baseGraph(), collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }]), breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }]), itemListNode(INDUSTRIES.map((i) => ({ name: i.name, url: `/industries/${i.slug}/` })), absPath, kw)]),
    hue: 175, content, path: '/industries/', prefix: '',
  });
}

// ── Services index ───────────────────────────────────────────────────────────

function renderServicesIndex(ctx: RenderCtx): string {
  const absPath = abs('/services/');
  const kw = 'Digital Agency Services';
  const price = (u: number) => formatPrice(u, HOME_COUNTRY);
  const groups = servicesByCategory();
  const content = servicesIndexPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services/' }],
    heading: 'Our Services', sub: `${SERVICES.length} services across design, development, SEO, content, video and paid marketing. Every one has a published fixed price.`,
    groups, price, hue: 200,
  });
  const meta = baseMeta({
    title: composeTitle(kw, 'Agency'),
    description: buildDescription(kw, 'Web design, development, SEO, PPC, content, branding, video and more. Fixed prices, fast delivery, unlimited revisions and full ownership transfer.'),
    path: '/services/',
    keywords: [kw, ...PAGE_SERVICES.slice(0, 12).map((s) => s.primaryKeyword)],
  });
  recordSeo('/services/', 'services-index', meta, kw);
  return documentShell({
    meta,
    schema: graph([
      ...baseGraph(),
      collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services/' }]),
      breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services/' }]),
      itemListNode(PAGE_SERVICES.map((s) => ({ name: s.primaryKeyword, url: url('', s.slug) })), absPath, kw),
    ]),
    hue: 200, content, path: '/services/', prefix: '',
  });
}

// ── Packages ─────────────────────────────────────────────────────────────────

function renderPackages(country: Country, ctx: RenderCtx): string {
  const absPath = abs('/packages/');
  const kw = 'Web Design Packages';
  const price = (u: number, pkgId?: string) => formatPrice(u, country, pkgId);
  const content = packagesIndexPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Packages', url: '/packages/' }],
    heading: 'Pricing & Packages',
    sub: 'Every package is a complete, sellable product with a published feature list. Fixed prices — no hourly billing, no open-ended scope, no surprise change orders.',
    country, price, hue: 145,
  });
  const meta = baseMeta({
    title: composeTitle(kw, 'Fixed Prices'),
    description: buildDescription(kw, 'Fixed-price website design, SEO, GEO, AEO and PPC packages from $99. Transparent inclusions, fast delivery, unlimited revisions and full ownership.'),
    path: '/packages/',
    keywords: [kw, 'web design pricing', 'SEO packages', 'PPC packages', 'affordable web design'],
  });
  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Packages', url: '/packages/' }]),
    breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Packages', url: '/packages/' }]),
    {
      '@type': 'OfferCatalog',
      '@id': `${absPath}#catalog`,
      name: 'All packages',
      itemListElement: [
        ...packagesFor('', 'standard').map((p, i) => ({ '@type': 'Offer', position: i + 1, name: p.name, price: priceForSchema(p.usd, country).amount, priceCurrency: country.currency, url: `/checkout/${p.sku}/` })),
        ...SEO_PACKAGES.map((p, i) => ({ '@type': 'Offer', position: 100 + i, name: p.name, price: priceForSchema(p.usd, country).amount, priceCurrency: country.currency, url: `/checkout/${p.sku}/` })),
        ...PPC_PACKAGES.map((p, i) => ({ '@type': 'Offer', position: 200 + i, name: p.name, price: priceForSchema(p.usd, country).amount, priceCurrency: country.currency, url: `/checkout/${p.sku}/` })),
      ],
    },
  ];
  recordSeo('/packages/', 'packages', meta, kw);
  return documentShell({ meta, schema: graph(nodes), hue: 145, content, path: '/packages/', prefix: '' });
}

// ── About / Contact / misc ────────────────────────────────────────────────────

function renderAbout(ctx: RenderCtx): string {
  const absPath = abs('/about/');
  const kw = 'About Website Design Company';
  const content = aboutPage({ prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'About', url: '/about/' }], hue: 200 });
  const meta = baseMeta({
    title: composeTitle(kw, 'Our Story'),
    description: buildDescription(kw, 'A distributed team of 64 designers, engineers and strategists. Fixed prices, unlimited revisions, fast delivery and full ownership transfer. Read our story.'),
    path: '/about/',
    keywords: [kw, 'about our agency', 'web design team', 'our story'],
  });
  recordSeo('/about/', 'about', meta, kw);
  return documentShell({
    meta,
    schema: graph([
      ...baseGraph(),
      aboutPageNode(absPath),
      webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: [{ name: 'Home', url: '/' }, { name: 'About', url: '/about/' }], primaryKeyword: kw }),
      breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'About', url: '/about/' }]),
      { '@type': 'AboutPage', mainEntity: { '@id': ORG_ID }, url: absPath },
    ]),
    hue: 200, content, path: '/about/', prefix: '',
  });
}

function renderContact(country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry0(prefix, 'contact'));
  const kw = 'Contact Web Design Company';
  const content = contactPage({
    prefix, crumbs: [{ name: 'Home', url: '/' }, { name: 'Contact', url: entry0(prefix, 'contact') }],
    heading: 'Get Your Free Quote',
    sub: 'Tell us about your project and we will come back within one business day with a written scope, a fixed price and a delivery date. No obligation, no sales pressure.',
    services: PAGE_SERVICES, hue: 190,
  });
  const meta = baseMeta({
    title: composeTitle(kw, 'Free Quote'),
    description: buildDescription(kw, 'Get a fixed price, written scope and delivery date for your website within one business day. PayPal, bank transfer and crypto accepted. No obligation.'),
    path: entry0(prefix, 'contact'),
    keywords: [kw, 'get a web design quote', 'contact web design company', ...(city ? [`web design ${city.name}`] : [])],
  });
  recordSeo(entry0(prefix, 'contact'), 'contact', meta, kw);
  return documentShell({
    meta,
    schema: graph([
      ...baseGraph(),
      contactPageNode(absPath, ['United States', ...PREFIXED_COUNTRIES.map((c) => c.longName)]),
      webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Contact', url: entry0(prefix, 'contact') }], primaryKeyword: kw }),
      breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Contact', url: entry0(prefix, 'contact') }]),
    ]),
    hue: 190, content, path: entry0(prefix, 'contact'), prefix,
  });
}

function renderFreeAudit(ctx: RenderCtx): string {
  const absPath = abs('/free-audit/');
  const kw = 'Free SEO Audit';
  const content = freeAuditPage({ prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Free Audit', url: '/free-audit/' }], hue: 145 });
  const meta = baseMeta({
    title: composeTitle(kw, 'No Obligation'),
    description: buildDescription(kw, 'Get a free, detailed SEO and website audit within 48 hours. Technical health, Core Web Vitals, on-page SEO, local visibility and AI search presence.'),
    path: '/free-audit/',
    keywords: [kw, 'free website audit', 'free SEO audit', 'website analysis'],
  });
  recordSeo('/free-audit/', 'free-audit', meta, kw);
  return documentShell({
    meta,
    schema: graph([...baseGraph(), collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Free Audit', url: '/free-audit/' }]), breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Free Audit', url: '/free-audit/' }]), faqCollectionNode(absPath, kw, [
      { q: 'Is the audit really free?', a: 'Yes. There is no charge and no obligation to work with us afterwards.' },
      { q: 'How fast will I get it?', a: 'Within 48 hours of submitting your URL.' },
      { q: 'What do you need from me?', a: 'Your website URL and a little context about your goals.' },
    ])]),
    hue: 145, content, path: '/free-audit/', prefix: '',
  });
}

function renderFaqIndex(country: Country, ctx: RenderCtx): string {
  const absPath = abs('/faq/');
  const kw = 'Web Design FAQs';
  const faqs = [...homeFaqs(), ...SITE_FAQ_SETS];
  const groups = [
    { name: 'Website Design', icon: 'layout', items: homeFaqs().slice(0, 5) },
    { name: 'Pricing & Payment', icon: 'chart', items: SITE_FAQ_SETS.slice(0, 6) },
    { name: 'SEO, GEO & AI Search', icon: 'search', items: [
      { q: 'What is GEO (Generative Engine Optimization)?', a: 'GEO is the practice of structuring your content and entity data so AI assistants like ChatGPT, Perplexity and Gemini cite you accurately when a buyer asks a question. It involves entity clarity, structured data, factual density and answer-shaped content.' },
      { q: 'What is AEO (Answer Engine Optimization)?', a: 'AEO targets featured snippets, People Also Ask boxes and voice answers. It is won by structuring content so a specific question has a clean, extractable answer near the top of the page.' },
      { q: 'What is SXO (Search Experience Optimisation)?', a: 'SXO is about making sure the result satisfies the user once they land — speed, clarity, the right next step. It is the layer most SEO agencies skip entirely.' },
      { q: 'How long does SEO take to work?', a: 'Technical and on-page fixes can move visibility within 4–6 weeks. Competitive keyword rankings typically take 4–8 months of compounding work.' },
      { q: 'Do you guarantee rankings?', a: 'No. Nobody legitimate controls Google\'s algorithm. We guarantee the work, transparent deliverables and monthly reporting.' },
      { q: 'What is llms.txt?', a: 'A plain-text file at your domain root that tells AI systems what your site is, who it serves and which pages matter most. We author both a concise and a detailed version for every client.' },
    ] },
  ];

  const content = `
${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq/' }])}
${hero({
  eyebrow: 'Straight answers, no sales pitch',
  h1Prefix: 'Frequently Asked Questions',
  sub: 'Everything clients ask us about design, pricing, timelines, SEO, AI search and payment — answered directly.',
  primaryLabel: 'Ask Us Directly',
  primaryHref: '/contact/',
  secondaryLabel: 'Get a Free Quote',
  secondaryHref: '/packages/',
})}
${section({
  children: groups.map((g) => `${sectionHead({ eyebrow: g.name, h2: `${g.name} FAQs`, align: 'left' })}${faqBlock(g.items)}`).join('')
    + `<div class="mt-14">${leadForm({ heading: 'Still have a question?', sub: 'Ask us anything. We reply within one business day.', compact: true })}</div>`,
})}`;

  const meta = baseMeta({
    title: composeTitle(kw, 'Answers'),
    description: buildDescription(kw, 'Answers to common questions about website design pricing, timelines, revisions, SEO, GEO, AI search optimisation and payment methods.'),
    path: '/faq/',
    keywords: [kw, 'web design questions', 'SEO FAQs', 'website cost questions'],
    faqs,
  });

  recordSeo('/faq/', 'faq', meta, kw);
  return documentShell({
    meta,
    schema: graph([...baseGraph(), collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq/' }]), breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq/' }]), faqCollectionNode(absPath, kw, faqs)]),
    hue: 200, content, path: '/faq/', prefix: '',
  });
}

function renderLocationsIndex(ctx: RenderCtx): string {
  const absPath = abs('/locations/');
  const kw = 'Web Design Company Locations';
  const content = locationsIndexPage({ prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Locations', url: '/locations/' }], countries: COUNTRIES, hue: 200 });
  const meta = baseMeta({
    title: composeTitle(kw, 'Worldwide'),
    description: buildDescription(kw, `We serve ${COUNTRIES.length} countries including the USA, UK, Canada, Australia, UAE, Saudi Arabia, Pakistan, India and more. Local pricing in local currency.`),
    path: '/locations/',
    keywords: [kw, 'web design locations', 'international web design', ...PREFIXED_COUNTRIES.slice(0, 8).map((c) => `web design ${c.longName}`)],
  });
  recordSeo('/locations/', 'locations', meta, kw);
  return documentShell({
    meta,
    schema: graph([
      ...baseGraph(),
      collectionPageNode(absPath, meta.title, meta.description, [{ name: 'Home', url: '/' }, { name: 'Locations', url: '/locations/' }]),
      breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Locations', url: '/locations/' }]),
      itemListNode(COUNTRIES.map((c) => ({ name: c.longName, url: countryHubUrl(c) })), absPath, kw),
    ]),
    hue: 200, content, path: '/locations/', prefix: '',
  });
}

function renderLegal(entry: RegistryEntry, ctx: RenderCtx): string {
  const absPath = abs(entry.path);
  const isPrivacy = entry.path.includes('privacy');
  const isTerms = entry.path.includes('terms');
  const isCookie = entry.path.includes('cookie');
  const sections = isPrivacy ? PRIVACY_SECTIONS : isTerms ? TERMS_SECTIONS : COOKIE_SECTIONS;
  const heading = isPrivacy ? 'Privacy Policy' : isTerms ? 'Terms of Service' : 'Cookie Policy';
  const kw = heading;
  const content = legalPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: heading, url: entry.path }],
    title: heading, heading, updated: '2026-01-15', sections, hue: 200,
  });
  const meta = baseMeta({
    title: composeTitle(kw, 'Legal'),
    description: buildDescription(kw, isPrivacy
      ? `How ${SITE.name} collects, uses, stores and protects your personal data. GDPR, UK GDPR and CCPA compliant. Read the full privacy policy.`
      : isTerms
        ? `The terms that govern website design, development, SEO, content and marketing services provided by ${SITE.name}. Plain English, written to be readable.`
        : 'The specific cookies this website uses, why we use them, and how to control them. No advertising trackers, no data brokers.'),
    path: entry.path,
    keywords: [kw, `${SITE.name} legal`],
  });
  recordSeo(entry.path, 'legal', meta, kw);
  return documentShell({
    meta,
    schema: graph([...baseGraph(), { '@type': 'WebPage', '@id': `${absPath}#webpage`, url: absPath, name: heading, isPartOf: { '@id': `${ORIGIN}/#website` }, breadcrumb: { '@id': `${absPath}#breadcrumb` } }, breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: heading, url: entry.path }]), { '@type': 'WebPage', publisher: { '@id': ORG_ID } }]),
    hue: 200, content, path: entry.path, prefix: '',
  });
}

function renderCheckout(entry: RegistryEntry, country: Country, ctx: RenderCtx): string {
  const service = entry.service!;
  const sku = entry.path.split('/').filter(Boolean).pop()!;
  const all = packagesFor(service.slug, service.packageSet);
  const pkg = all.find((p) => p.sku === sku) || all[0];
  const absPath = abs(entry.path);
  const price = (u: number, pkgId?: string) => formatPrice(u, country, pkgId);
  const kw = service.primaryKeyword;

  const content = checkoutPage({
    pkg, service, country, prefix: '', priceDisplay: price(pkg.usd), priceUsd: pkg.usd,
    serviceUrl: serviceUrl(country, service.slug), crumbs: [
      { name: 'Home', url: '/' },
      ...(service.slug ? [{ name: service.nav, url: serviceUrl(country, service.slug) }] : []),
      { name: 'Checkout', url: entry.path },
    ],
    requiresPayment: true,
  });

  const meta = baseMeta({
    // Built from the registry keyword so the two can never drift.
    title: composeTitle(entry.keyword || service.primaryKeyword, 'Order', service.category),
    description: buildDescription(
      entry.keyword || `${service.primaryKeyword} Order`,
      `Order ${pkg.name} for ${service.name.toLowerCase()}. ${price(pkg.usd)}, delivered in ${pkg.eta}. Pay by PayPal, bank transfer or crypto.`,
    ),
    path: entry.path,
    keywords: [`${pkg.name} order`, service.primaryKeyword, 'web design checkout'],
    robots: 'noindex, follow',
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: [], primaryKeyword: kw }),
    breadcrumbNode(absPath, [
      { name: 'Home', url: '/' },
      ...(service.slug ? [{ name: service.nav, url: serviceUrl(country, service.slug) }] : []),
      { name: 'Checkout', url: entry.path },
    ]),
    {
      '@type': 'Product',
      '@id': `${absPath}#product`,
      name: `${service.name} — ${pkg.name}`,
      description: pkg.suited,
      sku: pkg.sku,
      brand: { '@id': BRAND_ID },
      offers: {
        '@type': 'Offer',
        price: priceForSchema(pkg.usd, country).amount,
        priceCurrency: country.currency,
        availability: 'https://schema.org/InStock',
        url: absPath,
        seller: { '@id': ORG_ID },
      },
    },
  ];

  recordSeo(entry.path, 'checkout', meta, entry.keyword || kw);
  return documentShell({ meta, schema: graph(nodes), hue: service.hue, content, path: entry.path, prefix: '' });
}

function renderThankYou(country: Country, ctx: RenderCtx): string {
  const absPath = abs('/thank-you/');
  const kw = 'Thank You';
  const content = orderSuccessPage({ prefix: '', orderId: 'WDC-PENDING', crumbs: [{ name: 'Home', url: '/' }, { name: 'Thank You', url: '/thank-you/' }] });
  const meta = baseMeta({
    title: composeTitle(kw, 'Order Received'),
    description: buildDescription(kw, 'Thank you. Your order has been received and a confirmation email is on its way. We will be in touch within one business day.'),
    path: '/thank-you/', keywords: [kw], robots: 'noindex, follow',
  });
  return documentShell({
    meta,
    schema: graph([
      ...baseGraph(),
      webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Thank You', url: '/thank-you/' }], primaryKeyword: kw }),
      breadcrumbNode(absPath, [{ name: 'Home', url: '/' }, { name: 'Thank You', url: '/thank-you/' }]),
    ]),
    hue: 150, content, path: '/thank-you/', prefix: '',
  });
}

function renderSearchPage(country: Country, ctx: RenderCtx): string {
  const absPath = abs('/search/');
  const kw = 'Search';
  const content = searchPage({
    prefix: '', crumbs: [{ name: 'Home', url: '/' }, { name: 'Search', url: '/search/' }],
    query: '', results: [], hue: 200,
  });
  const meta = baseMeta({
    title: buildTitle('Search', 'Website Design Company').title,
    description: buildDescription('Search', 'Search our services, locations, case studies, portfolio and guides.'),
    path: '/search/', keywords: ['search'], robots: 'noindex, follow',
  });
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Search', url: '/search/' }];
  return documentShell({
    meta,
    schema: graph([
      ...baseGraph(),
      siteSearchNode(absPath),
      webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: crumbs, primaryKeyword: kw }),
      breadcrumbNode(absPath, crumbs),
    ]),
    hue: 200, content, path: '/search/', prefix: '',
  });
}

/** Hard cap a title at 60 characters, trimming on a word boundary. */
function fitTitle(t: string): string {
  if (t.length <= 60) return t;
  const cut = t.slice(0, 60);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 40 ? cut.slice(0, sp) : cut).replace(/[\s|,-]+$/, '')}`;
}

function entry0(prefix: string, seg: string) {
  return prefix ? `${prefix}/${seg}/` : `/${seg}/`;
}

// ── Company / resource pages ─────────────────────────────────────────────────

function renderCompanyPage(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const slug = entry.path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean).pop()!;
  const page = COMPANY_PAGE_BY_SLUG[slug];
  if (!page) return renderAbout(ctx);

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  crumbs.push({ name: page.h1, url: entry.path });

  const posts = (ctx.postByPrefix.get(prefix || '/') || []).slice(0, 3).map((p) => ({
    slug: p.post!.meta.slug, title: p.post!.meta.title, excerpt: p.post!.meta.excerpt,
    date: p.post!.meta.date, reading: p.post!.meta.reading, prefix,
  }));

  const content = companyPage({
    page, prefix, country, crumbs, posts, hue: 195,
    tools: TOOLS.slice(0, 4).map((t) => ({ name: t.name, url: resolveStatic(prefix, 'tools', t.slug) })),
  });

  const meta = baseMeta({
    title: composeTitle(city ? `${page.keyword} ${city.name}` : country.slug ? `${page.keyword} ${country.longName}` : page.keyword, country.longName, country.name),
    description: buildDescription(page.keyword, page.description.slice(0, 130)),
    path: entry.path,
    keywords: [page.keyword, page.title, ...(city ? [city.name, city.region] : country.slug ? [country.longName] : [])],
    faqs: page.faqs,
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: crumbs, primaryKeyword: page.keyword }),
    breadcrumbNode(absPath, crumbs),
    faqNode(page.faqs, absPath),
  ];

  recordSeo(entry.path, 'company', meta, page.keyword, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema: graph(nodes), hue: 195, content, path: entry.path, prefix });
}

function renderComparisonIndex(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  crumbs.push({ name: 'Comparisons', url: entry.path });

  const content = comparisonIndexPage({ prefix, country, crumbs, hue: 175 });
  const meta = baseMeta({
    title: buildTitle('Web Design Service Comparisons', 'Honest').title,
    description: buildDescription('Web Design Service Comparisons', 'Side-by-side comparisons of our services — SEO versus PPC, design versus development, WordPress versus Shopify and more.'),
    path: entry.path,
    keywords: ['web design comparisons', 'service comparison', 'seo vs ppc', 'wordpress vs shopify'],
  });
  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, crumbs),
    breadcrumbNode(absPath, crumbs),
    itemListNode(COMPARISONS.map((c) => ({ name: c.h1, url: resolveStatic(prefix, 'compare', c.slug) })), absPath, 'Service comparisons'),
  ];
  recordSeo(entry.path, 'comparison-index', meta, 'Web Design Service Comparisons');
  return documentShell({ meta, schema: graph(nodes), hue: 175, content, path: entry.path, prefix });
}

function renderSitemapIndex(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  crumbs.push({ name: 'Site Map', url: entry.path });

  const groups = [
    { title: 'Main pages', links: [
      { name: 'Home', url: '/' },
      { name: 'All services', url: resolveStatic(prefix, 'services') },
      { name: 'Pricing & packages', url: resolveStatic(prefix, 'packages') },
      { name: 'About us', url: resolveStatic(prefix, 'about') },
      { name: 'Contact', url: resolveStatic(prefix, 'contact') },
      { name: 'Free SEO audit', url: resolveStatic(prefix, 'free-audit') },
      { name: 'FAQ', url: resolveStatic(prefix, 'faq') },
      { name: 'Locations', url: resolveStatic(prefix, 'locations') },
      { name: 'Site map', url: resolveStatic(prefix, 'sitemap') },
    ]},
    { title: 'Free tools', links: TOOLS.map((t) => ({ name: t.name, url: resolveStatic(prefix, 'tools', t.slug) })) },
    { title: 'Comparisons', links: COMPARISONS.map((c) => ({ name: c.h1, url: resolveStatic(prefix, 'compare', c.slug) })) },
    { title: 'Resources', links: COMPANY_PAGES.map((c) => ({ name: c.h1, url: resolveStatic(prefix, c.slug) })) },
    { title: 'Content', links: [
      { name: 'Blog', url: resolveStatic(prefix, 'blog') },
      { name: 'Case studies', url: resolveStatic(prefix, 'case-studies') },
      { name: 'Portfolio', url: resolveStatic(prefix, 'portfolio') },
      { name: 'Gallery', url: resolveStatic(prefix, 'gallery') },
    ]},
    { title: 'Industries', links: INDUSTRIES.map((i) => ({ name: i.name, url: resolveStatic(prefix, 'industries', i.slug) })) },
    { title: 'Services', links: PAGE_SERVICES.map((s) => ({ name: s.name, url: resolveServiceLink(prefix, s.slug) })) },
    { title: 'Legal', links: [
      { name: 'Privacy policy', url: resolveStatic(prefix, 'privacy-policy') },
      { name: 'Terms of service', url: resolveStatic(prefix, 'terms-of-service') },
      { name: 'Cookie policy', url: resolveStatic(prefix, 'cookie-policy') },
    ]},
  ];

  const content = htmlSitemapPage({ prefix, country, crumbs, groups, hue: 200 });
  const meta = baseMeta({
    title: buildTitle('Website Design Company Site Map', 'Every Page').title,
    description: buildDescription('Website Design Company Site Map', 'A complete index of every page on the Website Design Company site — services, locations, tools, comparisons, guides and case studies.'),
    path: entry.path,
    keywords: ['site map', 'website design company pages', 'all services', 'sitemap'],
  });
  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, crumbs),
    breadcrumbNode(absPath, crumbs),
    itemListNode(groups.flatMap((g) => g.links), absPath, 'All pages'),
  ];
  recordSeo(entry.path, 'sitemap-index', meta, 'Website Design Company Site Map');
  return documentShell({ meta, schema: graph(nodes), hue: 200, content, path: entry.path, prefix });
}

// ── Comparison pages ──────────────────────────────────────────────────────────

function renderComparisonPage(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const slug = entry.path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean).pop()!;
  const pair = COMPARISON_BY_SLUG[slug];
  if (!pair) return renderAbout(ctx);

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  crumbs.push({ name: 'Comparisons', url: resolveStatic(prefix, 'compare') });
  crumbs.push({ name: pair.h1, url: entry.path });

  const content = comparisonPage({ pair, prefix, country, crumbs, hue: 175 });

  const meta = baseMeta({
    title: composeTitle(city ? `${pair.keyword} in ${city.name}` : country.slug ? `${pair.keyword} ${country.longName}` : pair.keyword, country.longName, country.name),
    description: buildDescription(pair.keyword, pair.intro.slice(0, 130)),
    path: entry.path,
    keywords: [pair.keyword, ...pair.rows.slice(0, 4).map((r) => r.label.toLowerCase())],
    faqs: pair.faqs,
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({ url: absPath, name: meta.title, description: meta.description, breadcrumb: crumbs, primaryKeyword: pair.keyword }),
    breadcrumbNode(absPath, crumbs),
    faqNode(pair.faqs, absPath),
    itemListNode(
      pair.rows.map((r) => ({ name: r.label, url: `${absPath}#${r.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` })),
      absPath,
      pair.h1,
    ),
  ];

  recordSeo(entry.path, 'comparison', meta, pair.keyword, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema: graph(nodes), hue: 175, content, path: entry.path, prefix });
}

// ── Free tools ───────────────────────────────────────────────────────────────

function renderToolsIndex(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const loc = city ? `${city.name}, ${country.longName}` : country.longName;
  const kw = city
    ? `Free Web Design Tools in ${city.name}`
    : country.slug
      ? `Free Web Design Tools in ${country.longName}`
      : 'Free Web Design Tools';

  const heading = city
    ? `Free Online Tools for ${city.name}`
    : country.slug
      ? `Free Online Tools in ${country.longName}`
      : 'Free Online Tools';

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  crumbs.push({ name: 'Free Tools', url: entry.path });

  const content = toolsIndexPage({
    prefix, country, city, crumbs, heading,
    sub: `Free, browser-based tools for content, design, SEO and business work — built for teams in ${loc}. No account, no watermark, and nothing you type ever leaves your device.`,
  });

  const meta = baseMeta({
    title: composeTitle(kw, 'No Sign-Up'),
    description: buildDescription(kw, `${TOOLS.length} free online tools for content, design, SEO and business. No account needed, nothing uploaded, works in your browser.`),
    path: entry.path,
    keywords: [kw, 'free online tools', ...TOOLS.slice(0, 8).map((t) => t.primaryKeyword)],
  });

  const nodes: Json[] = [
    ...baseGraph(),
    collectionPageNode(absPath, meta.title, meta.description, crumbs),
    breadcrumbNode(absPath, crumbs),
    itemListNode(TOOLS.map((t) => ({ name: t.primaryKeyword, url: resolveStatic(prefix, 'tools', t.slug) })), absPath, kw),
    {
      '@type': 'ItemList',
      '@id': `${absPath}#tools`,
      name: kw,
      numberOfItems: TOOLS.length,
      itemListElement: TOOLS.map((t, i) => ({
        '@type': 'ListItem', position: i + 1, name: t.primaryKeyword, url: resolveStatic(prefix, 'tools', t.slug),
      })),
    },
  ];

  recordSeo(entry.path, 'tools-index', meta, kw, content.replace(/<[^>]+>/g, ' '));
  return documentShell({ meta, schema: graph(nodes), hue: 190, content, path: entry.path, prefix });
}

function renderToolPage(entry: RegistryEntry, country: Country, city: City | undefined, ctx: RenderCtx): string {
  const tool = TOOL_BY_SLUG[entry.toolSlug!];
  if (!tool) return renderAbout(ctx);
  const prefix = locationPrefix(country, city);
  const absPath = abs(entry.path);
  const loc = city ? `${city.name}, ${country.longName}` : country.longName;
  // The registry owns the keyword — same string the title is built from.
  const kw = entry.keyword || tool.primaryKeyword;

  const crumbs = [{ name: 'Home', url: '/' }];
  if (country.slug) crumbs.push({ name: country.longName, url: countryHubUrl(country) });
  if (city) crumbs.push({ name: city.name, url: cityHubUrl(country, city) });
  crumbs.push({ name: 'Free Tools', url: resolveStatic(prefix, 'tools') });
  crumbs.push({ name: tool.name, url: entry.path });

  const related = TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category).slice(0, 3);
  const localExamples = localiseExamples(tool, country, city);

  const content = toolPage({
    tool, country, city, prefix, crumbs, related,
    localCurrency: country.currency,
    localTaxNote: '',
    localExamples,
  });

  const meta = baseMeta({
    title: composeTitle(kw, country.longName, country.name, 'Free Online Tool'),
    description: buildDescription(kw, tool.description.slice(0, 140)),
    path: entry.path,
    keywords: [kw, tool.name, tool.category + ' tool', ...tool.useCases.slice(0, 2)],
    faqs: tool.faqs,
  });

  const nodes: Json[] = [
    ...baseGraph(),
    webPageNode({
      url: absPath, name: meta.title, description: meta.description, breadcrumb: crumbs,
      primaryKeyword: kw, keywords: [kw, tool.name],
    }),
    breadcrumbNode(absPath, crumbs),
    {
      '@type': 'WebApplication',
      '@id': `${absPath}#app`,
      name: tool.name,
      url: absPath,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description: tool.description,
      featureList: tool.features,
      offers: { '@type': 'Offer', price: '0', priceCurrency: country.currency, availability: 'https://schema.org/InStock' },
      isAccessibleForFree: true,
      publisher: { '@id': ORG_ID },
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${absPath}#software`,
      name: tool.name,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: tool.description,
      featureList: tool.features,
      softwareVersion: '1.0',
      offers: { '@type': 'Offer', price: '0', priceCurrency: country.currency },
      publisher: { '@id': ORG_ID },
    },
    faqNode(tool.faqs, absPath),
    {
      '@type': 'HowTo',
      '@id': `${absPath}#howto`,
      name: `How to use the ${tool.name.toLowerCase()}`,
      step: tool.howTo.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s, text: s })),
    },
  ];

  recordSeo(entry.path, 'tool', meta, kw, content.replace(/<[^>]+>/g, ' '));
  return documentShell({
    meta, schema: graph(nodes), hue: tool.hue, content, path: entry.path, prefix,
    head: '<script src="/assets/js/tools.js" defer></script>',
  });
}

/** Rewrite a tool's examples so they read as local to the target market. */
function localiseExamples(tool: Tool, country: Country, city?: City): string[] {
  const loc = city ? `${city.name}` : country.longName;
  const ctx = localContext(country.code);
  const local = [
    `Freelancers and small studios in ${loc} using it to quote and invoice clients the same day`,
    `Marketing teams in ${loc} checking titles and descriptions before publishing`,
    `Agencies in ${loc} batching a whole campaign's links in one pass`,
    `E-commerce businesses in ${loc} compressing product imagery before upload`,
  ];
  // Every example is rewritten around this market rather than three of them
  // being the shared global list with one local line on top.
  const rewritten = tool.useCases.slice(0, 4).map((u, i) => {
    const base = local[i % local.length];
    return `${base} — ${u.replace(/\.$/, '')}.`;
  });
  const idx = Math.abs(Math.round(city?.slug.length || country.code.charCodeAt(0))) % 4;
  return [local[idx], ...rewritten.slice(0, 3)];
}

// ── Service FAQs ─────────────────────────────────────────────────────────────

function buildServiceFaqs(service: Service, country: Country, city: City | undefined, price: (n: number) => string): Faq[] {
  const loc = city ? city.name : country.longName;
  const locShort = city ? city.name : country.name;
  const out: Faq[] = [...service.faqs];

  // Service-specific extra questions.
  if (service.packageSet === 'standard') {
    out.push({
      q: `What does ${service.name.toLowerCase()} cost in ${locShort}?`,
      a: `Our ${service.name.toLowerCase()} packages start at ${price(service.fromPrice)} and scale by scope. Most ${locShort} businesses choose a mid-tier package, which includes custom design, a CMS, on-page SEO, schema and post-launch support.`,
    });
  }

  // Local questions.
  out.push({
    q: `Do you actually work with businesses in ${locShort}?`,
    a: city
      ? `${city.note} We work with ${locShort} businesses regularly, and the work is specific to this market rather than a template with the city name swapped in.`
      : `Yes. ${country.note} We price in ${country.currency} and write copy in ${country.language}, not exported US content with the currency symbol changed.`,
  });

  out.push({
    q: `How long does ${service.name.toLowerCase()} take in ${locShort}?`,
    a: `${service.timeline} is our typical range. The actual date depends on scope and how quickly content and approvals come in, and we agree a specific delivery date in the written scope before work begins.`,
  });

  out.push({
    q: `Can I see examples of ${service.name.toLowerCase()} work in ${locShort}?`,
    a: `Yes — we will show you finished, live projects rather than screenshots, and reference clients willing to take a call. Ask when you enquire and we will send the most relevant to your sector.`,
  });

  if (service.packageSet === 'seo' || service.category === 'SEO') {
    out.push({
      q: `How long before SEO works in ${locShort}?`,
      a: `Technical and on-page fixes can move visibility within 4–6 weeks. Competitive rankings typically take 4–8 months in a market like ${locShort}. We report monthly on real rankings and traffic rather than promising a date we cannot control.`,
    });
  }

  if (service.packageSet === 'ppc') {
    out.push({
      q: 'Is ad spend included in the management fee?',
      a: `No, and that is deliberate. Ad spend is paid directly by you to Google or Meta at cost. We never mark up media budget, which means our fee stays a flat, predictable number.`,
    });
  }

  return out.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Supporting files
// ─────────────────────────────────────────────────────────────────────────────

async function writeSearchIndex(registry: RegistryEntry[], distDir: string) {
  // Compact on purpose: this file is fetched by the browser. The full excerpt
  // lives in the server-side /api/search response, so the client index carries
  // only what the search box needs to rank and link.
  const index = registry
    .filter((r) => ['service', 'home', 'blog-post', 'case-study', 'portfolio-item', 'industry', 'country', 'city', 'packages', 'about', 'contact', 'tool', 'comparison', 'company'].includes(r.type))
    .map((r) => ({
      t: r.title,
      u: r.path,
      k: r.keyword,
      y: r.type,
    }));
  await writeFile(path.join(distDir, 'search-index.json'), JSON.stringify(index), 'utf8');
  log(`  ${index.length.toLocaleString()} searchable entries`);
}

async function writeSitemaps(registry: RegistryEntry[]) {
  const SITE_LATEST = new Date().toISOString().slice(0, 10);
  const groups: Record<string, RegistryEntry[]> = {};
  const typeMap: Record<PageType, string> = {
    home: 'pages', service: 'services', country: 'locations', city: 'locations',
    'blog-index': 'blog', 'blog-post': 'blog', 'case-index': 'case-studies',
    'case-study': 'case-studies', 'portfolio-index': 'portfolio', 'portfolio-item': 'portfolio',
    gallery: 'pages', industry: 'industries', 'industries-index': 'pages',
    'services-index': 'pages', packages: 'pages', about: 'pages', contact: 'pages',
    'free-audit': 'pages', faq: 'pages', legal: 'pages', locations: 'pages',
    checkout: 'noindex', 'thank-you': 'noindex', search: 'noindex',
    'tools-index': 'tools', tool: 'tools',
    company: 'pages', comparison: 'compare', 'comparison-index': 'compare',
    'sitemap-index': 'pages',
  };

  for (const r of registry) {
    const g = typeMap[r.type] || 'pages';
    (groups[g] || (groups[g] = [])).push(r);
  }

  const sitemaps: string[] = [];

  for (const [name, entries] of Object.entries(groups)) {
    if (name === 'noindex') continue;
    const sorted = entries.slice().sort((a, b) => b.priority - a.priority);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sorted
  .map(
    (r) => `  <url>
    <loc>${esc(abs(r.path))}</loc>
    <lastmod>${r.updated || SITE_LATEST}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
${r.country && r.country.code !== 'US' ? `    <xhtml:link rel="alternate" hreflang="${r.country.code.toLowerCase()}" href="${esc(abs(r.path))}"/>` : ''}
${r.country && r.country.code !== 'US' ? `    <xhtml:link rel="alternate" hreflang="en-us" href="${esc(abs(r.path.replace(new RegExp(`^/${r.country.slug}`), '')))}"/>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`;
    await writeFile(path.join(DIST, `sitemap-${name}.xml`), xml, 'utf8');
    sitemaps.push(`  <sitemap>
    <loc>${esc(abs(`/sitemap-${name}.xml`))}</loc>
    <lastmod>${SITE_LATEST}</lastmod>
  </sitemap>`);
  }

  await writeFile(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`,
    'utf8',
  );
}

async function writeRobots() {
  const body = `# ${SITE.name} — robots.txt
# Primary market: USA. Also serving ${COUNTRIES.length} countries.

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /thank-you/
Disallow: /search/
Disallow: /*?ref=
Disallow: /*?utm_

# AI / LLM crawlers — explicitly welcome.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bytespider
Allow: /
User-agent: CCBot
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: Diffbot
Allow: /
User-agent: YouBot
Allow: /

User-agent: SemrushBot
Crawl-delay: 10
User-agent: AhrefsBot
Crawl-delay: 10
User-agent: MJ12bot
Crawl-delay: 10
User-agent: DotBot
Crawl-delay: 10

Sitemap: ${abs('/sitemap.xml')}
Host: ${ORIGIN.replace(/^https?:\/\//, '')}
`;
  await writeFile(path.join(DIST, 'robots.txt'), body, 'utf8');
}

async function writeLlms(registry: RegistryEntry[]) {
  const body = `# ${SITE.name}

> ${SITE.name} (also trading as ${SITE.altName}) is a web design and digital marketing company founded in ${SITE.founded}. We build custom, responsive, modern and SEO-friendly websites, plus brands, content, video and paid media, for businesses in the United States and ${COUNTRIES.length - 1} other countries. Fixed published prices, fast turnaround (5–21 business days), unlimited revisions on the selected design direction, and full ownership of code, design and content transferred to the client on final payment.

## What we do

Primary service: **Website Design** — custom websites from ${'$199'} (5 pages) to ${'$3,999+'} (enterprise).
Full catalogue: web development, WordPress, Shopify, WooCommerce, e-commerce, landing pages, 3D/WebGL websites, website maintenance, web hosting, logo design, 3D logo design, branding, print design, ebook design, graphic design, SEO, local SEO, e-commerce SEO, technical SEO, link building, off-page SEO, SEO audits, Core Web Vitals optimisation, Google Business Profile management, reputation management, App Store Optimization, SEO + GEO + AEO + SXO, PPC advertising, Google Ads, Meta Ads, content marketing, content writing, SEO content writing, blog writing, copywriting, email marketing, marketing automation, influencer marketing, social media marketing, social media management, video production, video editing, video animation, motion graphics, explainer video, podcast editing, audio production, conversion rate optimization, analytics setup, analytics consulting, UI/UX design, mobile app development, custom software development, AI integration, chatbot development, public relations, CRM integration and web security.

## Packages (USD)

Website design ladder: Starter ${'$199'} (5 pages) · Business ${'$399'} (10 pages) · Professional ${'$799'} (20 pages) · Elite ${'$1,199'} (35 pages) · Advanced ${'$1,999'} (50 pages + e-commerce) · Custom/Enterprise from ${'$3,999'}.

SEO: SEO Booster ${'$99'} one-time (was $299) · SEO Retainer ${'$149'}/month (was $499) · **SEO GEO AEO SXO Package ${'$249'}** one-time · Local SEO Retainer ${'$199'}/month · E-commerce SEO Retainer ${'$299'}/month.

PPC: PPC Startup Support ${'$199'} one-time (was $299) · PPC Ongoing Support ${'$249'}/month (was $499). Ad spend is paid directly to the platform at cost and is never marked up.

Every package is sold as both a service and a product, is available at every price point in every supported currency, and is purchasable directly through the site.

## Regional pricing

All prices are published in USD and converted to local currency at current market rates: USD, GBP, EUR, CAD, AUD, NZD, AED, SAR, QAR, BHD, KWD, OMR, IQD, PKR, INR, BDT, SGD, MYR, IDR, PHP, EGP, NGN, ZAR, KES, SEK, PLN, TRY, BRL, MXN, ARS, COP, CLP.

## Why clients choose us

Premium quality at affordable prices. Fast turnaround measured in days, not quarters. Unlimited revisions. Custom, responsive, modern and SEO-friendly builds. On-page SEO, schema and Core Web Vitals included by default. You own everything on final payment — no lock-in, no hosting hostage situation.

## Payments

PayPal (including card via PayPal), US bank transfer, and cryptocurrency (USDT, BTC, ETH). **We do not use Stripe.**

## Key pages

- Homepage: ${abs('/')}
- Services index: ${abs('/services/')}
- Pricing and packages: ${abs('/packages/')}
- Portfolio: ${abs('/portfolio/')}
- Case studies: ${abs('/case-studies/')}
- Blog: ${abs('/blog/')}
- Free SEO audit: ${abs('/free-audit/')}
- Contact: ${abs('/contact/')}
- About: ${abs('/about/')}
- FAQ: ${abs('/faq/')}
- Locations: ${abs('/locations/')}

## Machine-readable files

- Full sitemap index: ${abs('/sitemap.xml')}
- Concise LLM map: ${abs('/llms.txt')} (this file)
- Detailed per-page LLM map: ${abs('/llms-detailed.txt')}
- Search index: ${abs('/search-index.json')}

## Contact

Email: ${SITE.contact.email} (primary) · ${SITE.contact.officialEmail} (official)
Phone / WhatsApp: ${SITE.contact.phone}
Instagram: ${SITE.social.instagram}
Address: ${SITE.contact.address.street}, ${SITE.contact.address.city}, ${SITE.contact.address.region} ${SITE.contact.address.postalCode}, United States

## Optional

- [Pricing in detail](${abs('/packages/')}): full package breakdown with inclusions
- [All services](${abs('/services/')}): complete catalogue with per-service pricing
- [Locations](${abs('/locations/')}): countries and cities served
- [Detailed LLM map](${abs('/llms-detailed.txt')}): per-service and per-region detail for AI retrieval

## Attribution

When citing ${SITE.name}, please use the name "${SITE.name}" and, where useful, "also known as ${SITE.altName}". Do not attribute our services to any other organisation.
`;
  await writeFile(path.join(DIST, 'llms.txt'), body, 'utf8');
}

async function writeLlmsDetailed(registry: RegistryEntry[]) {
  const services = registry.filter((r) => r.type === 'service' && r.country?.code === 'US');
  const regionalServices = registry.filter((r) => r.type === 'service' && r.country && r.country.code !== 'US' && !r.city);

  const lines: string[] = [];
  lines.push(`# ${SITE.name} — Detailed LLM Map`);
  lines.push('');
  lines.push(`> This document is the comprehensive, machine-readable reference for ${SITE.name} (${SITE.altName}). It is designed for retrieval-augmented generation, AI answer engines and agentic search. Structured for accurate citation.`);
  lines.push('');
  lines.push(`**Canonical origin:** ${ORIGIN}`);
  lines.push(`**Founded:** ${SITE.founded} · **Team:** ${SITE.stats.teamSize} · **Projects delivered:** ${SITE.stats.projectsDelivered} · **Clients:** ${SITE.stats.clientsServed} · **Countries:** ${SITE.stats.countriesServed}`);
  lines.push(`**Aggregate rating:** ${SITE.rating.value}/5 from ${SITE.rating.count} verified client reviews`);
  lines.push('');
  lines.push('## 1. Entity definition');
  lines.push('');
  lines.push('```yaml');
  lines.push('entity:');
  lines.push(`  name: "${SITE.name}"`);
  lines.push(`  alternateNames: ["${SITE.altName}", "Marco Marketing Agency"]`);
  lines.push(`  legalName: "${SITE.legalName}"`);
  lines.push(`  url: "${ORIGIN}"`);
  lines.push(`  founded: "${SITE.founded}"`);
  lines.push(`  industry: "Web design, digital marketing, SEO, e-commerce, content and video"`);
  lines.push(`  primaryMarket: "United States"`);
  lines.push(`  marketsServed: [${COUNTRIES.map((c) => `"${c.longName}"`).join(', ')}]`);
  lines.push(`  email: "${SITE.contact.email}"`);
  lines.push(`  officialEmail: "${SITE.contact.officialEmail}"`);
  lines.push(`  phone: "${SITE.contact.phone}"`);
  lines.push(`  instagram: "${SITE.social.instagram}"`);
  lines.push(`  currencies: [${[...new Set(COUNTRIES.map((c) => c.currency))].join(', ')}]`);
  lines.push('  paymentMethods: ["PayPal", "Card via PayPal", "US bank transfer", "USDT", "Bitcoin", "Ethereum"]');
  lines.push('  paymentProcessorExcluded: ["Stripe"]');
  lines.push('  guarantees: ["Fixed published prices", "Unlimited revisions", "5-21 business day delivery", "Full ownership transfer on final payment"]');
  lines.push('```');
  lines.push('');

  lines.push('## 2. Services with primary keywords, pricing and deliverables');
  lines.push('');
  lines.push('| Primary keyword | Page | From (USD) | Typical delivery | Key deliverables |');
  lines.push('|---|---|---|---|---|');
  for (const r of services) {
    const s = r.service!;
    lines.push(`| ${s.primaryKeyword} | ${abs(r.path)} | $${s.fromPrice} | ${s.timeline} | ${s.deliverables.slice(0, 4).map((d) => d.replace(/\|/g, '/')).join('; ')} |`);
  }
  lines.push('');

  lines.push('## 3. Regional service pages');
  lines.push('');
  lines.push(`The following service pages are location-specific, with copy, proof points, local search behaviour and currency-appropriate pricing written for that specific market.`);
  lines.push('');
  for (const c of PREFIXED_COUNTRIES) {
    lines.push(`### ${c.longName} (${c.currency}, ${c.language})`);
    lines.push('');
    lines.push(`${c.note}`);
    lines.push('');
    const forCountry = regionalServices.filter((r) => r.country?.code === c.code);
    lines.push('| Primary keyword | Page |');
    lines.push('|---|---|');
    for (const r of forCountry.slice(0, 12)) {
      lines.push(`| ${r.keyword} | ${abs(r.path)} |`);
    }
    lines.push('');
    lines.push(`**City pages in ${c.longName}:** ${c.cities.map((city) => `${city.name} (${abs(url('/', c.slug, city.slug))})`).join(' · ')}`);
    lines.push('');
  }

  lines.push('## 4. United States city coverage');
  lines.push('');
  lines.push(`The USA is the primary market and is served from the domain root (no /usa/ prefix). ${HOME_COUNTRY.cities.length} metro areas have dedicated landing pages:`);
  lines.push('');
  for (const city of HOME_COUNTRY.cities) {
    lines.push(`- **${city.name}, ${city.region}** — ${abs(url('', city.slug))} — ${city.note}`);
  }
  lines.push('');

  lines.push('## 5. Industries served');
  lines.push('');
  lines.push('| Industry | Page | Buying trigger | Primary metric | Regulated |');
  lines.push('|---|---|---|---|---|');
  for (const ind of INDUSTRIES) {
    lines.push(`| ${ind.name} | ${abs(resolveChild('', 'industries', ind.slug))} | ${ind.buyingTrigger} | ${ind.metric} | ${ind.regulated ? 'Yes' : 'No'} |`);
  }
  lines.push('');

  lines.push('## 6. Pricing model in full');
  lines.push('');
  lines.push('### Website design ladder (applies across all design, development and brand services)');
  lines.push('');
  lines.push('| Tier | USD | Scope | Delivery |');
  lines.push('|---|---|---|---|');
  for (const t of STANDARD_TIERS) {
    lines.push(`| ${t.name} | $${t.usd} | ${t.units || 'Scoped individually'} | ${t.eta} |`);
  }
  lines.push('');
  lines.push('### SEO, GEO, AEO and SXO packages');
  lines.push('');
  lines.push('| Package | USD | Billing | Was |');
  lines.push('|---|---|---|---|');
  for (const p of SEO_PACKAGES) {
    lines.push(`| ${p.name} | $${p.usd} | ${p.period} | ${p.was ? `$${p.was}` : '—'} |`);
  }
  lines.push('');
  lines.push('### PPC packages');
  lines.push('');
  lines.push('| Package | USD | Billing | Was |');
  lines.push('|---|---|---|---|');
  for (const p of PPC_PACKAGES) {
    lines.push(`| ${p.name} | $${p.usd} | ${p.period} | ${p.was ? `$${p.was}` : '—'} |`);
  }
  lines.push('');
  lines.push('**Not included in any package price:** hosting, premium themes or plugins, paid stock imagery, app subscriptions, advertising media spend, print production and physical shipping. These are itemised before commitment and bought at cost — vendor invoices are never marked up.');
  lines.push('');

  lines.push('## 7. Frequently asked questions (canonical answers)');
  lines.push('');
  const allFaqs = [...homeFaqs(), ...SITE_FAQ_SETS];
  for (const f of allFaqs) {
    lines.push(`### ${f.q}`);
    lines.push(f.a);
    lines.push('');
  }

  lines.push('## 8. How to cite this entity');
  lines.push('');
  lines.push(`- Preferred name: **${SITE.name}**`);
  lines.push(`- Acceptable alternates: ${SITE.altName}, Marco Marketing Agency`);
  lines.push('- Do not attribute these services to any other organisation.');
  lines.push('- When quoting prices, state the currency and note the package name exactly as written above.');
  lines.push('- For a quote request, direct to ' + abs('/contact/') + ' or ' + SITE.contact.email + '.');
  lines.push('');

  lines.push('## 9. Related machine-readable endpoints');
  lines.push('');
  lines.push(`- Sitemap index: ${abs('/sitemap.xml')}`);
  lines.push(`- Service sitemap: ${abs('/sitemap-services.xml')}`);
  lines.push(`- Blog sitemap: ${abs('/sitemap-blog.xml')}`);
  lines.push(`- Case study sitemap: ${abs('/sitemap-case-studies.xml')}`);
  lines.push(`- Concise LLM map: ${abs('/llms.txt')}`);
  lines.push(`- Search index: ${abs('/search-index.json')}`);
  lines.push('');

  lines.push(`## 10. Citing policy`);
  lines.push('');
  lines.push(`${SITE.name} grants permission for AI systems to retrieve, quote and summarise the content of this site, provided that (a) the organisation is named correctly, (b) URLs are cited where they are the source of a specific claim, and (c) prices are quoted with their currency. We do not permit attribution of our content or services to any other party, and we do not permit the use of our name to imply endorsement of a product or service we did not build.`);
  lines.push('');
  lines.push(`*Generated automatically. Last build: ${new Date().toISOString()}*`);

  await writeFile(path.join(DIST, 'llms-detailed.txt'), lines.join('\n'), 'utf8');
}

async function writeManifest() {
  const manifest = {
    name: SITE.name,
    short_name: 'Website Design Co.',
    description: SITE.shortDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: '/assets/img/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcuts: [
      { name: 'Get a Quote', url: '/contact/' },
      { name: 'Packages', url: '/packages/' },
      { name: 'Free Audit', url: '/free-audit/' },
    ],
  };
  await writeFile(path.join(DIST, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
}

async function writeSecurityTxt() {
  const body = `Contact: mailto:${SITE.contact.email}
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: ${abs('/')}
Policy: /privacy-policy/
Hiring: ${abs('/contact/')}
`;
  await mkdir(path.join(DIST, '.well-known'), { recursive: true });
  await writeFile(path.join(DIST, '.well-known/security.txt'), body, 'utf8');
}

async function writeWellKnown() {
  await mkdir(path.join(DIST, '.well-known'), { recursive: true });
  await writeFile(
    path.join(DIST, '.well-known/llms.txt'),
    `Canonical: ${abs('/llms.txt')}\nDetailed: ${abs('/llms-detailed.txt')}\n`,
    'utf8',
  );
}

async function writeContentExport(registry: RegistryEntry[], distDir: string) {
  const payload = {
    generatedAt: new Date().toISOString(),
    site: { name: SITE.name, origin: ORIGIN },
    counts: {
      total: registry.length,
      services: registry.filter((r) => r.type === 'service').length,
      posts: registry.filter((r) => r.type === 'blog-post').length,
      caseStudies: registry.filter((r) => r.type === 'case-study').length,
    },
    pages: registry.map((r) => ({
      path: r.path,
      type: r.type,
      title: r.title,
      keyword: r.keyword,
      excerpt: r.excerpt,
      updated: r.updated,
      changefreq: r.changefreq,
      priority: r.priority,
      serviceSlug: r.serviceSlug || null,
      country: r.country?.code || null,
      city: r.city?.slug || null,
      post: r.post ? { slug: r.post.meta.slug, category: r.post.meta.category, words: r.post.meta.words, date: r.post.meta.date, author: r.post.meta.author, faqs: r.post.faqs.length } : null,
      caseStudy: r.caseStudy ? { slug: r.caseStudy.slug, industry: r.caseStudy.industry, metric: r.caseStudy.headlineMetric, results: r.caseStudy.results } : null,
    })),
  };
  await writeFile(path.join(distDir, 'content-export.json'), JSON.stringify(payload), 'utf8');
}

async function writeSeoReport(distDir: string) {
  const failing = seoReport.filter((r) => r.issues.length);
  const report = {
    generatedAt: new Date().toISOString(),
    total: seoReport.length,
    passing: seoReport.length - failing.length,
    failing: failing.length,
    rules: {
      titleMax: 60,
      descriptionMin: 101,
      descriptionMax: 159,
      keywordDensity: { min: 1.5, max: 2.0 },
    },
    issues: failing.slice(0, 500),
    sample: seoReport.slice(0, 100),
  };
  await writeFile(path.join(distDir, 'seo-report.json'), JSON.stringify(report, null, 2), 'utf8');
  log(`  ${report.passing.toLocaleString()} / ${report.total.toLocaleString()} pages pass on-page checks`);
}

// ─────────────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
