/**
 * Article, collection and utility page templates.
 */

import { esc, richText, formatDate, truncate, slugify } from '../../lib/html.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import {
  section, sectionHead, grid, breadcrumbs, ctaBand, faqBlock, testimonialCard,
  aggregateRatingBlock, coverArt, pagination, priceCard, checkList, linkCloud,
  comparisonTable, trustBadges, statsBar, paragraphs, articleMeta,
} from '../components.js';
import { leadForm, inlineCta, hero } from '../hero.js';
import { postCard, portfolioCard, caseStudyCard } from './service.js';
import { GeneratedPost } from '../../content/posts.js';
import { locationLabel, resolveServiceLink, resolveStatic, resolveToolLink, url } from '../../lib/routing.js';
import { PortfolioProject, Testimonial } from '../../data/clients.js';
import { Service } from '../../data/services.js';

// ─────────────────────────────────────────────────────────────────────────────
// Blog post
// ─────────────────────────────────────────────────────────────────────────────

export function articlePage(args: {
  post: GeneratedPost;
  crumbs: { name: string; url: string }[];
  related: GeneratedPost[];
  prefix: string;
  hue: number;
  /** Schema for the author. */
  authorProfile: { name: string; role: string; bio: string };
}): string {
  const { post, crumbs, related, prefix } = args;
  const m = post.meta;

  const toc = post.blocks
    .filter((b) => b.level === 2 && b.id !== 'quick-answer')
    .map((b) => `<a href="#${b.id}">${esc(b.text)}</a>`)
    .join('');

  const body = post.blocks
    .map((b) => {
      if (b.level === 2) return `<h2 id="${b.id}">${esc(b.text)}</h2>`;
      if (b.level === 3) return `<h3 id="${b.id}">${esc(b.text)}</h3>`;
      if (b.id === 'quick-answer') {
        return `<div class="card p-6 my-7" style="border-color:rgba(34,211,238,.3);background:rgba(34,211,238,.045)">
          <div class="eyebrow mb-3">Quick answer</div>
          <p class="text-base leading-relaxed m-0" style="color:#d7e0f4">${richText(b.text)}</p>
        </div>`;
      }
      if (b.id === 'summary') {
        return `<p class="text-lg leading-relaxed font-medium" style="color:var(--brand)">${richText(b.text)}</p>`;
      }
      return `<p id="${b.id}">${richText(b.text)}</p>`;
    })
    .join('\n      ');

  return `
${breadcrumbs(crumbs)}

<article itemscope itemtype="https://schema.org/BlogPosting">
  <header class="container pt-10 pb-8">
    <div class="max-w-3xl">
      <div class="flex flex-wrap items-center gap-2 mb-5">
        <a href="${esc(resolveStatic(prefix, 'blog'))}" class="chip chip-brand hover:underline">${esc(m.category)}</a>
        ${m.tags.slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
      </div>
      <h1 class="h1" itemprop="headline">${esc(m.title)}</h1>
      <p class="lead mt-5" itemprop="description">${esc(m.excerpt)}</p>
      <div class="mt-7 pt-6 border-t" style="border-color:var(--border)">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0" style="background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#04070f" aria-hidden="true">${esc(m.author.split(' ').map((n) => n[0]).join(''))}</div>
          <div>
            <div class="font-semibold text-sm" itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${esc(m.author)}</span></div>
            <div class="text-xs text-faint">${esc(m.authorRole)}</div>
          </div>
          <div class="text-xs text-faint flex items-center gap-3 flex-wrap">
            <time itemprop="datePublished" datetime="${esc(m.date)}">${esc(formatDate(m.date))}</time>
            <span aria-hidden="true">·</span>
            <span>${m.reading} min read</span>
            <span aria-hidden="true">·</span>
            <span>${m.words.toLocaleString()} words</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="container pb-16">
    <div class="grid lg:grid-cols-12 gap-10">
      <aside class="lg:col-span-3 order-2 lg:order-1">
        <div class="toc">
          <h2 class="text-xs font-bold uppercase tracking-[0.12em] mb-3" style="color:var(--faint)">On this page</h2>
          ${toc}
          <div class="mt-8 p-5 card">
            <h3 class="font-bold text-sm mb-2">Need help with this?</h3>
            <p class="text-xs text-muted leading-relaxed mb-4">Get a fixed price and delivery date within one business day.</p>
            <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary btn-sm w-full">Get a Free Quote</a>
          </div>
        </div>
      </aside>

      <div class="lg:col-span-8 order-1 lg:order-2">
        <div class="prose article" itemprop="articleBody">
      ${body}
        </div>

        ${post.takeaways.length ? `
        <div class="card p-6 mt-10" style="--hue:150">
          <h2 class="h3 mb-4 flex items-center gap-2">${icon('check-circle', 'w-5 h-5', 2)} Key takeaways</h2>
          <ul class="space-y-2.5" role="list">
            ${post.takeaways.map((t) => `<li class="flex gap-2.5 text-sm text-[#c3cee6] leading-relaxed"><span class="shrink-0 mt-0.5" style="color:var(--ok)">${icon('check', 'w-4 h-4', 2.6)}</span><span>${richText(t)}</span></li>`).join('')}
          </ul>
        </div>` : ''}

        <div class="panel mt-8 flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm text-muted">
            <div class="font-semibold text-[#e8eefc] mb-1">Written by ${esc(m.author)}</div>
            <div class="text-xs">${esc(args.authorProfile.bio)}</div>
          </div>
          <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-ghost btn-sm">Talk to a strategist</a>
        </div>

        <div class="mt-10">
          <h2 class="h3 mb-4">${esc(m.category)} FAQs</h2>
          ${faqBlock(post.faqs)}
        </div>

        <div class="mt-8">${trustBadges(true)}</div>
      </div>
    </div>
  </div>
</article>

${related.length ? section({
  children: `${sectionHead({
    eyebrow: 'Keep reading',
    h2: 'Related guides',
    align: 'left',
  })}
  ${grid(3, related.map((p, i) => postCard({
    slug: p.meta.slug, title: p.meta.title, excerpt: p.meta.excerpt,
    date: p.meta.date, reading: p.meta.reading, prefix: p.prefix, category: p.meta.category,
  }, i)).join(''))}`,
  tight: true,
}) : ''}

${section({
  children: `<div class="grid lg:grid-cols-2 gap-10 items-start">
    ${leadForm({
      service: post.serviceSlug,
      region: post.locationLabel,
      heading: 'Talk to a real strategist',
      sub: 'No sales script, no obligation. Tell us what you are working on and we will tell you honestly what we would do.',
      compact: true,
    })}
    <div>
      <h2 class="h2 mb-4">Related services</h2>
      <div class="space-y-2.5">
        ${post.internalLinks.map((l) => `<a href="${esc(l.url)}" class="trust-badge w-full justify-between">${esc(l.text)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>`).join('')}
      </div>
    </div>
  </div>`,
  tight: true,
})}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Collection pages
// ─────────────────────────────────────────────────────────────────────────────

export function blogIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  posts: { slug: string; title: string; excerpt: string; date: string; reading: number; prefix: string; category?: string }[];
  page: number;
  totalPages: number;
  hue: number;
  category?: string;
  categories: { name: string; count: number; url: string; value: string }[];
  service?: Service;
}): string {
  const { prefix, crumbs, heading, sub, posts, page, totalPages, categories } = args;

  return `
${breadcrumbs(crumbs)}

${hero({
  eyebrow: `${posts.length}+ guides · Updated weekly`,
  h1Prefix: heading,
  sub,
  primaryLabel: 'Get a Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Packages',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}

${section({
  children: `${sectionHead({
    eyebrow: args.category ? 'Category' : 'Latest guides',
    h2: args.category ? `${args.category} articles` : (page > 1 ? `Latest guides — page ${page}` : 'Latest guides'),
    sub: args.category
      ? `Every ${String(args.category).toLowerCase()} guide we publish, updated as the practice changes.`
      : 'Practical guides written by the people doing the work. No filler, no recycled filler.',
    align: 'left',
  })}
  ${categories.length ? `<div class="flex flex-wrap gap-2 mb-10 reveal" role="list">
    ${categories.map((c) => `<a href="${esc(c.url)}" data-filter-chip="blog" class="chip transition-colors hover:border-[color:var(--brand)]" data-value="${esc(c.value)}">${esc(c.name)} <span class="text-faint">${c.count}</span></a>`).join('')}
    <span class="chip chip-brand hidden" id="activeFilter"></span>
  </div>` : ''}
  ${posts.length ? grid(3, posts.map((p, i) => `<div data-filterable="blog" data-filter-value="${esc(p.category || '')}">${postCard(p, i)}</div>`).join('')) : `<p class="text-center text-muted">No posts in this category yet.</p>`}
  ${pagination(page, totalPages, (n) => resolveStatic(prefix, 'blog', n > 1 ? `page/${n}` : ''))}
  ${posts.length ? '' : ''}
  <div class="mt-14">${leadForm({
    variant: 'contact',
    heading: 'Get practical answers, not sales emails',
    sub: 'Tell us what you are working on. We will send you a straight answer plus the specific service that would actually move it.',
    compact: true,
  })}</div>`,
})}`;
}

export function caseStudyIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  studies: Parameters<typeof caseStudyCard>[0][];
  hue: number;
}): string {
  const { prefix, crumbs, heading, sub, studies } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Real results · Measured after launch',
  h1Prefix: heading,
  sub,
  primaryLabel: 'Start My Project',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Portfolio',
  secondaryHref: resolveStatic(prefix, 'portfolio'),
})}
${section({
  children: `${sectionHead({
    eyebrow: 'Results',
    h2: 'The work, and what it produced',
    sub: 'Each one below states the challenge, what we did about it, and the result we can evidence.',
    align: 'left',
  })}
  ${grid(3, studies.map((c, i) => caseStudyCard(c, i)).join(''))}
  <div class="mt-14">${statsBar()}</div>`,
})}`;
}

export function portfolioIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  projects: PortfolioProject[];
  hue: number;
  filters: { name: string; count: number; url: string; value: string }[];
  /** Market-specific framing so every country page reads differently. */
  localIntro?: string;
  /** Industries this market buys most often. */
  focus?: string[];
}): string {
  const { prefix, crumbs, heading, sub, projects, filters } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Selected work · 2,400+ projects delivered',
  h1Prefix: heading,
  sub,
  primaryLabel: 'Start My Project',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'See Packages',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}
