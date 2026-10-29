/**
 * Reusable UI components.
 *
 * Every component returns plain HTML strings — no framework, no hydration.
 * That keeps the critical path tiny and Core Web Vitals in the green.
 */

import { esc, richText, formatDate } from '../lib/html.js';
import { icon } from './icons.js';
import { SITE, abs } from '../config/site.js';
import { url } from '../lib/routing.js';

// ── Layout primitives ────────────────────────────────────────────────────────

export function section(opts: {
  children: string;
  id?: string;
  class?: string;
  tight?: boolean;
  labelledBy?: string;
}): string {
  const { children, id, class: cls = '', tight, labelledBy } = opts;
  // NOTE: the modifier is written as a full literal, not concatenated as
  // `section${...}`. Tailwind's scanner only sees complete strings, so a
  // composed class would be purged from the build.
  const sectionCls = tight ? 'section section-tight' : 'section';
  return `<section${id ? ` id="${esc(id)}"` : ''} class="${sectionCls} ${esc(cls)}"${labelledBy ? ` aria-labelledby="${esc(labelledBy)}"` : ''}>
    <div class="container">${children}</div>
  </section>`;
}

export function sectionHead(opts: {
  eyebrow?: string;
  h2: string;
  sub?: string;
  align?: 'left' | 'center';
  id?: string;
  cta?: string;
}): string {
  const { eyebrow, h2, sub, align = 'center', id, cta } = opts;
  return `<div class="reveal ${align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'} mb-12">
    ${eyebrow ? `<div class="${align === 'center' ? 'flex justify-center ' : ''}mb-4"><span class="eyebrow">${esc(eyebrow)}</span></div>` : ''}
    <h2${id ? ` id="${esc(id)}"` : ''} class="h2">${h2}</h2>
    ${sub ? `<p class="lead mt-4">${sub}</p>` : ''}
    ${cta ? `<div class="mt-7 ${align === 'center' ? 'flex justify-center gap-3 flex-wrap' : ''}">${cta}</div>` : ''}
  </div>`;
}

/**
 * A responsive grid of cards.
 * `content` is raw HTML (cards), `cls` is an extra class string.
 */
export function grid(cols: 2 | 3 | 4 = 3, content = '', cls = ''): string {
  const map = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };
  return `<div class="grid gap-5 ${map[cols]} ${esc(cls)}">${content}</div>`;
}

// ── Trust ────────────────────────────────────────────────────────────────────

export function statsBar(): string {
  const items = [
    { value: SITE.stats.projectsDelivered, label: 'Projects delivered', icon: 'briefcase' },
    { value: SITE.stats.clientsServed, label: 'Clients served', icon: 'users' },
    { value: `${SITE.rating.value}/5`, label: `From ${SITE.rating.count} reviews`, icon: 'star' },
    { value: `${SITE.stats.avgDeliveryDays} days`, label: 'Average delivery', icon: 'bolt' },
    { value: SITE.stats.revisionsOffered, label: 'Revisions included', icon: 'refresh' },
    { value: SITE.stats.countriesServed, label: 'Countries served', icon: 'globe' },
  ];
  return `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 reveal">
    ${items
      .map(
        (i) => `<div class="panel text-center py-5">
          <div class="flex justify-center mb-2" style="color:var(--brand)">${icon(i.icon, 'w-5 h-5')}</div>
          <div class="text-2xl font-extrabold tracking-tight" style="font-family:Sora,sans-serif">${esc(i.value)}</div>
          <div class="text-xs text-faint mt-1">${esc(i.label)}</div>
        </div>`,
      )
      .join('')}
  </div>`;
}

export function trustBadges(compact = false): string {
  const badges = [
    { icon: 'lock', text: 'SSL secured & GDPR ready' },
    { icon: 'shield', text: 'NDA available on request' },
    { icon: 'check-circle', text: 'Fixed price, no hidden fees' },
    { icon: 'refresh', text: 'Unlimited revisions' },
    { icon: 'clock', text: 'Fast turnaround' },
    { icon: 'key', text: 'You own everything' },
  ];
  const shown = compact ? badges.slice(0, 4) : badges;
  return `<div class="grid ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'} gap-2.5" role="list" aria-label="Trust and security commitments">
    ${shown
      .map(
        (b) => `<div class="trust-badge" role="listitem">${icon(b.icon, 'w-4 h-4', 2)}<span>${esc(b.text)}</span></div>`,
      )
      .join('')}
  </div>`;
}

