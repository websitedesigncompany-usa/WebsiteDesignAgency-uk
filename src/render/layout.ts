/**
 * The document shell: <head>, header, footer, and the client runtime.
 *
 * Performance notes:
 *   - No render-blocking JS. The only inline script is ~2KB and deferred.
 *   - Fonts are preconnected and use font-display:swap.
 *   - The 3D hero is CSS-only (transforms + opacity), so it never blocks paint.
 *   - Everything below the fold is lazily revealed; content is visible without JS.
 */

import { SITE, ORIGIN } from '../config/site.js';
import { esc, jsonLdBlock } from '../lib/html.js';
import { renderMeta, Meta } from '../lib/seo.js';
import { icon } from './icons.js';
import { SERVICES, PAGE_SERVICES } from '../data/services.js';
import { COUNTRIES, PREFIXED_COUNTRIES, HOME_COUNTRY } from '../data/regions.js';
import { INDUSTRIES } from '../data/industries.js';
import { countryPrefix, locationPrefix, resolveChild, resolveServiceLink, resolveStatic, resolveToolLink, url } from '../lib/routing.js';

export const ASSET_VERSION = 'v1';

export interface LayoutArgs {
  meta: Meta;
  /** Full JSON-LD graph. */
  schema: unknown;
  /** Unique per-page accent hue. */
  hue?: number;
  bodyClass?: string;
  /** Extra <head> content. */
  head?: string;
  /** Page content (without header/footer). */
  content: string;
  /** Prefix for navigation so regional pages stay regional. */
  prefix?: string;
  /** Current path, for nav active state. */
  path?: string;
  /** Whether to preload the LCP image. */
  preloadImage?: string;
}

