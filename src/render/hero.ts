/**
 * Hero sections and conversion surfaces.
 *
 * The 3D is CSS-transform based (no WebGL, no blocking JS) so LCP stays on
 * text paint rather than a canvas. Every animation respects
 * prefers-reduced-motion via the stylesheet.
 */

import { esc, richText } from '../lib/html.js';
import { icon } from './icons.js';
import { SITE } from '../config/site.js';
import { Service } from '../data/services.js';
import { Country, City } from '../data/regions.js';
import { trustBadges, statsBar } from './components.js';
import { url } from '../lib/routing.js';

export interface HeroArgs {
  eyebrow: string;
  /** Primary keyword, exact-match, goes in the H1. */
  h1Prefix: string;
  h1Emphasis?: string;
  sub: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Trust chips under the CTAs. */
  chips?: string[];
  variant?: 'home' | 'service' | 'article' | 'simple';
}

export function hero(args: HeroArgs): string {
  const { eyebrow, h1Prefix, h1Emphasis, sub, primaryLabel, primaryHref, secondaryLabel, secondaryHref, chips = [], variant = 'service' } = args;

  return `<section class="relative overflow-hidden" style="--hue:${variant === 'home' ? 190 : 190}">
    <div class="orb orb-1" aria-hidden="true"></div>
    <div class="orb orb-2" aria-hidden="true"></div>
    <div class="orb orb-3" aria-hidden="true"></div>
    <div class="perspective absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="ring-3d spin-y" style="width:min(62vw,660px);height:min(62vw,660px);top:-14%;right:-12%"></div>
      <div class="ring-3d spin-y-rev" style="width:min(40vw,420px);height:min(40vw,420px);top:6%;right:2%;border-color:rgba(124,58,237,.16)"></div>
      <div class="ring-3d spin-x" style="width:min(28vw,300px);height:min(28vw,300px);top:20%;right:10%;border-color:rgba(168,85,247,.13)"></div>
    </div>

    <div class="container relative pt-16 pb-14 md:pt-24 md:pb-20">
      <div class="max-w-3xl">
        <div class="reveal in mb-5"><span class="eyebrow">${esc(eyebrow)}</span></div>
        <h1 class="h1 reveal in">
          ${esc(h1Prefix)}${h1Emphasis ? ` <span class="text-gradient anim-gradient">${esc(h1Emphasis)}</span>` : ''}
        </h1>
        <p class="lead mt-6 reveal in max-w-2xl">${sub}</p>
        <div class="mt-8 flex flex-wrap gap-3 reveal in">
          <a href="${esc(primaryHref)}" class="btn btn-primary btn-lg btn-shine">${esc(primaryLabel)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>
          ${secondaryLabel && secondaryHref ? `<a href="${esc(secondaryHref)}" class="btn btn-ghost btn-lg">${esc(secondaryLabel)}</a>` : ''}
        </div>
        ${chips.length ? `<div class="mt-6 flex flex-wrap gap-2 reveal in">${chips.map((c) => `<span class="chip chip-ok">${icon('check', 'w-3.5 h-3.5', 3)} ${esc(c)}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  </section>`;
}

/** 3D feature showcase used on the homepage and top-level service pages. */
export function heroShowcase(): string {
  const items = [
    { icon: 'layout', title: 'Custom design', body: 'No templates. Designed for your market.', cls: 'float-y' },
    { icon: 'bolt', title: 'Fast delivery', body: '5–21 business days, start to launch.', cls: 'float-y-slow' },
    { icon: 'search', title: 'SEO built in', body: 'Schema, sitemaps and Core Web Vitals.', cls: 'float-y-fast' },
    { icon: 'refresh', title: 'Unlimited revisions', body: 'Until you genuinely approve it.', cls: 'float-y' },
  ];

  return `<div class="relative">
    <div class="grid grid-cols-2 gap-3">
      ${items
        .map(
          (it, i) => `<div class="card card-glow p-5 ${it.cls} reveal" style="--hue:${185 + i * 22}" data-tilt>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:linear-gradient(135deg,hsla(${185 + i * 22},90%,58%,.18),hsla(285,90%,60%,.14));border:1px solid hsla(${185 + i * 22},90%,58%,.28);color:hsl(${185 + i * 22},90%,62%)">${icon(it.icon, 'w-5 h-5')}</div>
            <div class="font-bold text-sm mb-1" style="font-family:Sora,sans-serif">${esc(it.title)}</div>
            <div class="text-xs text-muted leading-relaxed">${esc(it.body)}</div>
          </div>`,
        )
        .join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead forms
// ─────────────────────────────────────────────────────────────────────────────

export interface LeadFormArgs {
  /** Identifies the service being enquired about. */
  service?: string;
  /** Identifies the location. */
  region?: string;
  /** Form variant. */
  variant?: 'contact' | 'quote' | 'audit' | 'checkout';
  heading: string;
  sub: string;
  submitLabel?: string;
  /** Show a service <select>. */
  showServiceSelect?: boolean;
  showPhone?: boolean;
  showBudget?: boolean;
  compact?: boolean;
  servicesList?: { slug: string; name: string }[];
  currentService?: string;
}

export function leadForm(args: LeadFormArgs): string {
  const {
    service = '',
    region = 'United States',
    variant = 'quote',
    heading,
    sub,
    submitLabel = 'Get My Free Quote',
    showServiceSelect,
    showPhone = true,
    showBudget = true,
    compact,
    servicesList = [],
    currentService,
  } = args;

  return `<div class="card p-6 md:p-8" data-lead-form-wrap>
    <div class="mb-6">
      <h2 class="h3">${esc(heading)}</h2>
      <p class="text-sm text-muted mt-2 leading-relaxed">${sub}</p>
    </div>

    <div data-form-status class="hidden mb-4"></div>

    <form data-lead-form data-variant="${esc(variant)}" novalidate>
      <input type="hidden" name="service" value="${esc(service)}" />
      <input type="hidden" name="region" value="${esc(region)}" />
      <input type="hidden" name="form_variant" value="${esc(variant)}" />
      <div class="honeypot" aria-hidden="true">
        <label>Leave this empty<input type="text" name="company_website" tabindex="-1" autocomplete="off" /></label>
      </div>

      <div class="grid ${compact ? '' : 'sm:grid-cols-2'} gap-3.5">
        <div>
          <label class="field-label" for="lf-name-${variant}-${service || 'x'}">Full name <span aria-hidden="true" style="color:var(--bad)">*</span></label>
          <input class="field" id="lf-name-${variant}-${service || 'x'}" type="text" name="name" required autocomplete="name" placeholder="Jane Smith" />
        </div>
        <div>
          <label class="field-label" for="lf-email-${variant}-${service || 'x'}">Email address <span aria-hidden="true" style="color:var(--bad)">*</span></label>
          <input class="field" id="lf-email-${variant}-${service || 'x'}" type="email" name="email" required autocomplete="email" placeholder="jane@company.com" />
        </div>
        ${showPhone ? `<div>
          <label class="field-label" for="lf-phone-${variant}-${service || 'x'}">Phone / WhatsApp</label>
          <input class="field" id="lf-phone-${variant}-${service || 'x'}" type="tel" name="phone" autocomplete="tel" placeholder="+1 555 000 0000" />
        </div>` : ''}
        <div>
          <label class="field-label" for="lf-company-${variant}-${service || 'x'}">Company</label>
          <input class="field" id="lf-company-${variant}-${service || 'x'}" type="text" name="company" autocomplete="organization" placeholder="Your company" />
        </div>
        ${showServiceSelect && servicesList.length ? `<div class="${compact ? '' : 'sm:col-span-2'}">
          <label class="field-label" for="lf-service-${variant}-${service || 'x'}">Which service do you need?</label>
          <select class="field" id="lf-service-${variant}-${service || 'x'}" name="service_interest">
            <option value="">Select a service…</option>
            ${servicesList.map((s) => `<option value="${esc(s.slug)}"${currentService === s.slug ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}
            <option value="not-sure">Not sure — please advise</option>
          </select>
        </div>` : ''}
        ${showBudget ? `<div>
          <label class="field-label" for="lf-budget-${variant}-${service || 'x'}">Budget range</label>
          <select class="field" id="lf-budget-${variant}-${service || 'x'}" name="budget">
            <option value="">Select a range…</option>
            <option value="under-500">Under $500</option>
            <option value="500-1000">$500 – $1,000</option>
            <option value="1000-2500">$1,000 – $2,500</option>
            <option value="2500-5000">$2,500 – $5,000</option>
            <option value="5000-plus">$5,000+</option>
            <option value="retainer">Monthly retainer</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </div>` : ''}
        <div>
          <label class="field-label" for="lf-timeline-${variant}-${service || 'x'}">Ideal start date</label>
          <select class="field" id="lf-timeline-${variant}-${service || 'x'}" name="timeline">
            <option value="">Select…</option>
            <option value="asap">As soon as possible</option>
            <option value="1-month">Within 1 month</option>
            <option value="1-3-months">1 – 3 months</option>
            <option value="3-plus-months">3+ months</option>
            <option value="exploring">Just exploring</option>
          </select>
        </div>
        <div class="${compact ? '' : 'sm:col-span-2'}">
          <label class="field-label" for="lf-msg-${variant}-${service || 'x'}">Tell us about your project</label>
          <textarea class="field" id="lf-msg-${variant}-${service || 'x'}" name="message" rows="${compact ? 3 : 4}" placeholder="What are you trying to achieve? Any existing site, brand or deadlines we should know about?"></textarea>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg btn-shine w-full mt-5">${esc(submitLabel)} ${icon('arrow', 'w-4 h-4', 2.2)}</button>

      <p class="text-xs text-faint mt-3.5 text-center leading-relaxed">
        We reply to every enquiry within one business day. Your details stay private — no spam, no list-selling, ever.
      </p>
      <p class="text-xs text-faint mt-2 text-center">
        Prefer email? <a href="mailto:${esc(SITE.contact.email)}" class="underline hover:text-[color:var(--brand)]">${esc(SITE.contact.email)}</a>
      </p>
    </form>

    <div class="mt-6 pt-6 border-t" style="border-color:var(--border)">
      ${trustBadges(true)}
    </div>
  </div>`;
}

/** Compact inline CTA strip — placed mid-page to break up long pages. */
export function inlineCta(opts: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  service?: string;
  region?: string;
  serviceName?: string;
}): string {
  return `<div class="card overflow-hidden reveal">
    <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(46rem 18rem at 15% -50%, rgba(34,211,238,.15), transparent 62%), radial-gradient(40rem 18rem at 88% 140%, rgba(124,58,237,.15), transparent 62%)"></div>
    <div class="relative p-7 md:p-9 flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
      <div class="max-w-xl">
        <h3 class="h3 mb-2">${esc(opts.title)}</h3>
        <p class="text-sm text-muted leading-relaxed">${esc(opts.body)}</p>
      </div>
      <div class="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
        <a href="${esc(opts.ctaHref)}" class="btn btn-primary btn-shine">${esc(opts.ctaLabel)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>
        <a href="tel:${esc(SITE.contact.phoneE164)}" class="btn btn-ghost">${icon('phone', 'w-4 h-4', 2.2)} ${esc(SITE.contact.phone)}</a>
      </div>
    </div>
  </div>`;
}

/** "Free audit" callout — used on SEO-family pages. */
export function auditCallout(opts: {
  serviceName: string;
  bullets: string[];
  href: string;
  region?: string;
}): string {
  return `<div class="card overflow-hidden reveal" style="--hue:145">
    <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(48rem 20rem at 8% -60%, rgba(52,211,153,.16), transparent 62%), radial-gradient(44rem 20rem at 95% 150%, rgba(34,211,238,.14), transparent 62%)"></div>
    <div class="relative p-7 md:p-9">
      <div class="flex items-start gap-4 mb-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style="background:linear-gradient(135deg,rgba(52,211,153,.2),rgba(34,211,238,.14));border:1px solid rgba(52,211,153,.3);color:var(--ok)">
          ${icon('search', 'w-6 h-6')}
        </div>
        <div>
          <div class="eyebrow mb-2">Free · No obligation</div>
          <h3 class="h3">${esc(opts.serviceName)}</h3>
        </div>
      </div>
      <p class="text-sm text-muted leading-relaxed max-w-2xl mb-5">Send us your URL and we will deliver the findings within 48 hours as a written report you can action yourself — whether or not you work with us.</p>
      <ul class="grid sm:grid-cols-2 gap-2.5 mb-6" role="list">
        ${opts.bullets
          .map(
            (b) => `<li class="flex gap-2.5 items-start text-sm text-[#c3cee6]">
              <span class="shrink-0 mt-0.5" style="color:var(--ok)">${icon('check', 'w-4 h-4', 2.6)}</span><span>${esc(b)}</span>
            </li>`,
          )
          .join('')}
      </ul>
      <div class="flex flex-wrap gap-3">
        <a href="${esc(opts.href)}" class="btn btn-primary btn-shine">Request My Free Audit ${icon('arrow', 'w-4 h-4', 2.2)}</a>
        <a href="tel:${esc(SITE.contact.phoneE164)}" class="btn btn-ghost">${icon('phone', 'w-4 h-4', 2.2)} Talk to a strategist</a>
      </div>
    </div>
  </div>`;
}

/** Region selector strip for location pages. */
export function regionSwitcher(args: {
  country: Country;
  city?: City;
  currentSlug: string;
  serviceSlug: string;
  countries: Country[];
}): string {
  const { country, city, currentSlug, serviceSlug, countries } = args;
  return `<div class="panel reveal">
    <div class="flex items-center gap-2.5 mb-3">
      <span style="color:var(--brand)">${icon('globe', 'w-5 h-5', 2)}</span>
      <h3 class="h4">${city ? `Other locations near ${esc(city.name)}` : `We also serve these locations`}</h3>
    </div>
    <div class="flex flex-wrap gap-2">
      ${countries
        .filter((c) => c.slug !== currentSlug)
        .slice(0, 14)
        .map(
          (c) => `<a href="${esc(url('/', c.slug, serviceSlug))}" class="chip transition-colors hover:border-[color:var(--brand)]">${icon('pin', 'w-3 h-3', 2.4)} ${esc(c.longName)}</a>`,
        )
        .join('')}
    </div>
  </div>`;
}