// ── Cards ────────────────────────────────────────────────────────────────────

export function featureCard(opts: {
  icon: string;
  title: string;
  body: string;
  href?: string;
  delay?: number;
}): string {
  const { icon: ic, title, body, href, delay = 0 } = opts;
  const inner = `<div class="card card-hover card-glow p-6 h-full flex flex-col">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style="background:linear-gradient(135deg,rgba(34,211,238,.16),rgba(124,58,237,.16));border:1px solid rgba(34,211,238,.22);color:var(--brand)">
        ${icon(ic, 'w-5 h-5')}
      </div>
      <h3 class="h4 mb-2">${title}</h3>
      <p class="text-sm text-muted leading-relaxed">${body}</p>
      ${href ? `<div class="mt-4 text-sm font-semibold flex items-center gap-1.5" style="color:var(--brand)">Learn more ${icon('arrow', 'w-4 h-4', 2)}</div>` : ''}
    </div>`;
  const wrapped = `<div class="reveal"${delay ? ` style="transition-delay:${delay}ms"` : ''}>${
    href ? `<a href="${esc(href)}" class="block h-full">${inner}</a>` : inner
  }</div>`;
  return wrapped;
}

export function serviceCard(opts: {
  href: string;
  icon: string;
  title: string;
  body: string;
  tag?: string;
  price?: string;
  accentHue?: number;
  delay?: number;
}): string {
  const { href, icon: ic, title, body, tag, price, accentHue = 190, delay = 0 } = opts;
  return `<a href="${esc(href)}" class="block h-full reveal" style="--hue:${accentHue}${delay ? `;transition-delay:${delay}ms` : ''}">
    <div class="card card-hover card-glow p-6 h-full flex flex-col">
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style="background:linear-gradient(135deg,hsla(${accentHue},90%,58%,.16),hsla(285,90%,60%,.14));border:1px solid hsla(${accentHue},90%,58%,.26);color:hsl(${accentHue},90%,62%)">
          ${icon(ic, 'w-5 h-5')}
        </div>
        ${tag ? `<span class="chip text-xs">${esc(tag)}</span>` : ''}
      </div>
      <h3 class="h4 mb-2">${title}</h3>
      <p class="text-sm text-muted leading-relaxed flex-1">${body}</p>
      ${price ? `<div class="mt-4 pt-4 border-t" style="border-color:var(--border)"><span class="text-xs text-faint">From </span><span class="text-lg font-extrabold" style="font-family:Sora,sans-serif;color:var(--brand)">${esc(price)}</span></div>` : ''}
    </div>
  </a>`;
}

// ── Pricing ──────────────────────────────────────────────────────────────────

