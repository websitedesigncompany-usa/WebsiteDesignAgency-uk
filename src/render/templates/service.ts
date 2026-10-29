/**
 * Page templates.
 *
 * Each template receives a fully-resolved page model and returns the
 * <main> content. The document shell (head/header/footer) wraps them.
 */

import { esc, richText, formatDate, readingTime, wordCount, truncate } from '../../lib/html.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import {
  section, sectionHead, grid, statsBar, trustBadges, priceCard, faqBlock,
  testimonialCard, aggregateRatingBlock, breadcrumbs, ctaBand, processTimeline,
  checkList, notIncludedList, comparisonTable, paragraphs, articleMeta, linkCloud,
  coverArt, pagination, featureCard,
} from '../components.js';
import { hero, leadForm, inlineCta, auditCallout, regionSwitcher } from '../hero.js';
import { Service, SERVICE_BY_SLUG, PAGE_SERVICES, servicesByCategory } from '../../data/services.js';
import { Package } from '../../data/packages.js';
import { Country, City, COUNTRIES, PREFIXED_COUNTRIES } from '../../data/regions.js';
import { PortfolioProject, Testimonial, PORTFOLIO, testimonialsFor } from '../../data/clients.js';
import { INDUSTRIES, INDUSTRY_BY_SLUG } from '../../data/industries.js';
import { ServiceCopy } from '../../content/service-copy.js';
import { hreflangFor, inPhrase, locationLabel, locationPrefix, resolveChild, resolveServiceLink, resolveStatic, resolveToolLink, supportKeyword, url } from '../../lib/routing.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared page model
// ─────────────────────────────────────────────────────────────────────────────

export interface PageModel {
  path: string;
  prefix: string;
  hue: number;
  crumbs: { name: string; url: string }[];
  service: Service;
  country: Country;
  city?: City;
  packages: Package[];
  price: (usd: number, pkgId?: string) => string;
  priceSchema: (usd: number) => { amount: number; currency: string; display: string };
  copy: ServiceCopy;
  faqs: { q: string; a: string }[];
  testimonials: Testimonial[];
  portfolio: PortfolioProject[];
  relatedPosts: { slug: string; title: string; excerpt: string; date: string; reading: number; prefix: string }[];
  relatedCaseStudies: { slug: string; title: string; excerpt: string; metric: string; prefix: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE PAGE
// ─────────────────────────────────────────────────────────────────────────────

export function servicePage(m: PageModel): string {
  const { service, country, city, packages, price, copy, faqs, testimonials, portfolio, prefix, path } = m;
  const loc = city || country;
  const locLabel = city ? `${city.name}, ${country.longName}` : country.longName;
  const localKw = city
    ? `${service.primaryKeyword} in ${city.name}`
    : country.slug
      ? `${service.primaryKeyword} in ${country.longName}`
      : service.primaryKeyword;
  const entryDisplay = price(service.fromPrice);
  const isHomeService = service.slug === '';

  const partnerLink =
    country.code === 'GB'
      ? `<p class="text-sm text-muted leading-relaxed mt-6">For businesses comparing UK web design partners, it is also worth looking at <a href="${esc(SITE.partner.url)}" class="font-semibold underline" style="color:var(--brand)" rel="noopener noreferrer" target="_blank">${esc(SITE.partner.label)}</a>, who specialise purely in website design for the UK market — a useful second opinion when you are scoping a project.</p>`
      : '';

  return `
${breadcrumbs(m.crumbs)}

${hero({
  eyebrow: city ? `${service.category} · ${city.name}` : country.slug ? `${service.category} · ${country.longName}` : `${service.category} · Trusted since ${SITE.founded}`,
  h1Prefix: service.primaryKeyword,
  h1Emphasis: city ? ` in ${city.name}` : country.slug ? ` in ${country.longName}` : undefined,
  sub: `<strong>${esc(service.tagline)}</strong> Packages from <strong>${esc(entryDisplay)}</strong>. Fixed price, unlimited revisions, and delivery in as little as 5 business days${city ? ` for ${esc(city.name)} businesses` : ''}.`,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: service.auditOffer ? 'Get a Free Audit' : 'See Packages',
  secondaryHref: service.auditOffer ? resolveStatic(prefix, 'free-audit') : `${path}#packages`,
  chips: ['Fixed price', 'Unlimited revisions', `${service.timeline} delivery`, 'You own everything'],
  variant: 'service',
})}