${section({
  children: `${sectionHead({
    eyebrow: 'Portfolio',
    h2: 'Selected projects',
    sub: 'Live projects with real outcomes. Every metric below was measured after launch.',
    align: 'left',
  })}
  ${filters.length ? `<div class="flex flex-wrap gap-2 mb-10 reveal" role="list">
    ${filters.map((f) => `<a href="${esc(f.url)}" data-filter-chip="industry" class="chip transition-colors hover:border-[color:var(--brand)]" data-value="${esc(f.value)}">${esc(f.name)} <span class="text-faint">${f.count}</span></a>`).join('')}
    <span class="chip chip-brand hidden" id="activeFilter"></span>
  </div>` : ''}
  ${args.localIntro ? `<p class="lead max-w-3xl mb-8 reveal">${esc(args.localIntro)}</p>` : ''}
  ${args.focus?.length ? `<div class="flex flex-wrap gap-2 mb-10 reveal" role="list" aria-label="Sectors we deliver most in this market">
    ${args.focus.map((f) => `<span class="chip chip-brand">${esc(f)}</span>`).join('')}
  </div>` : ''}
  ${grid(3, projects.map((p, i) => `<div data-filterable="industry" data-filter-value="${esc(p.industry)}">${portfolioCard(p, prefix, i)}</div>`).join(''))}
  <div class="mt-14">${aggregateRatingBlock()}</div>`,
})}`;
}

export function portfolioDetailPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  project: PortfolioProject;
  related: PortfolioProject[];
  hue: number;
}): string {
  const { prefix, crumbs, project, related } = args;
  return `