export function priceCard(opts: {
  id: string;
  name: string;
  priceDisplay: string;
  periodLabel: string;
  suited: string;
  features: string[];
  eta: string;
  units?: string;
  badge?: string;
  was?: string;
  ctaHref: string;
  featured?: boolean;
  currencyNote?: string;
}): string {
  const { name, priceDisplay, periodLabel, suited, features, eta, units, badge, was, ctaHref, featured, currencyNote } = opts;
  return `<div class="price-card${featured ? ' price-card-featured' : ''} reveal" id="${esc(opts.id)}">
    ${badge ? `<div class="absolute -top-3 left-1/2 -translate-x-1/2"><span class="chip chip-brand text-xs font-bold px-3 py-1 shadow-lg">${esc(badge)}</span></div>` : ''}
    <div class="flex items-baseline gap-2 flex-wrap">
      <h3 class="h3">${esc(name)}</h3>
      ${units ? `<span class="text-xs text-faint">${esc(units)}</span>` : ''}
    </div>
    <div class="mt-4 flex items-baseline gap-2 flex-wrap">
      <span class="text-4xl font-extrabold tracking-tight" style="font-family:Sora,sans-serif">${esc(priceDisplay)}</span>
      ${was ? `<span class="text-base text-faint line-through">${esc(was)}</span>` : ''}
    </div>
    <div class="text-xs text-faint mt-1">${esc(periodLabel)}${currencyNote ? ` · ${esc(currencyNote)}` : ''}</div>
    <p class="text-sm text-muted leading-relaxed mt-4 pb-4 border-b" style="border-color:var(--border)">${esc(suited)}</p>
    <ul class="mt-5 flex-1">
      ${features
        .map(
          (f) =>
            `<li class="price-feature">${icon('check', 'w-4 h-4', 2.5)}<span>${esc(f)}</span></li>`,
        )
        .join('')}
    </ul>
    <div class="mt-6 pt-1">
      <a href="${esc(ctaHref)}" class="btn ${featured ? 'btn-primary btn-shine' : 'btn-ghost'} w-full">Choose ${esc(name)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>
      <div class="text-center text-xs text-faint mt-2.5">Delivered in ${esc(eta)}</div>
    </div>
  </div>`;
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

export function faqBlock(faqs: { q: string; a: string }[], headingId?: string): string {
  return `<div class="grid gap-3 max-w-3xl mx-auto" itemscope itemtype="https://schema.org/FAQPage">
    ${faqs
      .map(
        (f, i) => `<details class="faq-item reveal"${i === 0 ? ' open' : ''}>
      <summary class="faq-q" itemprop="name">${esc(f.q)}</summary>
      <div class="faq-a" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
        <div itemprop="text">${richText(f.a)}</div>
      </div>
    </details>`,
      )
      .join('')}
  </div>`;
}

// ── Testimonials ─────────────────────────────────────────────────────────────

export interface ReviewLike {
  name: string;
  role: string;
  company: string;
  location: string;
  quote: string;
  outcome: string;
  date: string;
  rating: number;
}

export function testimonialCard(t: ReviewLike, i = 0): string {
  return `<figure class="card card-hover p-6 h-full flex flex-col reveal" style="transition-delay:${i * 70}ms" itemscope itemtype="https://schema.org/Review">
    <div class="flex gap-0.5 mb-4" aria-label="${t.rating} out of 5 stars" itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
      <meta itemprop="ratingValue" content="${t.rating}" />
      <meta itemprop="bestRating" content="5" />
      ${Array.from({ length: 5 })
        .map((_, k) => `<span style="color:${k < t.rating ? '#fbbf24' : 'rgba(255,255,255,.16)'}">★</span>`)
        .join('')}
    </div>
    <blockquote class="flex-1 text-[0.93rem] leading-relaxed text-[#c3cee6]" itemprop="reviewBody">"${esc(t.quote)}"</blockquote>
    <div class="mt-5 pt-4 border-t" style="border-color:var(--border)">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style="background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#04070f" aria-hidden="true">${esc(t.name.split(' ').map((n) => n[0]).slice(0, 2).join(''))}</div>
        <div class="min-w-0">
          <div class="font-semibold text-sm" itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${esc(t.name)}</span></div>
          <div class="text-xs text-faint">${esc(t.role)}, ${esc(t.company)} · ${esc(t.location)}</div>
        </div>
      </div>
      <div class="mt-3 text-xs font-semibold flex items-center gap-1.5" style="color:var(--ok)">
        ${icon('chart', 'w-3.5 h-3.5', 2.2)} ${esc(t.outcome)}
      </div>
    </div>
  </figure>`;
}

export function aggregateRatingBlock(): string {
  return `<div class="panel flex flex-wrap items-center justify-center gap-x-8 gap-y-4 reveal" itemscope itemtype="https://schema.org/Organization">
    <div class="text-center" itemscope itemtype="https://schema.org/AggregateRating">
      <meta itemprop="ratingValue" content="${SITE.rating.value}" />
      <meta itemprop="reviewCount" content="${SITE.rating.count}" />
      <meta itemprop="bestRating" content="5" />
      <div class="text-3xl font-extrabold" style="font-family:Sora,sans-serif;color:var(--brand)" itemprop="ratingValue">${SITE.rating.value}</div>
      <div class="text-xs text-faint">Average rating</div>
    </div>
    <div class="h-10 w-px hidden sm:block" style="background:var(--border)"></div>
    <div class="text-center">
      <div class="text-3xl font-extrabold" style="font-family:Sora,sans-serif">${SITE.rating.count}</div>
      <div class="text-xs text-faint">Verified client reviews</div>
    </div>
    <div class="h-10 w-px hidden sm:block" style="background:var(--border)"></div>
    <div class="text-center">
      <div class="text-3xl font-extrabold" style="font-family:Sora,sans-serif">${SITE.stats.yearsExperience}</div>
      <div class="text-xs text-faint">Years in business</div>
    </div>
    <div class="h-10 w-px hidden sm:block" style="background:var(--border)"></div>
    <div class="text-center">
      <div class="text-3xl font-extrabold" style="font-family:Sora,sans-serif">98%</div>
      <div class="text-xs text-faint">Client retention</div>
    </div>
  </div>`;
}

// ── Breadcrumbs ──────────────────────────────────────────────────────────────

export function breadcrumbs(items: { name: string; url: string }[]): string {
  return `<nav aria-label="Breadcrumb" class="breadcrumbs mb-6">
    ${items
      .map((item, i) => {
        const isLast = i === items.length - 1;
        return `${i > 0 ? '<span class="sep" aria-hidden="true">/</span>' : ''}${
          isLast
            ? `<span aria-current="page">${esc(item.name)}</span>`
            : `<a href="${esc(item.url)}">${esc(item.name)}</a>`
        }`;
      })
      .join('')}
  </nav>`;
}

// ── CTA ──────────────────────────────────────────────────────────────────────

export function ctaBand(opts: {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  phone?: string;
}): string {
  const { title, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref, phone = SITE.contact.phone } = opts;
  return `<div class="card overflow-hidden reveal" style="--hue:190">
    <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(60rem 22rem at 20% -40%, rgba(34,211,238,.14), transparent 60%), radial-gradient(50rem 20rem at 90% 130%, rgba(124,58,237,.14), transparent 60%)"></div>
    <div class="relative p-8 md:p-12 text-center">
      <h2 class="h2 max-w-3xl mx-auto">${title}</h2>
      <p class="lead mt-4 max-w-2xl mx-auto">${body}</p>
      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <a href="${esc(primaryHref)}" class="btn btn-primary btn-lg btn-shine">${esc(primaryLabel)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>
        ${secondaryLabel && secondaryHref ? `<a href="${esc(secondaryHref)}" class="btn btn-ghost btn-lg">${esc(secondaryLabel)}</a>` : ''}
      </div>
      <div class="mt-6 text-sm text-faint flex items-center justify-center gap-2 flex-wrap">
        <span>${icon('phone', 'w-4 h-4', 2)} ${esc(phone)}</span>
        <span class="hidden sm:inline" aria-hidden="true">·</span>
        <a href="mailto:${esc(SITE.contact.email)}" class="inline-flex items-center gap-1.5 hover:underline">${icon('mail', 'w-4 h-4', 2)} ${esc(SITE.contact.email)}</a>
      </div>
    </div>
  </div>`;
}

// ── Process timeline ─────────────────────────────────────────────────────────

export function processTimeline(steps: { title: string; body: string }[]): string {
  return `<ol class="relative grid gap-6 md:grid-cols-2 lg:grid-cols-5 lg:gap-4" itemscope itemtype="https://schema.org/HowTo">
    ${steps
      .map(
        (s, i) => `<li class="reveal relative" itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0" style="background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#04070f" itemprop="position" content="${i + 1}">${i + 1}</div>
        ${i < steps.length - 1 ? '<div class="hidden lg:block flex-1 h-px" style="background:linear-gradient(90deg,var(--border-strong),transparent)"></div>' : ''}
      </div>
      <h3 class="h4 mb-1.5" itemprop="name">${esc(s.title)}</h3>
      <p class="text-sm text-muted leading-relaxed" itemprop="text">${esc(s.body)}</p>
    </li>`,
      )
      .join('')}
  </ol>`;
}

// ── Checklists / deliverables ────────────────────────────────────────────────

export function checkList(items: string[], cols = 2): string {
  return `<ul class="grid gap-2.5 ${cols === 2 ? 'sm:grid-cols-2' : ''}" role="list">
    ${items
      .map(
        (i) => `<li class="flex gap-2.5 items-start text-sm text-[#c3cee6] leading-relaxed">
          <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('check', 'w-4 h-4', 2.6)}</span>
          <span>${richText(i)}</span>
        </li>`,
      )
      .join('')}
  </ul>`;
}

