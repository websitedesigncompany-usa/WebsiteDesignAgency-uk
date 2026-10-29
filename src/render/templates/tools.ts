/**
 * Free tools — index and individual tool pages.
 *
 * The clustering rule: every tool has a root page at /tools/{slug}/ and a
 * regional page at /{country}/tools/{slug}/ whose copy, currency, examples
 * and internal links are all rewritten for that market. That is what makes
 * these pages rank for "invoice generator UK" rather than competing with
 * each other.
 */

import { esc, richText, truncate } from '../../lib/html.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import {
  section, sectionHead, grid, breadcrumbs, ctaBand, faqBlock, linkCloud,
  trustBadges, statsBar, aggregateRatingBlock,
} from '../components.js';
import { hero, leadForm, inlineCta } from '../hero.js';
import { TOOLS, TOOL_CATEGORIES, Tool, ToolCategory } from '../../data/tools.js';
import { SERVICE_BY_SLUG } from '../../data/services.js';
import { marketBlock } from './market.js';
import { localContext } from '../../data/local-context.js';
import { Country, City } from '../../data/regions.js';
import { resolveServiceLink, resolveStatic, resolveToolLink, url } from '../../lib/routing.js';

export interface ToolPageModel {
  tool: Tool;
  country: Country;
  city?: City;
  prefix: string;
  crumbs: { name: string; url: string }[];
  related: Tool[];
  /** Localised sub-lists for the regional pages. */
  localCurrency: string;
  localTaxNote: string;
  localExamples: string[];
}

const CATEGORY_LABEL: Record<ToolCategory, string> = {
  content: 'Content Tools',
  design: 'Design Tools',
  developer: 'Developer Tools',
  seo: 'SEO Tools',
  business: 'Business Tools',
  security: 'Security Tools',
};

export function toolsIndexPage(args: {
  prefix: string;
  country: Country;
  city?: City;
  crumbs: { name: string; url: string }[];
  heading: string;
  sub: string;
}): string {
  const { prefix, country, city, crumbs, heading, sub } = args;
  const loc = city ? `${city.name}, ${country.longName}` : country.longName;

  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `${TOOLS.length} free tools · no account · nothing uploaded`,
  h1Prefix: heading,
  sub,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'Browse Services',
  secondaryHref: resolveStatic(prefix, 'services'),
  chips: ['Runs in your browser', 'No sign-up', 'No data leaves your device', 'Free forever'],
})}

${section({
  children: `${statsBar()}
  <div class="mt-10">${trustBadges()}</div>`,
  tight: true,
})}

${marketBlock(country, {
  subject: 'these tools',
  h2: `Free tools for teams in ${country.longName}`,
  eyebrow: `In ${country.longName}`,
  close: `Everything here runs in your browser and never sends a file to us. If you would rather have the same checks run for you and get the findings in writing, we do that too — quoted in ${country.currency}.`,
  prices: [
    { label: 'Website design from', usd: 99 },
    { label: 'Website redesign from', usd: 449 },
  ],
})}

${TOOL_CATEGORIES.map((cat) => {
  const tools = TOOLS.filter((t) => t.category === cat.key);
  if (!tools.length) return '';
  return section({
    children: `${sectionHead({
      eyebrow: cat.name,
      h2: cat.blurb,
      align: 'left',
    })}
    ${grid(3, tools.map((t) => toolCard(t, prefix, country)).join(''))}`,
    tight: true,
  });
}).join('')}