${breadcrumbs(crumbs)}
<header class="container pt-10 pb-8">
  <div class="max-w-4xl">
    <div class="flex flex-wrap items-center gap-2 mb-5">
      <span class="chip chip-brand">${esc(project.industry)}</span>
      <span class="chip">${icon('pin', 'w-3 h-3', 2.4)} ${esc(project.location)}</span>
      <span class="chip">${project.year}</span>
    </div>
    <h1 class="h1">${esc(project.title)}</h1>
    <p class="lead mt-5">${esc(project.summary)}</p>
  </div>
</header>
${section({ children: coverArt({ style: project.coverStyle, palette: project.palette, title: project.title, alt: `${project.title} — ${project.client}`, ratio: 'ratio-16-9', lazy: false }), tight: true })}
${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <h2 class="h2 mb-4">The challenge</h2>
      <div class="prose"><p>${richText(project.challenge)}</p></div>
      <h2 class="h2 mt-10 mb-4">Our approach</h2>
      <div class="prose"><p>${richText(project.approach)}</p></div>
      <h2 class="h2 mt-10 mb-5">The results</h2>
      ${checkList(project.results.map((r) => `**${r.metric}:** ${r.value}`), 1)}
      <h2 class="h2 mt-10 mb-4">Tools and technologies</h2>
      <div class="flex flex-wrap gap-2">${project.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
    </div>
    <div class="lg:col-span-5">
      <div class="lg:sticky" style="top:calc(var(--header-h) + 22px)">
        <div class="panel">
          <h3 class="h4 mb-4">Project details</h3>
          <dl class="space-y-3 text-sm">
            ${[['Client', project.client], ['Industry', project.industry], ['Location', project.location], ['Year', String(project.year)], ['Services', project.serviceSlugs.map((s) => s.replace(/-/g, ' ')).join(', ')]].map(([k, v]) => `<div><dt class="text-faint text-xs mb-0.5">${esc(k)}</dt><dd class="m-0 font-medium">${esc(v)}</dd></div>`).join('')}
          </dl>
          <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary w-full mt-6">Start a similar project</a>
        </div>
      </div>
    </div>
  </div>`,
})}
${related.length ? section({
  children: `${sectionHead({ eyebrow: 'More work', h2: 'Related projects', align: 'left' })}
  ${grid(3, related.map((p, i) => portfolioCard(p, prefix, i)).join(''))}`,
  tight: true,
}) : ''}`;
}

export function caseStudyDetailPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  study: {
    slug: string; title: string; client: string; industry: string; location: string;
    year: number; summary: string; challenge: string; approach: string;
    results: { metric: string; value: string }[]; stack: string[];
    services: string[]; palette: [string, string, string]; coverStyle: string;
  };
  related: Parameters<typeof caseStudyCard>[0][];
  hue: number;
}): string {
  const { prefix, crumbs, study, related } = args;
  return `
${breadcrumbs(crumbs)}
<header class="container pt-10 pb-8">
  <div class="max-w-4xl">
    <div class="flex flex-wrap items-center gap-2 mb-5">
      <span class="chip chip-brand">${esc(study.industry)}</span>
      <span class="chip">${icon('pin', 'w-3 h-3', 2.4)} ${esc(study.location)}</span>
      <span class="chip">${study.year}</span>
    </div>
    <h1 class="h1">${esc(study.title)}</h1>
    <p class="lead mt-5">${esc(study.summary)}</p>
  </div>
</header>
${section({ children: coverArt({ style: study.coverStyle, palette: study.palette, title: study.title, alt: study.title, lazy: false }), tight: true })}
${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <h2 class="h2 mb-4">The challenge</h2>
      <div class="prose"><p>${richText(study.challenge)}</p></div>
      <h2 class="h2 mt-10 mb-4">Our approach</h2>
      <div class="prose"><p>${richText(study.approach)}</p></div>
      <h2 class="h2 mt-10 mb-5">The results</h2>
      ${grid(2, study.results.map((r) => `<div class="card p-5 text-center">
        <div class="text-3xl font-extrabold mb-1" style="font-family:Sora,sans-serif;color:var(--brand)">${esc(r.value)}</div>
        <div class="text-xs text-faint">${esc(r.metric)}</div>
      </div>`).join(''))}
      <h2 class="h2 mt-10 mb-4">Stack</h2>
      <div class="flex flex-wrap gap-2">${study.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
    </div>
    <div class="lg:col-span-5">
      <div class="lg:sticky" style="top:calc(var(--header-h) + 22px)">
        <div class="panel mb-5">
          <h3 class="h4 mb-4">Project details</h3>
          <dl class="space-y-3 text-sm">
            ${[['Client', study.client], ['Industry', study.industry], ['Location', study.location], ['Services', study.services.join(', ')]].map(([k, v]) => `<div><dt class="text-faint text-xs mb-0.5">${esc(k)}</dt><dd class="m-0 font-medium">${esc(v)}</dd></div>`).join('')}
          </dl>
        </div>
        ${leadForm({ service: '', region: study.location, heading: 'Get results like these', sub: 'Tell us about your project and we will send a fixed price and delivery date within one business day.', compact: true })}
      </div>
    </div>
  </div>`,
})}
${related.length ? section({
  children: `${sectionHead({ eyebrow: 'More results', h2: 'Other case studies', align: 'left' })}
  ${grid(3, related.map((c, i) => caseStudyCard(c, i)).join(''))}`,
  tight: true,
}) : ''}`;
}

export function galleryPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  items: { title: string; palette: [string, string, string]; style: string; alt: string; service: string }[];
  hue: number;
}): string {
  const { prefix, crumbs, heading, sub, items } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Design gallery',
  h1Prefix: heading,
  sub,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Portfolio',
  secondaryHref: resolveStatic(prefix, 'portfolio'),
})}
${section({
  children: `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    ${items.map((it, i) => `<figure class="card card-hover overflow-hidden reveal" style="transition-delay:${(i % 6) * 55}ms">
      ${coverArt({ style: it.style, palette: it.palette, title: it.title, alt: it.alt, lazy: i > 2 })}
      <figcaption class="p-4">
        <div class="font-semibold text-sm">${esc(it.title)}</div>
        <div class="text-xs text-faint mt-0.5">${esc(it.service)}</div>
      </figcaption>
    </figure>`).join('')}
  </div>`,
})}`;
}