${section({
  children: `${statsBar()}
  <div class="mt-8">${trustBadges()}</div>`,
  tight: true,
})}

${section({
  children: `
    <div class="grid lg:grid-cols-12 gap-10">
      <div class="lg:col-span-7">
        <div class="reveal">
          <div class="eyebrow mb-4">Overview</div>
          <div class="prose">${paragraphs(copy.intro)}</div>
          ${partnerLink}
        </div>

        <h2 id="deliverables" class="h2 mt-14 reveal">What is included in our ${esc(service.primaryKeyword.toLowerCase())}</h2>
        <p class="lead mt-4 reveal">Every engagement ships with these as standard. No line item, no surprise add-on invoice.</p>
        <div class="mt-7 reveal">${checkList(service.deliverables, 2)}</div>
      </div>

      <div class="lg:col-span-5">
        <div class="lg:sticky" style="top:calc(var(--header-h) + 22px)">
          ${leadForm({
            service: service.slug,
            region: locLabel,
            heading: `Get a fixed quote for ${service.primaryKeyword.toLowerCase()}`,
            sub: `Tell us what you need and we will come back within one business day with a written scope, a fixed price and a delivery date${city ? ` for ${city.name}` : ''}.`,
            showServiceSelect: false,
            compact: true,
          })}
        </div>
      </div>
    </div>
  `,
  id: 'overview',
  labelledBy: 'deliverables',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Why clients choose us',
    h2: `<span id="exact-primary-h2">${esc(localKw)}</span>`,
    sub: `Six things that make the difference between a site that ships and a site that works. Here is how we approach <strong>${esc(localKw.toLowerCase())}</strong>.`,
    align: 'left',
  })}
  ${grid(3, copy.valueProps.map((v, i) =>
    featureCard({ icon: ['gem', 'bolt', 'refresh', 'layout', 'search', 'key', 'star', 'chart'][i % 8], title: v.title, body: v.body, delay: i * 60 })
  ).join(''))}`,
  id: 'why-us',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'How it works',
    h2: `Our ${esc(service.name.toLowerCase())} process, step by step`,
    sub: 'No black boxes. You always know what is happening, what we need from you, and what happens next.',
  })}
  ${processTimeline(copy.processSteps)}`,
  id: 'process',
})}

${service.auditOffer ? section({
  children: auditCallout({
    serviceName: `${service.auditOffer.title}${city ? ` — ${city.name}` : ''}`,
    bullets: service.auditOffer.bullets,
    href: resolveStatic(prefix, 'free-audit'),
    region: locLabel,
  }),
  id: 'free-audit',
}) : ''}