${section({
  children: `<div class="grid lg:grid-cols-2 gap-10 items-start">
    ${leadForm({
      variant: 'contact',
      heading: 'Need something these tools do not cover?',
      sub: `We build the systems behind the tools — CMS, dashboards, tracking and reporting for businesses in ${loc}. Tell us what you need and we will scope it.`,
      showServiceSelect: true,
      servicesList: ['website-design-services', 'seo-services', 'website-development', 'custom-software-development', 'analytics-setup-services'].map((s) => SERVICE_BY_SLUG[s]).filter(Boolean).map((s) => ({ slug: s.slug, name: s.name })),
    })}
    <div>
      <h2 class="h2 mb-4">Why these tools are free</h2>
      <p class="text-muted leading-relaxed mb-4">They are genuinely free and genuinely useful. We built them because we use the same logic in client work, and because a tool that solves a real problem earns the link and the conversation that a blog post cannot.</p>
      <p class="text-muted leading-relaxed">None of them send your data anywhere. Everything runs in your browser, which also means they work offline and never store what you type.</p>
      <div class="mt-6">${linkCloud([
        { name: 'Website Design Services', url: url(prefix, 'website-design-services') },
        { name: 'SEO Services', url: url(prefix, 'seo-services') },
        { name: 'Custom Software Development', url: url(prefix, 'custom-software-development') },
        { name: 'Web Hosting', url: url(prefix, 'web-hosting-services') },
      ])}</div>
    </div>
  </div>`,
})}`;
}

function toolCard(t: Tool, prefix: string, country: Country): string {
  const href = resolveStatic(prefix, 'tools', t.slug);
  return `<a href="${esc(href)}" class="block h-full reveal" style="--hue:${t.hue}">
    <div class="card card-hover card-glow p-6 h-full flex flex-col">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style="background:hsla(${t.hue},85%,55%,.15);border:1px solid hsla(${t.hue},85%,55%,.3);color:hsl(${t.hue},85%,62%)">
        ${icon(t.icon, 'w-5 h-5')}
      </div>
      <h3 class="h4 mb-2">${esc(t.name)}</h3>
      <p class="text-sm text-muted leading-relaxed flex-1">${esc(truncate(t.summary, 130))}</p>
      <div class="mt-4 pt-3.5 border-t flex items-center justify-between text-xs" style="border-color:var(--border)">
        <span class="chip text-xs">${esc(CATEGORY_LABEL[t.category])}</span>
        <span class="font-semibold" style="color:var(--brand)">Open tool →</span>
      </div>
    </div>
  </a>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual tool page
// ─────────────────────────────────────────────────────────────────────────────