export function servicesIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  groups: { category: string; services: Service[] }[];
  price: (usd: number, pkgId?: string) => string;
  hue: number;
}): string {
  const { prefix, crumbs, heading, sub, groups, price } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `${groups.reduce((n, g) => n + g.services.length, 0)} services · Fixed prices`,
  h1Prefix: heading,
  sub,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'Compare Packages',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}
${groups.map((g) => section({
  children: `${sectionHead({ eyebrow: g.category, h2: `${g.category} Services`, align: 'left' })}
  ${grid(4, g.services.map((s, i) => {
    const href = s.slug === '' ? url(prefix) : resolveServiceLink(prefix, s.slug);
    return `<a href="${esc(href)}" class="block h-full reveal" style="transition-delay:${(i % 4) * 50}ms;--hue:${s.hue}">
      <div class="card card-hover card-glow p-5 h-full flex flex-col">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:hsla(${s.hue},90%,58%,.14);border:1px solid hsla(${s.hue},90%,58%,.28);color:hsl(${s.hue},90%,62%)">${icon(s.icon, 'w-5 h-5')}</div>
        <h3 class="font-bold text-sm mb-1.5">${esc(s.name)}</h3>
        <p class="text-xs text-muted leading-relaxed flex-1">${esc(truncate(s.tagline, 90))}</p>
        <div class="mt-3 pt-3 border-t text-xs" style="border-color:var(--border)">
          <span class="text-faint">From </span><span class="font-bold" style="color:var(--brand)">${esc(price(s.fromPrice))}</span>
        </div>
      </div>
    </a>`;
  }).join(''))}`,
  tight: true,
})).join('')}
${section({
  children: ctaBand({
    title: 'Not sure which service you need?',
    body: 'Book a free 20-minute consultation. We will tell you honestly what you actually need — even if that is less than you came for.',
    primaryLabel: 'Book a Free Consultation',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'See All Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}

export function contactPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
  services: Service[];
  hue: number;
}): string {
  const { prefix, crumbs, heading, sub, services } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `We reply within one business day · ${SITE.contact.hours}`,
  h1Prefix: heading,
  sub,
  primaryLabel: 'Send My Details',
  primaryHref: '#contact-form',
  secondaryLabel: `Call ${SITE.contact.phone}`,
  secondaryHref: `tel:${SITE.contact.phoneE164}`,
})}
${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7" id="contact-form">
      ${leadForm({
        variant: 'contact',
        heading: 'Tell us about your project',
        sub: 'The more context you give, the more useful our first reply will be. If you are not sure what you need, say so — that is genuinely fine.',
        showServiceSelect: true,
        servicesList: services.map((s) => ({ slug: s.slug, name: s.name })),
      })}
    </div>
    <div class="lg:col-span-5">
      <div class="panel mb-5">
        <h2 class="h4 mb-4">Direct contact</h2>
        <ul class="space-y-4">
          <li><a href="mailto:${esc(SITE.contact.email)}" class="flex gap-3 group">
            <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('mail', 'w-5 h-5', 2)}</span>
            <span><span class="block text-xs text-faint">Primary email</span><span class="block text-sm break-all group-hover:underline">${esc(SITE.contact.email)}</span></span>
          </a></li>
          <li><a href="mailto:${esc(SITE.contact.officialEmail)}" class="flex gap-3 group">
            <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('mail', 'w-5 h-5', 2)}</span>
            <span><span class="block text-xs text-faint">Official contact</span><span class="block text-sm break-all group-hover:underline">${esc(SITE.contact.officialEmail)}</span></span>
          </a></li>
          <li><a href="tel:${esc(SITE.contact.phoneE164)}" class="flex gap-3 group">
            <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('phone', 'w-5 h-5', 2)}</span>
            <span><span class="block text-xs text-faint">Phone &amp; WhatsApp</span><span class="block text-sm group-hover:underline">${esc(SITE.contact.phone)}</span></span>
          </a></li>
          <li><a href="${esc(SITE.social.instagram)}" rel="me noopener noreferrer" target="_blank" class="flex gap-3 group">
            <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('instagram', 'w-5 h-5', 2)}</span>
            <span><span class="block text-xs text-faint">Instagram</span><span class="block text-sm group-hover:underline">@seoagency-usa</span></span>
          </a></li>
          <li><div class="flex gap-3">
            <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('pin', 'w-5 h-5', 2)}</span>
            <span><span class="block text-xs text-faint">Registered office</span><span class="block text-sm">${esc(SITE.contact.address.street)}<br>${esc(SITE.contact.address.city)}, ${esc(SITE.contact.address.region)} ${esc(SITE.contact.address.postalCode)}<br>United States</span></span>
          </div></li>
          <li><div class="flex gap-3">
            <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('clock', 'w-5 h-5', 2)}</span>
            <span><span class="block text-xs text-faint">Office hours</span><span class="block text-sm">${esc(SITE.contact.hours)}</span></span>
          </div></li>
        </ul>
      </div>
      <div class="panel">
        <h2 class="h4 mb-4">What happens next</h2>
        <ol class="space-y-3.5" role="list">
          ${[
            'You send the form — takes about 60 seconds.',
            'We review it and reply within one business day.',
            'You get a written scope, a fixed price and a delivery date.',
            'Nothing is charged until you approve that scope.',
          ].map((s, i) => `<li class="flex gap-3 text-sm text-[#c3cee6] leading-relaxed">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style="background:hsla(190,90%,58%,.16);border:1px solid hsla(190,90%,58%,.3);color:var(--brand)">${i + 1}</span>
            <span>${esc(s)}</span></li>`).join('')}
        </ol>
      </div>
      <div class="mt-5">${trustBadges(true)}</div>
    </div>
  </div>`,
})}`;
}