${section({
  children: `${sectionHead({
    eyebrow: 'Pricing',
    h2: `${esc(service.name)} packages and pricing`,
    sub: `Fixed prices in <strong>${esc(country.currency)}</strong>${country.code !== 'US' ? ` (converted from our USD price book, ${esc(country.name)} local market rates)` : ''}. Every package below is a complete, sellable package — no hourly billing, no open-ended scope.`,
  })}
  ${pricingTable(m)}
  <p class="text-xs text-faint mt-6 text-center max-w-3xl mx-auto leading-relaxed">
    Prices exclude third-party costs such as hosting, premium themes, stock imagery, paid media spend and app subscriptions. We list every required cost up front and buy it at cost on your behalf — we never mark up vendor invoices.
  </p>`,
  id: 'packages',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Compare',
    h2: `Which ${esc(service.name.toLowerCase())} package is right for you?`,
    sub: 'A side-by-side comparison so you can pick a tier without a sales call.',
  })}
  ${packageComparison(m)}`,
  id: 'compare',
})}

${section({
  children: `
    <div class="grid lg:grid-cols-12 gap-10">
      <div class="lg:col-span-7">
        <h2 id="local-proof" class="h2 reveal">${esc(localKw)} for ${esc(city ? city.name : country.longName)} businesses</h2>
        <div class="prose mt-5">${paragraphs(copy.local)}</div>
        <div class="prose mt-6">${paragraphs(copy.industry)}</div>
      </div>
      <div class="lg:col-span-5">
        <div class="panel">
          <h3 class="h4 mb-4">Industries we serve in ${esc(city ? city.name : country.longName)}</h3>
          <div class="flex flex-wrap gap-2 mb-6">
            ${service.industries
              .map((i) => {
                const ind = INDUSTRY_BY_SLUG[i.toLowerCase().replace(/[^a-z0-9]+/g, '-')] || INDUSTRY_BY_SLUG[i.split(' ')[0].toLowerCase()];
                return ind
                  ? `<a href="${esc(resolveChild(prefix, 'industries', ind.slug))}" class="chip transition-colors hover:border-[color:var(--brand)]">${esc(ind.name)}</a>`
                  : `<span class="chip">${esc(i)}</span>`;
              })
              .join('')}
          </div>
          <div class="divider mb-5"></div>
          <h3 class="h4 mb-3">Fast facts</h3>
          <dl class="space-y-2.5 text-sm">
            ${[
              ['Starting price', entryDisplay],
              ['Typical delivery', service.timeline],
              ['Revisions', 'Unlimited on the chosen direction'],
              ['Ownership', 'Full transfer on final payment'],
              ['Support', '30 days included on one-time builds'],
              ['Currencies accepted', 'PayPal, card, bank transfer, USDC/BTC/ETH'],
            ]
              .map(([k, v]) => `<div class="flex justify-between gap-4"><dt class="text-faint">${esc(k)}</dt><dd class="text-right font-medium">${esc(v)}</dd></div>`)
              .join('')}
          </dl>
        </div>
        <div class="mt-5">
          ${regionSwitcher({ country, city, currentSlug: country.slug, serviceSlug: service.slug, countries: COUNTRIES })}
        </div>
      </div>
    </div>
  `,
  id: 'local',
})}

${portfolioSection(m)}

${testimonialSection(m)}

${section({
  children: `${sectionHead({
    eyebrow: 'Questions',
    h2: `${esc(service.primaryKeyword)} — frequently asked questions`,
    sub: `Straight answers to the questions we are asked most${city ? ` by ${city.name}` : country.slug ? ` in ${country.longName}` : ''}. If yours is not here, ask us directly.`,
  })}
  ${faqBlock(faqs, 'faq')}`,
  id: 'faq',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'What is not included',
    h2: 'Clear boundaries, stated up front',
    sub: 'We publish exclusions because vague scope is how projects go wrong. Better to know now.',
  })}
  ${notIncludedList(copy.notIncluded)}
  <div class="mt-8">${aggregateRatingBlock()}</div>`,
  id: 'not-included',
  tight: true,
})}

${relatedSection(m)}

${section({
  children: `${sectionHead({
    eyebrow: 'Latest thinking',
    h2: `${esc(service.name)} guides and insights`,
    sub: 'Practical writing on cost, process and getting a better result — updated regularly.',
  })}
  ${postGrid(m.relatedPosts)}`,
  id: 'resources',
})}

${section({
  children: ctaBand({
    title: `Ready to start your ${esc(service.name.toLowerCase())} project?`,
    body: `Tell us what you need and we will send back a fixed price, a written scope and a delivery date within one business day${city ? ` — for ${esc(city.name)}` : ''}. No obligation, no sales pressure.`,
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: `${path}#packages`,
  }),
  tight: true,
})}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing table
// ─────────────────────────────────────────────────────────────────────────────

function pricingTable(m: PageModel): string {
  const { packages, price, service, prefix } = m;
  const wasMap: Record<string, number> = {};
  // SEO/PPC packages show the pre-discount price where we have one.
  const seoOriginals: Record<string, number> = {
    'seo-booster': 299, 'seo-retainer': 499, 'seo-geo-aeo': 499,
    'seo-local': 599, 'seo-ecommerce': 899,
    'ppc-startup': 299, 'ppc-ongoing': 499,
  };

  const cards = packages
    .map((p, i) => {
      const isMonthly = p.period === 'monthly';
      const was = seoOriginals[p.id];
      return priceCard({
        id: `pkg-${p.id}`,
        name: p.name,
        priceDisplay: price(p.usd, p.id),
        periodLabel: isMonthly ? 'per month' : 'one-time',
        suited: p.suited,
        features: p.features,
        eta: p.eta,
        units: p.units,
        badge: p.badge,
        was: was ? price(was, p.id) : undefined,
        ctaHref: resolveStatic(prefix, 'checkout', p.sku),
        featured: i === Math.min(1, packages.length - 1),
      });
    })
    .join('');

  return `<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">${cards}</div>
  <p class="text-center text-sm text-muted mt-7 reveal">
    Need something not covered here? <a href="${esc(resolveStatic(prefix, 'contact'))}" class="font-semibold underline" style="color:var(--brand)">Request a custom quote</a> — we scope and price within one business day.
  </p>`;
}