export function notIncludedList(items: string[]): string {
  return `<ul class="grid gap-2.5 sm:grid-cols-2" role="list">
    ${items
      .map(
        (i) => `<li class="flex gap-2.5 items-start text-sm text-muted leading-relaxed">
          <span class="shrink-0 mt-0.5" style="color:var(--faint)">${icon('x', 'w-4 h-4', 2.4)}</span>
          <span>${esc(i)}</span>
        </li>`,
      )
      .join('')}
  </ul>`;
}

// ── Comparison table ─────────────────────────────────────────────────────────

export function comparisonTable(opts: {
  rows: { label: string; values: (string | boolean)[] }[];
  columns: string[];
  highlightIndex?: number;
  caption: string;
}): string {
  const { rows, columns, highlightIndex, caption } = opts;
  return `<div class="table-wrap reveal">
    <table class="data">
      <caption class="sr-only">${esc(caption)}</caption>
      <thead><tr><th scope="col">Feature</th>${columns.map((c) => `<th scope="col" class="text-center">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows
          .map(
            (r) => `<tr>
          <th scope="row" style="font-weight:550;background:transparent;text-transform:none;letter-spacing:0;font-size:.9rem;color:#c3cee6">${esc(r.label)}</th>
          ${r.values
            .map((v, i) => {
              const hl = i === highlightIndex;
              const cell =
                typeof v === 'boolean'
                  ? v
                    ? `<span style="color:var(--ok)">${icon('check', 'w-4 h-4', 3)}<span class="sr-only">Included</span></span>`
                    : `<span style="color:var(--faint)">${icon('x', 'w-4 h-4', 2.4)}<span class="sr-only">Not included</span></span>`
                  : esc(v);
              return `<td class="text-center"${hl ? ' style="background:rgba(34,211,238,.05)"' : ''}>${cell}</td>`;
            })
            .join('')}
        </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </div>`;
}

// ── Prose ────────────────────────────────────────────────────────────────────

export function paragraphs(items: string[], cls = 'prose'): string {
  return items.map((p) => `<p>${richText(p)}</p>`).join('\n      ');
}

// ── Article meta ─────────────────────────────────────────────────────────────

export function articleMeta(opts: { author: string; date: string; reading: number; category?: string }): string {
  return `<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-faint">
    <span class="inline-flex items-center gap-1.5">${icon('users', 'w-4 h-4', 2)} ${esc(opts.author)}</span>
    <span class="inline-flex items-center gap-1.5">${icon('clock', 'w-4 h-4', 2)} ${esc(formatDate(opts.date))}</span>
    <span class="inline-flex items-center gap-1.5">${icon('book', 'w-4 h-4', 2)} ${opts.reading} min read</span>
    ${opts.category ? `<span class="chip">${esc(opts.category)}</span>` : ''}
  </div>`;
}

// ── Link lists ───────────────────────────────────────────────────────────────

export function linkCloud(items: { name: string; url: string }[], cls = ''): string {
  return `<div class="flex flex-wrap gap-2 ${esc(cls)}">${items
    .map((i) => `<a href="${esc(i.url)}" class="chip transition-colors hover:border-[color:var(--brand)]">${esc(i.name)} ${icon('arrow', 'w-3 h-3', 2.4)}</a>`)
    .join('')}</div>`;
}

// ── Media / portfolio cover ──────────────────────────────────────────────────

export function coverArt(opts: {
  style: string;
  palette: [string, string, string];
  title: string;
  ratio?: string;
  lazy?: boolean;
  alt: string;
}): string {
  const { style, palette, title, alt, lazy = true } = opts;
  const [a, b, c] = palette;
  const uid = Math.abs(hash(title)).toString(36).slice(0, 8);
  const patterns: Record<string, string> = {
    grid: `<defs><pattern id="g${uid}" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0v26" fill="none" stroke="${c}" stroke-opacity=".22" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="${a}"/><rect width="100%" height="100%" fill="url(#g${uid})"/><circle cx="72%" cy="34%" r="86" fill="${b}" fill-opacity=".22"/><circle cx="28%" cy="72%" r="64" fill="${c}" fill-opacity=".18"/>`,
    flow: `<rect width="100%" height="100%" fill="${a}"/><path d="M0,72 C28,44 52,96 78,62 C104,28 132,80 160,48 L200,62 200,200 0,200Z" fill="${b}" fill-opacity=".3"/><path d="M0,86 C34,62 58,108 88,78 C118,48 146,96 200,70 L200,200 0,200Z" fill="${c}" fill-opacity=".22"/><circle cx="76%" cy="28%" r="52" fill="${c}" fill-opacity=".2"/>`,
    stack: `<rect width="100%" height="100%" fill="${a}"/><rect x="18%" y="20%" width="64%" height="58%" rx="10" fill="${b}" fill-opacity=".26" transform="rotate(-7 50 50)"/><rect x="18%" y="26%" width="64%" height="58%" rx="10" fill="${c}" fill-opacity=".3" transform="rotate(5 50 50)"/>`,
    orbit: `<rect width="100%" height="100%" fill="${a}"/><ellipse cx="50%" cy="50%" rx="42%" ry="16%" fill="none" stroke="${b}" stroke-opacity=".5" stroke-width="1.6" transform="rotate(-22 50 50)"/><ellipse cx="50%" cy="50%" rx="42%" ry="16%" fill="none" stroke="${c}" stroke-opacity=".45" stroke-width="1.6" transform="rotate(28 50 50)"/><circle cx="50%" cy="50%" r="24" fill="${b}" fill-opacity=".34"/><circle cx="88%" cy="34%" r="5" fill="${c}"/><circle cx="12%" cy="68%" r="4" fill="${b}"/>`,
    wave: `<rect width="100%" height="100%" fill="${a}"/><path d="M0,40 Q25,20 50,40 T100,40 T150,40 T200,40 L200,200 0,200Z" fill="${b}" fill-opacity=".2"/><path d="M0,70 Q25,50 50,70 T100,70 T150,70 T200,70 L200,200 0,200Z" fill="${c}" fill-opacity=".24"/><path d="M0,100 Q25,80 50,100 T100,100 T150,100 T200,100 L200,200 0,200Z" fill="${b}" fill-opacity=".16"/>`,
    mesh: `<defs><radialGradient id="m${uid}" cx="30%" cy="30%"><stop offset="0%" stop-color="${b}" stop-opacity=".5"/><stop offset="100%" stop-color="${b}" stop-opacity="0"/></radialGradient><radialGradient id="n${uid}" cx="72%" cy="70%"><stop offset="0%" stop-color="${c}" stop-opacity=".45"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="${a}"/><rect width="100%" height="100%" fill="url(#m${uid})"/><rect width="100%" height="100%" fill="url(#n${uid})"/>`,
  };

  return `<div class="media ${opts.ratio || 'ratio-16-9'}">
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(alt)}" ${lazy ? 'loading="lazy"' : ''} width="800" height="480">
      ${patterns[style] || patterns.mesh}
    </svg>
  </div>`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h;
}

// ── Pagination ───────────────────────────────────────────────────────────────

export function pagination(current: number, total: number, hrefFor: (n: number) => string): string {
  if (total <= 1) return '';
  const pages: (number | string)[] = [];
  const windowSize = 1;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= windowSize) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return `<nav class="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
    ${current > 1 ? `<a href="${esc(hrefFor(current - 1))}" class="btn btn-ghost btn-sm" rel="prev">${icon('arrow', 'w-4 h-4 rotate-180', 2.2)}</a>` : ''}
    ${pages
      .map((p) =>
        p === '…'
          ? '<span class="px-2 text-faint" aria-hidden="true">…</span>'
          : p === current
            ? `<span class="btn btn-primary btn-sm" aria-current="page">${p}</span>`
            : `<a href="${esc(hrefFor(Number(p)))}" class="btn btn-ghost btn-sm">${p}</a>`,
      )
      .join('')}
    ${current < total ? `<a href="${esc(hrefFor(current + 1))}" class="btn btn-ghost btn-sm" rel="next">${icon('arrow', 'w-4 h-4', 2.2)}</a>` : ''}
  </nav>`;
}