export function documentShell(args: LayoutArgs): string {
  const { meta, schema, hue = 190, content, prefix = '', path = '/', head = '', bodyClass = '' } = args;

  return `<!DOCTYPE html>
<html lang="en" class="js-on" style="--hue:${hue}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="${SITE.themeColor}" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
    <link rel="alternate" type="text/plain" href="/llms-detailed.txt" title="Detailed LLMs.txt" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" /></noscript>
    <link rel="stylesheet" href="/assets/css/app.css" />
    ${args.preloadImage ? `<link rel="preload" as="image" href="${esc(args.preloadImage)}" fetchpriority="high" />` : ''}
    <script>document.documentElement.classList.add('js-on')</script>
    ${renderMeta(meta, ORIGIN)}
    ${jsonLdBlock(schema)}
    ${head}
</head>
<body class="${esc(bodyClass)}">
    <a href="#main" class="skip-link">Skip to main content</a>
    <div class="bg-aurora" aria-hidden="true"></div>
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-noise" aria-hidden="true"></div>
    ${header(prefix, path)}
    <main id="main">
${content}
    </main>
    ${footer(prefix)}
    <script src="/assets/js/app.js" defer></script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

function header(prefix: string, path: string): string {
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  // Six service bays, mirroring the structure buyers scan for.
  const serviceGroups = [
    {
      label: 'Website Design & Development',
      icon: 'layout',
      slugs: ['website-design-services', 'website-development', 'wordpress-website-design', 'ecommerce-website-design', 'shopify-website-design', 'woocommerce-website-design', 'landing-page-design', '3d-website-design', 'website-redesign', 'website-maintenance'],
    },
    {
      label: 'Logo & Branding',
      icon: 'palette',
      slugs: ['logo-design-services', '3d-logo-design', 'branding-services', 'print-design-services', 'graphic-design-services', 'ebook-design-services'],
    },
    {
      label: 'SEO & Search Marketing',
      icon: 'search',
      slugs: ['seo-services', 'local-seo-services', 'ecommerce-seo-services', 'seo-geo-aeo-services', 'technical-seo-services', 'link-building-services', 'seo-audit-services', 'core-web-vitals-optimization', 'google-business-profile-management', 'reputation-management', 'domain-authority-services', 'international-seo-services'],
    },
    {
      label: 'Digital Marketing',
      icon: 'megaphone',
      slugs: ['ppc-advertising-services', 'google-ads-management', 'meta-ads-management', 'social-media-marketing', 'social-media-management', 'social-media-optimization', 'email-marketing-services', 'newsletter-marketing-services', 'content-marketing-services', 'public-relations-services', 'marketing-automation-services', 'influencer-marketing-services', 'call-tracking-services', 'conversion-rate-optimization'],
    },
    {
      label: 'Content & Creative',
      icon: 'pen',
      slugs: ['content-writing-services', 'seo-content-writing-services', 'blog-writing-services', 'copywriting-services', 'web-analytics-consulting', 'analytics-setup-services', 'custom-software-development', 'ai-integration-services'],
    },
    {
      label: 'Video & Animation',
      icon: 'film',
      slugs: ['video-production-services', 'video-editing-services', 'video-animation-services', 'motion-graphics-animation', 'explainer-video-services', 'podcast-editing-services', 'audio-production-services', 'ui-ux-design', 'mobile-app-development', 'chatbot-development', 'web-security-services', 'web-hosting-services', 'cloud-devops-services', 'api-integration-services', 'crm-integration-services', 'custom-erp-crm-services', 'app-store-optimization', 'webflow-development', 'bigcommerce-development', 'magento-development', 'wix-squarespace-design', 'mvp-development', 'saas-development', 'corporate-website-design', 'landing-page-design'],
    },
  ];

  const megaPanel = serviceGroups
    .map(
      (g) => `<div class="mega-col">
        <div class="mega-head">
          <span class="mega-ico">${icon(g.icon, 'w-4 h-4')}</span>
          <span>${esc(g.label)}</span>
        </div>
        <ul class="mega-list">
          ${g.slugs
            .map((sl) => {
              const svc = SERVICES.find((x) => x.slug === sl);
              if (!svc) return '';
              const href = resolveServiceLink(prefix, svc.slug);
              return `<li><a href="${esc(href)}" class="mega-link">
                <span class="mega-link-ico">${icon(svc.icon, 'w-3.5 h-3.5')}</span>
                <span class="mega-link-t">${esc(svc.nav)}</span>
                <span class="mega-link-p">${esc(svc.tagline)}</span>
              </a></li>`;
            })
            .join('')}
        </ul>
      </div>`,
    )
    .join('');

  return `<header class="site-header" id="siteHeader">
    <div class="container flex items-center justify-between gap-3 w-full">
      <a href="/" class="brandmark" aria-label="${esc(SITE.name)} — home">
        <span class="brandmark-ring" aria-hidden="true"></span>
        <img src="/assets/img/logo-72.webp" alt="${esc(SITE.name)} logo" width="36" height="36" class="brandmark-img" fetchpriority="high" decoding="async" />
        <span class="brandmark-text">
          <span class="brandmark-name">Website Design</span>
          <span class="brandmark-sub">Company</span>
        </span>
      </a>

      <nav class="hidden lg:flex items-center gap-1" aria-label="Primary">
        <div class="nav-item relative" data-mega>
          <button class="nav-link nav-link-mega" aria-haspopup="true" aria-expanded="false" aria-controls="megaServices">
            <span class="nav-ico">${icon('layout', 'w-4 h-4')}</span>
            Services
            <span class="nav-caret">${icon('arrow-down', 'w-3 h-3')}</span>
          </button>
        </div>

        <a href="${esc(resolveStatic(prefix, 'packages'))}" class="nav-link${isActive(resolveStatic(prefix, 'packages')) ? ' is-current' : ''}">Packages</a>
        <a href="${esc(resolveStatic(prefix, 'portfolio'))}" class="nav-link${isActive(resolveStatic(prefix, 'portfolio')) ? ' is-current' : ''}">Portfolio</a>
        <a href="${esc(resolveStatic(prefix, 'case-studies'))}" class="nav-link${isActive(resolveStatic(prefix, 'case-studies')) ? ' is-current' : ''}">Case Studies</a>
        <a href="${esc(resolveStatic(prefix, 'blog'))}" class="nav-link${isActive(resolveStatic(prefix, 'blog')) ? ' is-current' : ''}">Blog</a>
        <a href="${esc(resolveStatic(prefix, 'about'))}" class="nav-link${isActive(resolveStatic(prefix, 'about')) ? ' is-current' : ''}">About</a>

        <div class="nav-item relative" data-mega>
          <button class="nav-link nav-link-mega" aria-haspopup="true" aria-expanded="false" aria-controls="megaRegions">
            <span class="nav-ico">${icon('globe', 'w-4 h-4')}</span>
            Regions
            <span class="nav-caret">${icon('arrow-down', 'w-3 h-3')}</span>
          </button>
        </div>
      </nav>

      <div class="flex items-center gap-2 shrink-0">
        <a href="tel:${esc(SITE.contact.phoneE164)}" class="nav-phone hidden xl:inline-flex" aria-label="Call ${esc(SITE.contact.phone)}">
          <span class="nav-phone-ico">${icon('phone', 'w-4 h-4')}</span>
          <span>${esc(SITE.contact.phone)}</span>
        </a>
        <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary btn-sm btn-shine">
          <span class="btn-ico">${icon('price-tag', 'w-4 h-4')}</span>
          Get a Free Quote
        </a>
        <button id="menuBtn" class="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(190,220,240,.06);border:1px solid var(--border)" aria-label="Open menu" aria-expanded="false" aria-controls="mobileDrawer">
          ${icon('layout', 'w-5 h-5')}
        </button>
      </div>
    </div>

    <!-- Services mega panel: full width, auto-expanding on hover and focus -->
    <div class="mega" id="megaServices" data-mega-panel hidden>
      <div class="mega-inner">
        <div class="mega-grid">${megaPanel}</div>
        <div class="mega-foot">
          <div class="mega-foot-list">
            <a href="${esc(resolveStatic(prefix, 'services'))}" class="mega-foot-link">All ${PAGE_SERVICES.length} services ${icon('arrow', 'w-3.5 h-3.5')}</a>
            <a href="${esc(resolveStatic(prefix, 'packages'))}" class="mega-foot-link">Pricing &amp; packages ${icon('arrow', 'w-3.5 h-3.5')}</a>
            <a href="${esc(resolveStatic(prefix, 'free-audit'))}" class="mega-foot-link">Free audit ${icon('arrow', 'w-3.5 h-3.5')}</a>
          </div>
          <div class="mega-foot-note">
            <span>${icon('bolt', 'w-4 h-4')}</span>
            <span>Fixed prices · unlimited revisions · 5–21 day delivery</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Regions mega panel -->
    <div class="mega mega-regions" id="megaRegions" data-mega-panel hidden>
      <div class="mega-inner">
        <div class="mega-regions-grid">
          ${PREFIXED_COUNTRIES.map(
            (c) => `<a href="${esc(url('/', c.slug))}" class="region-tile" title="${esc(c.longName)} — ${c.cities.length} cities, ${esc(c.currency)}">
              <span class="region-tile-name">${esc(c.longName)}</span>
              <span class="region-tile-meta">${c.cities.length} cities</span>
            </a>`,
          ).join('')}
        </div>
        <div class="mega-foot">
          <div class="mega-foot-list">
            <a href="${esc(resolveStatic(prefix, 'locations'))}" class="mega-foot-link">Every location ${icon('arrow', 'w-3.5 h-3.5')}</a>
          </div>
          <div class="mega-foot-note"><span>${icon('globe', 'w-4 h-4')}</span><span>72 countries · 283 cities · 25 currencies</span></div>
        </div>
      </div>
    </div>
  </header>

  <div class="drawer lg:hidden" id="mobileDrawer" aria-hidden="true">
    <div class="container py-6">
      <form action="/search/" method="get" class="relative mb-6" role="search">
        <input type="search" name="q" class="field pl-11" placeholder="Search services, locations, guides…" aria-label="Search" />
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">${icon('search', 'w-4 h-4')}</span>
      </form>
      <details class="mb-4" open>
        <summary class="faq-q !py-3 text-sm font-bold uppercase tracking-wider" style="color:var(--faint)">Services</summary>
        <div class="grid gap-0.5 pt-2">
          ${PAGE_SERVICES.map(
            (s) => `<a href="${esc(resolveServiceLink(prefix, s.slug))}" class="drawer-link">
              <span class="drawer-link-ico">${icon(s.icon, 'w-4 h-4')}</span>${esc(s.nav)}</a>`,
          ).join('')}
        </div>
      </details>
      <details class="mb-4">
        <summary class="faq-q !py-3 text-sm font-bold uppercase tracking-wider" style="color:var(--faint)">Locations</summary>
        <div class="grid grid-cols-2 gap-x-3 pt-2">
          ${PREFIXED_COUNTRIES.map((c) => `<a href="${esc(url('/', c.slug))}" class="drawer-link">${esc(c.longName)}</a>`).join('')}
        </div>
      </details>
      <details class="mb-4">
        <summary class="faq-q !py-3 text-sm font-bold uppercase tracking-wider" style="color:var(--faint)">Industries</summary>
        <div class="grid grid-cols-2 gap-x-3 pt-2">
          ${INDUSTRIES.slice(0, 14).map((i) => `<a href="${esc(resolveStatic(prefix, 'industries', i.slug))}" class="drawer-link">${esc(i.name)}</a>`).join('')}
        </div>
      </details>
      <div class="grid grid-cols-2 gap-x-3 pt-3 border-t" style="border-color:var(--border)">
        <a href="${esc(resolveStatic(prefix, 'packages'))}" class="drawer-link">Pricing</a>
        <a href="${esc(resolveStatic(prefix, 'portfolio'))}" class="drawer-link">Portfolio</a>
        <a href="${esc(resolveStatic(prefix, 'case-studies'))}" class="drawer-link">Case Studies</a>
        <a href="${esc(resolveStatic(prefix, 'blog'))}" class="drawer-link">Blog</a>
        <a href="${esc(resolveStatic(prefix, 'about'))}" class="drawer-link">About</a>
        <a href="${esc(resolveStatic(prefix, 'contact'))}" class="drawer-link">Contact</a>
        <a href="${esc(resolveStatic(prefix, 'free-audit'))}" class="drawer-link">Free Audit</a>
        <a href="${esc(resolveStatic(prefix, 'faq'))}" class="drawer-link">FAQ</a>
      </div>
      <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary btn-lg w-full mt-6">
        <span class="btn-ico">${icon('price-tag', 'w-4 h-4')}</span>Get a Free Quote
      </a>
      <a href="tel:${esc(SITE.contact.phoneE164)}" class="btn btn-ghost w-full mt-2.5">
        <span class="btn-ico">${icon('phone', 'w-4 h-4')}</span>${esc(SITE.contact.phone)}
      </a>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer — includes the required Instagram, emails and CTA
// ─────────────────────────────────────────────────────────────────────────────

function footer(prefix: string): string {
  const year = new Date().getFullYear();
  const serviceLinks = [
    ['website-design-services', 'Website Design Services'],
    ['seo-services', 'SEO Services'],
    ['logo-design-services', 'Logo Design Services'],
    ['ecommerce-website-design', 'Ecommerce Website Design'],
    ['ppc-advertising-services', 'PPC Advertising Services'],
    ['social-media-marketing', 'Social Media Marketing Services'],
    ['content-marketing-services', 'Content Marketing Services'],
    ['website-development', 'Website Development Services'],
  ];

  return `<footer class="site-footer">
    <div class="container">
      <div class="grid gap-10 lg:grid-cols-12 pb-12">
        <div class="lg:col-span-4">
          <a href="/" class="flex items-center gap-2.5 mb-4" aria-label="${esc(SITE.name)} — home">
            <img src="/assets/img/logo-72.webp" alt="${esc(SITE.name)} logo" width="40" height="40" class="rounded-lg" loading="lazy" decoding="async" />
            <span class="flex flex-col leading-none">
              <span class="font-extrabold text-lg tracking-tight" style="font-family:Sora,sans-serif">Website Design</span>
              <span class="text-[0.68rem] tracking-[0.22em] uppercase" style="color:var(--brand)">Company</span>
            </span>
          </a>
          <p class="text-sm text-muted leading-relaxed max-w-sm mb-5">${esc(SITE.shortDescription)}</p>
          <div class="flex flex-wrap gap-2 mb-5">
            <span class="chip chip-ok">${icon('check', 'w-3.5 h-3.5', 3)} Fixed prices</span>
            <span class="chip chip-ok">${icon('check', 'w-3.5 h-3.5', 3)} Unlimited revisions</span>
            <span class="chip chip-ok">${icon('check', 'w-3.5 h-3.5', 3)} Fast TAT</span>
          </div>
          <div class="flex gap-2">
            <a href="${esc(SITE.social.instagram)}" class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style="background:rgba(255,255,255,.05);border:1px solid var(--border)" aria-label="Website Design Company on Instagram" rel="noopener noreferrer me" target="_blank">${icon('camera', 'w-4 h-4', 2)}</a>
            <a href="${esc(SITE.social.facebook)}" class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style="background:rgba(255,255,255,.05);border:1px solid var(--border)" aria-label="Website Design Company on Facebook" rel="noopener noreferrer" target="_blank">${icon('share', 'w-4 h-4', 2)}</a>
            <a href="${esc(SITE.social.linkedin)}" class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style="background:rgba(255,255,255,.05);border:1px solid var(--border)" aria-label="Website Design Company on LinkedIn" rel="noopener noreferrer" target="_blank">${icon('briefcase', 'w-4 h-4', 2)}</a>
            <a href="${esc(SITE.social.x)}" class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style="background:rgba(255,255,255,.05);border:1px solid var(--border)" aria-label="Website Design Company on X" rel="noopener noreferrer" target="_blank">${icon('x', 'w-4 h-4', 2)}</a>
            <a href="${esc(SITE.social.youtube)}" class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style="background:rgba(255,255,255,.05);border:1px solid var(--border)" aria-label="Website Design Company on YouTube" rel="noopener noreferrer" target="_blank">${icon('video', 'w-4 h-4', 2)}</a>
          </div>
        </div>

        <div class="lg:col-span-2">
          <h2 class="text-xs font-bold uppercase tracking-[0.12em] mb-4" style="color:var(--faint)">Services</h2>
          <ul class="space-y-0.5">
            ${serviceLinks
              .map(([slug, name]) => `<li><a href="${esc(resolveServiceLink(prefix, slug))}" class="footer-link">${esc(name)}</a></li>`)
              .join('')}
            <li><a href="${esc(resolveStatic(prefix, 'services'))}" class="footer-link font-semibold" style="color:var(--brand)">All services →</a></li>
          </ul>
        </div>

        <div class="lg:col-span-2">
          <h2 class="text-xs font-bold uppercase tracking-[0.12em] mb-4" style="color:var(--faint)">Company</h2>
          <ul class="space-y-0.5">
            <li><a href="${esc(resolveStatic(prefix, 'about'))}" class="footer-link">About Us</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'packages'))}" class="footer-link">Pricing &amp; Packages</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'portfolio'))}" class="footer-link">Portfolio</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'case-studies'))}" class="footer-link">Case Studies</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'gallery'))}" class="footer-link">Gallery</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'blog'))}" class="footer-link">Blog</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'faq'))}" class="footer-link">FAQs</a></li>
            <li><a href="${esc(resolveStatic(prefix, 'contact'))}" class="footer-link">Contact</a></li>
          </ul>
        </div>

        <div class="lg:col-span-2">
          <h2 class="text-xs font-bold uppercase tracking-[0.12em] mb-4" style="color:var(--faint)">Popular Locations</h2>
          <ul class="space-y-0.5">
            ${PREFIXED_COUNTRIES.slice(0, 9)
              .map(
                (c) => `<li><a href="${esc(url('/', c.slug))}" class="footer-link">${esc(c.longName)}</a></li>`,
              )
              .join('')}
            <li><a href="${esc(resolveStatic(prefix, 'locations'))}" class="footer-link font-semibold" style="color:var(--brand)">All locations →</a></li>
          </ul>
        </div>

        <div class="lg:col-span-2">
          <h2 class="text-xs font-bold uppercase tracking-[0.12em] mb-4" style="color:var(--faint)">Get In Touch</h2>
          <ul class="space-y-3">
            <li>
              <a href="mailto:${esc(SITE.contact.email)}" class="flex items-start gap-2 text-sm text-muted hover:underline">
                <span class="mt-0.5 shrink-0" style="color:var(--brand)">${icon('mail', 'w-4 h-4', 2)}</span>
                <span class="break-all">${esc(SITE.contact.email)}</span>
              </a>
            </li>
            <li>
              <a href="mailto:${esc(SITE.contact.officialEmail)}" class="flex items-start gap-2 text-sm text-muted hover:underline">
                <span class="mt-0.5 shrink-0" style="color:var(--brand)">${icon('mail', 'w-4 h-4', 2)}</span>
                <span class="break-all">${esc(SITE.contact.officialEmail)}</span>
              </a>
            </li>
            <li>
              <a href="tel:${esc(SITE.contact.phoneE164)}" class="flex items-start gap-2 text-sm text-muted hover:underline">
                <span class="mt-0.5 shrink-0" style="color:var(--brand)">${icon('phone', 'w-4 h-4', 2)}</span>
                <span>${esc(SITE.contact.phone)}</span>
              </a>
            </li>
            <li class="flex items-start gap-2 text-sm text-muted">
              <span class="mt-0.5 shrink-0" style="color:var(--brand)">${icon('instagram', 'w-4 h-4', 2)}</span>
              <a href="${esc(SITE.social.instagram)}" class="break-all hover:underline" rel="me noopener noreferrer" target="_blank">@seoagency-usa</a>
            </li>
            <li class="flex items-start gap-2 text-sm text-muted">
              <span class="mt-0.5 shrink-0" style="color:var(--brand)">${icon('pin', 'w-4 h-4', 2)}</span>
              <span>${esc(SITE.contact.address.street)}, ${esc(SITE.contact.address.city)}, ${esc(SITE.contact.address.region)} ${esc(SITE.contact.address.postalCode)}</span>
            </li>
            <li class="flex items-start gap-2 text-sm text-muted">
              <span class="mt-0.5 shrink-0" style="color:var(--brand)">${icon('clock', 'w-4 h-4', 2)}</span>
              <span>${esc(SITE.contact.hours)}</span>
            </li>
          </ul>
          <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary btn-sm btn-shine w-full mt-4">Get a Free Quote</a>
        </div>
      </div>

      <div class="panel p-6 mb-10">
        <div class="grid gap-5 md:grid-cols-3 md:items-center">
          <div class="md:col-span-2">
            <h3 class="h4 mb-1.5">Not sure which service you need?</h3>
            <p class="text-sm text-muted">Book a free 20-minute consultation. We will tell you honestly what you actually need — even if that is less than you came for.</p>
          </div>
          <div class="flex flex-col sm:flex-row md:justify-end gap-2.5">
            <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary btn-sm">Get My Free Quote</a>
            <a href="${esc(resolveStatic(prefix, 'free-audit'))}" class="btn btn-ghost btn-sm">Request a Free Audit</a>
          </div>
        </div>
      </div>

      <div class="divider mb-8"></div>

      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-8">
        <p class="text-xs text-faint leading-relaxed max-w-2xl">
          &copy; ${year} ${esc(SITE.legalName)}. All rights reserved. Prices shown exclude taxes where applicable and are indicative in your local currency.
        </p>
        <ul class="flex flex-wrap gap-x-5 gap-y-2">
          <li><a href="${esc(resolveStatic(prefix, 'privacy-policy'))}" class="footer-link text-xs">Privacy Policy</a></li>
          <li><a href="${esc(resolveStatic(prefix, 'terms-of-service'))}" class="footer-link text-xs">Terms of Service</a></li>
          <li><a href="${esc(resolveStatic(prefix, 'cookie-policy'))}" class="footer-link text-xs">Cookie Policy</a></li>
          <li><a href="/admin/" class="footer-link text-xs">Client Login</a></li>
        </ul>
      </div>

      <div class="border-t pt-6 pb-2" style="border-color:var(--border)">
        <h4 class="text-[0.7rem] font-bold uppercase tracking-[0.12em] mb-3" style="color:var(--faint)">Service Areas</h4>
        <div class="marquee-mask overflow-hidden">
          <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.72rem] text-faint">
            ${COUNTRIES.flatMap((c) => [c.longName, ...c.cities.map((city) => city.name)])
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((n) => `<span>${esc(n)}</span>`)
              .join('<span aria-hidden="true">·</span>')}
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client runtime — ~2KB, deferred, progressive enhancement only
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENT_JS = String.raw`
(function () {
  'use strict';
  var d = document, h = d.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header scroll state */
  var header = d.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mega menu ──────────────────────────────────────────────────────
     Opens on hover (with an intent delay), on focus-within for keyboard
     users, and on click for touch. A small open delay stops the panel
     flickering when the pointer crosses the trigger. */
  (function () {
    var items = Array.prototype.slice.call(d.querySelectorAll('[data-mega]'));
    if (!items.length) return;
    var panels = {};
    items.forEach(function (item) {
      var btn = item.querySelector('button');
      var panel = d.getElementById(btn.getAttribute('aria-controls'));
      if (!btn || !panel) return;
      panels[panel.id] = { item: item, btn: btn, panel: panel, timer: null, open: false };

      var open = function () {
        var p = panels[panel.id];
        if (p.open) return;
        Object.keys(panels).forEach(function (k) { close(k, true); });
        p.panel.hidden = false;
        p.btn.setAttribute('aria-expanded', 'true');
        p.open = true;
      };
      var close = function (id, silent) {
        var p = panels[id];
        if (!p || !p.open) return;
        p.panel.hidden = true;
        p.btn.setAttribute('aria-expanded', 'false');
        p.open = false;
      };
      panels[panel.id].open_ = open;
      panels[panel.id].close_ = close;

      btn.addEventListener('mouseenter', function () {
        clearTimeout(panels[panel.id].timer);
        panels[panel.id].timer = setTimeout(open, 90);
      });
      item.addEventListener('mouseleave', function () {
        clearTimeout(panels[panel.id].timer);
        panels[panel.id].timer = setTimeout(function () { close(panel.id); }, 220);
      });
      panel.addEventListener('mouseenter', function () { clearTimeout(panels[panel.id].timer); });
      panel.addEventListener('mouseleave', function () {
        clearTimeout(panels[panel.id].timer);
        panels[panel.id].timer = setTimeout(function () { close(panel.id); }, 180);
      });
      panel.addEventListener('focusin', function () { clearTimeout(panels[panel.id].timer); open(); });
      panel.addEventListener('focusout', function (e) {
        if (!panel.contains(e.relatedTarget)) close(panel.id);
      });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (panels[panel.id].open) close(panel.id);
        else open();
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); open(); var f = panel.querySelector('a'); if (f) f.focus(); }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') Object.keys(panels).forEach(function (k) { panels[k].close_(k); });
    });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-mega]') || e.target.closest('[data-mega-panel]')) return;
      Object.keys(panels).forEach(function (k) { panels[k].close_(k); });
    });
    addEventListener('resize', function () {
      if (innerWidth < 1024) Object.keys(panels).forEach(function (k) { panels[k].close_(k); });
    });
  })();

  /* Mobile drawer */
  var menuBtn = d.getElementById('menuBtn');
  var drawer = d.getElementById('mobileDrawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      drawer.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      d.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        d.body.style.overflow = '';
      }
    });
  }

  /* Scroll reveal */
  var revealables = d.querySelectorAll('.reveal');
  if (revealables.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      revealables.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* 3D tilt on [data-tilt] */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('[data-tilt]').forEach(function (el) {
      var raf = 0, rx = 0, ry = 0;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
        rx = -((e.clientY - r.top) / r.height - 0.5) * 9;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-5px)';
        });
      });
      el.addEventListener('mouseleave', function () {
        cancelAnimationFrame(raf);
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 620);
      });
    });
  }

  /* Form handling — every form reports which page it came from */
  d.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var status = form.querySelector('[data-form-status]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      payload.page_url = location.href;
      payload.page_path = location.pathname;
      payload.page_title = d.title;
      payload.referrer = d.referrer || '';
      payload.utm_source = new URLSearchParams(location.search).get('utm_source') || '';
      payload.utm_medium = new URLSearchParams(location.search).get('utm_medium') || '';
      payload.utm_campaign = new URLSearchParams(location.search).get('utm_campaign') || '';
      payload.utm_term = new URLSearchParams(location.search).get('utm_term') || '';
      payload.gclid = new URLSearchParams(location.search).get('gclid') || '';
      payload.lang = navigator.language || 'en';
      payload.screen = window.screen.width + 'x' + window.screen.height;
      payload.device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
      payload.ts = Date.now();

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && res.ok) {
          if (status) {
            status.innerHTML = '<div class="flex items-start gap-3 p-4 rounded-xl" style="background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.32)"><span style="color:#34d399;flex-shrink:0;margin-top:2px">✓</span><div><div class="font-semibold text-sm">Thank you — we have your details.</div><div class="text-xs mt-1" style="color:var(--muted)">' + (res.message || 'We reply to every enquiry within one business day.') + '</div></div></div>';
            status.classList.remove('hidden');
          }
          form.reset();
        } else {
          throw new Error((res && res.error) || 'failed');
        }
      }).catch(function (err) {
        if (status) {
          var offline = /Failed to fetch|404|not found/i.test(String((err && err.message) || ''));
          status.innerHTML = offline
            ? '<div class="p-4 rounded-xl text-sm" style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35)"><div class="font-semibold">Preview build - the enquiry API is not connected on this host</div><div class="text-xs mt-1" style="color:var(--muted)">Email us at <a class="underline" href="mailto:marcomarketing.ali786@gmail.com">marcomarketing.ali786@gmail.com</a> and we will reply within one business day.</div></div>'
            : '<div class="p-4 rounded-xl text-sm" style="background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.32)"><div class="font-semibold">Something went wrong.</div><div class="text-xs mt-1" style="color:var(--muted)">Please email us directly at ' + '${SITE.contact.email}' + ' and we will help right away.</div></div>';
          status.classList.remove('hidden');
        }
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit'; }
      });
    });
  });

  /* Copy-to-clipboard on [data-copy] */
  d.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var v = el.dataset.copy;
      navigator.clipboard && navigator.clipboard.writeText(v).then(function () {
        var old = el.textContent;
        el.textContent = 'Copied!';
        setTimeout(function () { el.textContent = old; }, 1600);
      });
    });
  });

  /* TOC scroll-spy */
  var tocLinks = d.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var targets = [];
    tocLinks.forEach(function (a) {
      var el = d.querySelector(a.getAttribute('href'));
      if (el) targets.push([el, a]);
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var pair = targets.find(function (t) { return t[0] === e.target; });
          if (pair) pair[1].classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    targets.forEach(function (t) { spy.observe(t[0]); });
  }

  /* Live search on /search/ */
  var searchForm = d.querySelector('form[role=search][data-live-search]');
  if (searchForm) {
    var input = searchForm.querySelector('input[name=q]');
    var out = d.getElementById('searchResults');
    var q = new URLSearchParams(location.search).get('q') || '';
    if (input && q) input.value = q;
    var run = function () {
      var term = (input ? input.value : '').trim();
      if (term.length < 2) { if (out) out.innerHTML = ''; return; }
      // Prefer the server-side index: it ranks against the full corpus and
      // returns excerpts, and it keeps the browser from downloading a large
      // static index. Falls back to the local index on a static-only host.
      var useApi = true;
      fetch('/api/search?q=' + encodeURIComponent(term))
        .then(function (r) {
          if (!r.ok) throw new Error('api');
          return r.json();
        })
        .catch(function () {
          useApi = false;
          return fetch('/search-index.json').then(function (r) { return r.json(); });
        })
        .then(function (data) {
          if (!useApi) data = { results: localSearch(data, term) };
          if (!out) return;
          if (!data.results || !data.results.length) {
            out.innerHTML = '<div class="card p-7 text-center"><h3 class="h4 mb-2">No results for "' + term.replace(/[<>&]/g,'') + '"</h3><p class="text-sm text-muted">Try a different term, or <a href="/contact/" class="underline" style="color:var(--brand)">ask us directly</a>.</p></div>';
            return;
          }
          out.innerHTML = data.results.map(function (r) {
            return '<a href="' + r.u + '" class="card card-hover p-4 block mb-2.5">' +
              '<div class="flex items-center gap-2 mb-1.5"><span class="chip text-xs">' + r.y.replace(/-/g,' ') + '</span></div>' +
              '<h3 class="font-bold text-base mb-1">' + r.t + '</h3>' +
              (r.e ? '<p class="text-sm text-muted leading-relaxed">' + r.e + '</p>' : '') + '</a>';
          }).join('');
        })
        .catch(function () {});
    };
    var t;
    if (input) input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(run, 260); });
    if (q) run();
  }

  /* Checkout — create the order, then show settlement instructions */
  var orderForm = d.querySelector('[data-order-form]');
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = orderForm.querySelector('button[type=submit]');
      var status = orderForm.parentElement.querySelector('[data-form-status]');
      var card = d.querySelector('[data-checkout-card]');
      btn.disabled = true; btn.textContent = 'Creating your order…';
      var payload = {};
      new FormData(orderForm).forEach(function (v, k) {
        payload[k] = orderForm.elements[k] && orderForm.elements[k].type === 'checkbox'
          ? (orderForm.elements[k].checked ? 'on' : '') : v;
      });
      payload.page_path = location.pathname;
      payload.page_url = location.href;
      fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res.ok) throw new Error(res.error || 'failed');
        var methodLabel = { paypal: 'PayPal', card: 'Card (via PayPal)', bank: 'Bank transfer', crypto: 'Cryptocurrency' }[res.payMethod] || 'PayPal';
        var pay = res.payUrl
          ? '<a href="' + res.payUrl + '" target="_blank" rel="noopener" class="btn btn-primary btn-lg btn-shine w-full mt-4">Continue to ' + methodLabel + ' \u2197</a>'
          : '';
        card.innerHTML =
          '<div class="text-center py-6">' +
          '<div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style="background:hsla(152,70%,50%,.16);border:1px solid hsla(152,70%,50%,.36);color:#34d399;font-size:1.9rem">\u2713</div>' +
          '<h2 class="h3 mb-2">Order created</h2>' +
          '<p class="text-sm text-muted mb-1">Reference <strong class="font-mono" style="color:var(--brand)">' + res.ref + '</strong></p>' +
          '<p class="text-lg font-extrabold mb-5" style="font-family:Sora,sans-serif">' + res.display + '</p>' +
          '<div class="panel text-left mb-4"><div class="text-xs font-bold uppercase tracking-wider mb-2" style="color:var(--faint)">How to pay \u00b7 ' + methodLabel + '</div>' +
          '<pre class="text-xs whitespace-pre-wrap leading-relaxed font-sans" style="color:#c3cee6">' + res.instructions.replace(/[<>&]/g, function(m){return ({'<':'&lt;','>':'&gt;','&':'&amp;'}[m]);}) + '</pre></div>' +
          pay +
          '<p class="text-xs text-faint mt-4">A confirmation email is on its way. A named project manager will contact you within one business day.</p>' +
          '<div class="flex gap-2 justify-center mt-5"><a href="/contact/" class="btn btn-ghost btn-sm">Add project details</a><a href="/" class="btn btn-ghost btn-sm">Back to homepage</a></div>' +
          '</div>';
        btn = null;
      }).catch(function (err) {
        if (status) {
          var apiMissing = /Failed to fetch|404|not found/i.test(String((err && err.message) || ''));
          status.innerHTML = apiMissing
            ? '<div class="p-4 rounded-xl text-sm" style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35)"><div class="font-semibold">Preview build - the order API is not connected on this host</div><div class="text-xs mt-1" style="color:var(--muted)">Send your requirements to <a class="underline" href="mailto:marcomarketing.ali786@gmail.com">marcomarketing.ali786@gmail.com</a> and we will issue a fixed quote and a payment link directly.</div></div>'
            : '<div class="p-4 rounded-xl text-sm mb-3" style="background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.32)"><div class="font-semibold">' + (err.message || 'Something went wrong.') + '</div><div class="text-xs mt-1" style="color:var(--muted)">Please email us and we will take your order manually.</div></div>';
          status.classList.remove('hidden');
        }
        btn.disabled = false; btn.textContent = 'Create My Order & Continue to Payment';
      });
    });
    /* Payment-method buttons preselect the method then submit */
    d.querySelectorAll('[data-pay-method]').forEach(function (b) {
      b.addEventListener('click', function () {
        var sel = orderForm.querySelector('select[name=pay_method]');
        if (!sel) {
          sel = document.createElement('select');
          sel.name = 'pay_method'; sel.type = 'hidden';
          orderForm.appendChild(sel);
        }
        if (sel.tagName === 'SELECT' && !sel.options.length) {
          ['paypal', 'card', 'bank', 'crypto'].forEach(function (m) {
            var o = document.createElement('option'); o.value = m; o.textContent = m; sel.appendChild(o);
          });
        }
        sel.value = b.dataset.payMethod;
        orderForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });
  }

  /* Local fallback search over the compact static index. */
  function localSearch(index, term) {
    var terms = term.toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    for (var i = 0; i < index.length && out.length < 40; i++) {
      var r = index[i];
      var hay = (r.t + ' ' + r.k + ' ' + r.y).toLowerCase();
      var score = 0;
      for (var j = 0; j < terms.length; j++) {
        if (r.t.toLowerCase().indexOf(terms[j]) === 0) score += 12;
        else if (r.t.toLowerCase().indexOf(terms[j]) >= 0) score += 7;
        if ((r.k || '').toLowerCase().indexOf(terms[j]) >= 0) score += 5;
        if (hay.indexOf(terms[j]) >= 0) score += 2;
      }
      if (score > 0) { r.score = score; out.push(r); }
    }
    return out.sort(function (a, b) { return b.score - a.score; });
  }

  /* Query-driven filtering on the blog and portfolio index pages.
     The static page ships every card; ?category= / ?industry= narrows it
     client-side so filter links resolve to a real page and actually work. */
  (function () {
    var chips = d.querySelectorAll('[data-filter-chip]');
    if (!chips.length) return;
    var key = chips[0].dataset.filterChip === 'blog' ? 'category' : 'industry';
    var items = d.querySelectorAll('[data-filterable="' + key + '"]');
    var badge = d.getElementById('activeFilter');
    var param = new URLSearchParams(location.search).get(key);
    if (!param) return;

    var apply = function (value) {
      var shown = 0;
      items.forEach(function (el) {
        var match = el.dataset.filterValue === value;
        el.style.display = match ? '' : 'none';
        if (match) shown += 1;
      });
      chips.forEach(function (c) {
        c.classList.toggle('chip-brand', c.dataset.value === value);
        c.classList.toggle('chip', c.dataset.value !== value);
      });
      if (badge) {
        if (value) {
          badge.textContent = value + ' \u00d7';
          badge.classList.remove('hidden');
          badge.setAttribute('data-clear', '1');
        } else {
          badge.classList.add('hidden');
        }
      }
      if (!shown) {
        var empty = d.getElementById('filterEmpty');
        if (empty) empty.classList.remove('hidden');
      }
    };

    chips.forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        var next = c.dataset.value === param ? '' : c.dataset.value;
        history.replaceState(null, '', next ? '?' + key + '=' + encodeURIComponent(next) : location.pathname);
        apply(next);
      });
    });
    if (badge) {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', function () {
        history.replaceState(null, '', location.pathname);
        apply('');
      });
    }
    apply(param);
  })();

  /* Animated counters */
  var counters = d.querySelectorAll('[data-count-to]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.dataset.countTo), dur = 1400, t0 = performance.now();
        var step = function (now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }
})();
`;