function packageComparison(m: PageModel): string {
  const { packages, service } = m;
  const cols = packages.slice(0, 6);
  if (cols.length < 2) return '';

  const rows = [
    { label: 'Delivery time', values: cols.map((p) => p.eta) },
    { label: 'Pages / scope', values: cols.map((p) => p.units || 'Scoped individually') },
    { label: 'Custom design (no template)', values: cols.map(() => true) },
    { label: 'Mobile responsive', values: cols.map(() => true) },
    { label: 'CMS included', values: cols.map((_, i) => i >= 1) },
    { label: 'On-page SEO setup', values: cols.map((_, i) => i >= 0) },
    { label: 'Structured data / schema', values: cols.map((_, i) => i >= 2) },
    { label: 'Core Web Vitals optimisation', values: cols.map((_, i) => i >= 1) },
    { label: 'Third-party integrations', values: cols.map((_, i) => i >= 2) },
    { label: 'Unlimited revisions', values: cols.map(() => true) },
    { label: 'Post-launch support', values: cols.map((p) => (p.period === 'monthly' ? 'Ongoing' : p.eta.includes('Ongoing') ? 'Ongoing' : i30(p))) },
    { label: 'Full ownership transfer', values: cols.map(() => true) },
  ];

  return comparisonTable({
    rows,
    columns: cols.map((p) => p.name),
    highlightIndex: 1,
    caption: `${service.name} package comparison`,
  });
}