export function toolPage(m: ToolPageModel): string {
  const { tool, country, city, prefix, crumbs, related, localExamples } = m;
  const loc = city ? `${city.name}, ${country.longName}` : country.longName;
  const ctx = localContext(country.code);
  const kw = city
    ? `${tool.primaryKeyword} in ${city.name}`
    : country.slug
      ? `${tool.primaryKeyword} in ${country.longName}`
      : tool.primaryKeyword;

  const service = SERVICE_BY_SLUG[tool.primaryService];
  const relatedServices = tool.relatedServices.map((s) => SERVICE_BY_SLUG[s]).filter(Boolean);
  const toolHref = resolveStatic(prefix, 'tools', tool.slug);

  return `
${breadcrumbs(crumbs)}

${hero({
  eyebrow: `Free tool · ${CATEGORY_LABEL[tool.category]} · no account required`,
  h1Prefix: tool.primaryKeyword,
  h1Emphasis: city ? `in ${city.name}` : country.slug ? `in ${country.longName}` : '— free',
  sub: tool.summary,
  primaryLabel: 'Use this tool',
  primaryHref: '#tool',
  secondaryLabel: 'Get a Free Quote',
  secondaryHref: resolveStatic(prefix, 'contact'),
  chips: tool.freeTier.slice(0, 4),
})}

${section({
  children: `<div class="grid lg:grid-cols-12 gap-8 items-start">
    <div class="lg:col-span-8">
      <div class="card p-5 md:p-7" id="tool">
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 class="h3">${esc(tool.name)}</h2>
          <span class="chip chip-ok">${icon('check', 'w-3.5 h-3.5', 3)} Runs in your browser</span>
        </div>
        <div id="tool-widget" data-tool="${esc(tool.widget)}"></div>
        <p class="text-xs text-faint mt-5 leading-relaxed">
          ${esc(tool.localNote(loc))}
        </p>
      </div>
      <div class="card p-5 md:p-6 mt-5">
        <h2 class="h4 mb-4">Set up for ${esc(country.longName)}</h2>
        <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div class="flex justify-between gap-4 py-1.5" style="border-bottom:1px solid var(--border)">
            <dt class="text-faint">Currency</dt>
            <dd class="text-right font-semibold">${esc(country.currency)}${country.symbol !== country.currency ? ` (${esc(country.symbol)})` : ''}</dd>
          </div>
          <div class="flex justify-between gap-4 py-1.5" style="border-bottom:1px solid var(--border)">
            <dt class="text-faint">${esc(ctx.taxLabel)}</dt>
            <dd class="text-right font-semibold">${esc(ctx.taxRate)}</dd>
          </div>
          <div class="flex justify-between gap-4 py-1.5" style="border-bottom:1px solid var(--border)">
            <dt class="text-faint">Business ID</dt>
            <dd class="text-right font-semibold">${esc(ctx.idLabel)}</dd>
          </div>
          <div class="flex justify-between gap-4 py-1.5" style="border-bottom:1px solid var(--border)">
            <dt class="text-faint">Address format</dt>
            <dd class="text-right font-semibold">${esc(ctx.address)}</dd>
          </div>
          <div class="flex justify-between gap-4 py-1.5" style="border-bottom:1px solid var(--border)">
            <dt class="text-faint">Phone format</dt>
            <dd class="text-right font-semibold">${esc(ctx.phone)}</dd>
          </div>
          <div class="flex justify-between gap-4 py-1.5" style="border-bottom:1px solid var(--border)">
            <dt class="text-faint">Date format</dt>
            <dd class="text-right font-semibold">${esc(ctx.dateFormat)}</dd>
          </div>
        </dl>
        <p class="text-sm text-muted leading-relaxed mt-4">
          <strong class="text-[#c3cee6]">How people pay here:</strong> ${esc(ctx.payments)}.
          <strong class="text-[#c3cee6] ml-1">How companies are named:</strong> ${esc(ctx.naming)}.
        </p>
      </div>
    </div>

    <div class="lg:col-span-4">
      <div class="lg:sticky" style="top:calc(var(--header-h) + 22px)">
        <div class="card p-5 mb-5">
          <h2 class="h4 mb-3">What it does</h2>
          <ul class="space-y-2.5" role="list">
            ${tool.features.map((f) => `<li class="flex gap-2.5 text-sm text-[#c3cee6] leading-relaxed">
              <span class="shrink-0 mt-0.5" style="color:var(--ok)">${icon('check', 'w-4 h-4', 2.6)}</span><span>${esc(f)}</span></li>`).join('')}
          </ul>
        </div>
        <div class="card p-5 mb-5">
          <h2 class="h4 mb-3">Free includes</h2>
          <ul class="space-y-2" role="list">
            ${tool.freeTier.map((f) => `<li class="flex gap-2.5 text-sm text-muted"><span style="color:var(--brand)">·</span><span>${esc(f)}</span></li>`).join('')}
          </ul>
          <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-primary btn-sm w-full mt-4">Need this done for you?</a>
        </div>
        ${service ? `<div class="card p-5">
          <div class="eyebrow mb-2">Related service</div>
          <h2 class="h4 mb-2">${esc(service.name)}</h2>
          <p class="text-sm text-muted leading-relaxed mb-4">${esc(truncate(service.tagline, 110))}</p>
          <a href="${esc(resolveServiceLink(prefix, service.slug))}" class="btn btn-ghost btn-sm w-full">View service</a>
        </div>` : ''}
      </div>
    </div>
  </div>`,
})}

${marketBlock(country, {
  subject: 'this tool',
  h2: `Using the ${tool.name.toLowerCase()} for a business in ${country.longName}`,
  eyebrow: `In ${country.longName}`,
  close: `We price the work that sits behind this tool in ${country.currency}, so the numbers on this page are the numbers you will see in a quote.`,
  prices: service ? [{ label: `${service.name} from`, usd: service.fromPrice }] : [],
})}

${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <h2 class="h2 mb-5">How to use the ${esc(tool.name.toLowerCase())}</h2>
      <ol class="space-y-4" role="list">
        ${tool.howTo.map((s, i) => `<li class="flex gap-4">
          <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0" style="background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#04070f">${i + 1}</span>
          <span class="text-[#c3cee6] leading-relaxed pt-1.5">${esc(s)}</span></li>`).join('')}
      </ol>

      <h2 class="h2 mt-12 mb-5">Where teams in ${esc(loc)} use it</h2>
      <div class="grid sm:grid-cols-2 gap-3">
        ${(localExamples.length ? localExamples : tool.useCases).map((u) => `<div class="card p-4 flex items-start gap-3">
          <span class="shrink-0 mt-0.5" style="color:var(--brand)">${icon('arrow', 'w-4 h-4', 2.2)}</span>
          <span class="text-sm text-[#c3cee6] leading-relaxed">${esc(u)}</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="lg:col-span-5">
      <div class="panel mb-6">
        <h2 class="h4 mb-3">${esc(tool.name)} — FAQ</h2>
        ${faqBlock(tool.faqs)}
      </div>
      ${relatedServices.length ? `<div class="panel">
        <h2 class="h4 mb-3">Related services</h2>
        <div class="space-y-2">
          ${relatedServices.map((s) => `<a href="${esc(resolveServiceLink(prefix, s.slug))}" class="trust-badge w-full justify-between">${esc(s.name)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>`).join('')}
        </div>
      </div>` : ''}
    </div>
  </div>`,
})}

${related.length ? section({
  children: `${sectionHead({ eyebrow: 'More free tools', h2: 'Other tools you can use right now', align: 'left' })}
  ${grid(3, related.map((t) => toolCard(t, prefix, country)).join(''))}`,
  tight: true,
}) : ''}

${section({
  children: ctaBand({
    title: `Want this done for you, rather than by hand?`,
    body: `We build the systems behind tools like this — CMS, dashboards, tracking and reporting for businesses in ${loc}. Fixed price, written scope, fast delivery.`,
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'See Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}