function i30(p: Package): string {
  return p.units && p.units.includes('35') ? '6 months' : p.units && p.units.includes('20') ? '90 days' : p.units && p.units.includes('10') ? '60 days' : '30 days';
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared blocks
// ─────────────────────────────────────────────────────────────────────────────

function portfolioSection(m: PageModel): string {
  if (!m.portfolio.length) return '';
  return section({
    children: `${sectionHead({
      eyebrow: 'Selected work',
      h2: `${esc(m.service.name)} projects we have delivered`,
      sub: 'Real client work with real numbers. Every result below was measured after launch.',
    })}
    ${grid(3, m.portfolio.map((p, i) => portfolioCard(p, m.prefix, i)).join(''))}
    <div class="text-center mt-9 reveal"><a href="${esc(resolveStatic(m.prefix, 'portfolio'))}" class="btn btn-ghost">See the full portfolio ${icon('arrow', 'w-4 h-4', 2.2)}</a></div>`,
    id: 'portfolio',
  });
}

export function portfolioCard(p: PortfolioProject, prefix: string, i = 0): string {
  return `<a href="${esc(resolveStatic(prefix, 'portfolio', p.slug))}" class="block h-full reveal" style="transition-delay:${i * 70}ms">
    <article class="card card-hover card-glow h-full flex flex-col overflow-hidden" itemscope itemtype="https://schema.org/CreativeWork">
      ${coverArt({ style: p.coverStyle, palette: p.palette, title: p.title, alt: `${p.title} — ${p.client} project by ${SITE.name}`, lazy: i > 0 })}
      <div class="p-5 flex flex-col flex-1">
        <div class="text-[0.7rem] font-bold uppercase tracking-wider mb-2" style="color:var(--brand)">${esc(p.industry)}</div>
        <h3 class="h4 mb-2 leading-snug">${esc(p.title)}</h3>
        <p class="text-sm text-muted leading-relaxed flex-1">${esc(truncate(p.summary, 130))}</p>
        <div class="mt-4 pt-4 border-t flex items-center justify-between gap-2" style="border-color:var(--border)">
          <span class="text-xs text-faint">${esc(p.client)} · ${esc(p.location.split(',').slice(-1)[0].trim())}</span>
          <span class="text-xs font-bold" style="color:var(--ok)">${esc(p.results[0].metric)}: ${esc(p.results[0].value)}</span>
        </div>
      </div>
    </article>
  </a>`;
}

function testimonialSection(m: PageModel): string {
  if (!m.testimonials.length) return '';
  return section({
    children: `${sectionHead({
      eyebrow: 'Client reviews',
      h2: `What ${esc(m.service.name.toLowerCase())} clients say about working with us`,
      sub: `${SITE.rating.value} out of 5 from ${SITE.rating.count} verified client reviews across ${SITE.stats.countriesServed} countries.`,
    })}
    ${grid(3, m.testimonials.slice(0, 3).map((t, i) => testimonialCard(t, i)).join(''))}
    <div class="mt-8">${aggregateRatingBlock()}</div>`,
    id: 'reviews',
  });
}

function relatedSection(m: PageModel): string {
  const { service } = m;
  const related = service.related
    .map((s) => SERVICE_BY_SLUG[s])
    .filter(Boolean)
    .filter((s) => s.slug !== '' || true);

  return section({
    children: `${sectionHead({
      eyebrow: 'Related services',
      h2: 'Services that pair well with this one',
      align: 'left',
    })}
    ${grid(3, related.slice(0, 6).map((s, i) => {
      const href = s.slug === '' ? url(m.prefix) : resolveServiceLink(m.prefix, s.slug);
      return `<a href="${esc(href)}" class="block h-full reveal" style="transition-delay:${i * 50}ms;--hue:${s.hue}">
        <div class="card card-hover p-5 h-full flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:hsla(${s.hue},90%,58%,.14);border:1px solid hsla(${s.hue},90%,58%,.28);color:hsl(${s.hue},90%,62%)">${icon(s.icon, 'w-5 h-5')}</div>
          <div class="min-w-0">
            <h3 class="font-bold text-sm mb-1">${esc(s.name)}</h3>
            <p class="text-xs text-muted leading-relaxed">${esc(truncate(s.tagline, 80))}</p>
          </div>
        </div>
      </a>`;
    }).join(''))}`,
    tight: true,
  });
}

export function postGrid(posts: PageModel['relatedPosts']): string {
  if (!posts.length) return `<p class="text-sm text-faint text-center">New guides are published every week.</p>`;
  return grid(3, posts.map((p, i) => postCard(p, i)).join(''));
}

export function postCard(p: { slug: string; title: string; excerpt: string; date: string; reading: number; prefix: string; category?: string }, i = 0): string {
  return `<a href="${esc(resolveStatic(p.prefix, 'blog', p.slug))}" class="block h-full reveal" style="transition-delay:${i * 60}ms">
    <article class="card card-hover card-glow h-full p-5 flex flex-col" itemscope itemtype="https://schema.org/BlogPosting">
      ${p.category ? `<span class="chip chip-brand text-xs mb-3 self-start">${esc(p.category)}</span>` : ''}
      <h3 class="h4 mb-2 leading-snug">${esc(p.title)}</h3>
      <p class="text-sm text-muted leading-relaxed flex-1">${esc(truncate(p.excerpt, 120))}</p>
      <div class="mt-4 pt-3.5 border-t flex items-center justify-between text-xs text-faint" style="border-color:var(--border)">
        <span>${esc(formatDate(p.date))}</span>
        <span>${p.reading} min read</span>
      </div>
    </article>
  </a>`;
}

export function caseStudyCard(c: { slug: string; title: string; excerpt: string; metric: string; prefix: string; industry?: string; location?: string }, i = 0): string {
  return `<a href="${esc(resolveStatic(c.prefix, 'case-studies', c.slug))}" class="block h-full reveal" style="transition-delay:${i * 70}ms">
    <article class="card card-hover card-glow h-full p-5 flex flex-col" itemscope itemtype="https://schema.org/Article">
      <div class="flex items-center gap-2 mb-3 flex-wrap">
        ${c.industry ? `<span class="chip text-xs">${esc(c.industry)}</span>` : ''}
        ${c.location ? `<span class="text-[0.7rem] text-faint">${esc(c.location)}</span>` : ''}
      </div>
      <h3 class="h4 mb-2 leading-snug">${esc(c.title)}</h3>
      <p class="text-sm text-muted leading-relaxed flex-1">${esc(truncate(c.excerpt, 130))}</p>
      <div class="mt-4 pt-3.5 border-t flex items-center gap-2 text-xs font-bold" style="border-color:var(--border);color:var(--ok)">
        ${icon('chart', 'w-3.5 h-3.5', 2.4)} ${esc(c.metric)}
      </div>
    </article>
  </a>`;
}
