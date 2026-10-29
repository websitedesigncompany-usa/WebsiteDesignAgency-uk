/** Legal, industry, and remaining static page templates. */

import { esc, formatDate } from '../../lib/html.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import { section, sectionHead, grid, breadcrumbs, ctaBand, faqBlock, checkList, statsBar, linkCloud } from '../components.js';
import { hero, leadForm } from '../hero.js';
import { postCard } from './service.js';
import { Industry } from '../../data/industries.js';
import { Service, SERVICE_BY_SLUG } from '../../data/services.js';
import { Country } from '../../data/regions.js';
import { resolveChild, resolveServiceLink, resolveStatic, resolveToolLink, url } from '../../lib/routing.js';

// ─────────────────────────────────────────────────────────────────────────────
// Legal
// ─────────────────────────────────────────────────────────────────────────────

export function legalPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  title: string;
  heading: string;
  updated: string;
  sections: { h: string; body: string[] }[];
  hue: number;
}): string {
  return `
${breadcrumbs(args.crumbs)}
<header class="container pt-10 pb-6">
  <div class="max-w-3xl">
    <div class="eyebrow mb-4">Legal</div>
    <h1 class="h1">${esc(args.heading)}</h1>
    <p class="text-sm text-faint mt-4">Last updated: ${esc(formatDate(args.updated))}</p>
  </div>
</header>
${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <aside class="lg:col-span-3">
      <div class="toc">
        <h2 class="text-xs font-bold uppercase tracking-[0.12em] mb-3" style="color:var(--faint)">Contents</h2>
        ${args.sections.map((s, i) => `<a href="#sec-${i + 1}">${esc(s.h)}</a>`).join('')}
      </div>
    </aside>
    <div class="lg:col-span-9 prose article">
      <p class="text-sm text-muted">This document is written in plain English to be readable. It is not legal advice. If you need advice on how this applies to your specific situation, please consult a qualified lawyer in your jurisdiction.</p>
      ${args.sections.map((s, i) => `<h2 id="sec-${i + 1}">${esc(s.h)}</h2>${s.body.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}`).join('\n      ')}
    </div>
  </div>`,
  tight: true,
})}`;
}

export const PRIVACY_SECTIONS = [
  {
    h: 'Who we are',
    body: [
      `${SITE.legalName} ("we", "us") operates the website at ${SITE.origin}. We are a web design and digital marketing company registered in Delaware, United States.`,
      `For any question about this policy or your data, contact us at ${SITE.contact.email} or write to us at ${SITE.contact.address.street}, ${SITE.contact.address.city}, ${SITE.contact.address.region} ${SITE.contact.address.postalCode}, United States.`,
    ],
  },
  {
    h: 'What we collect',
    body: [
      'Information you give us. When you submit a form on any page of this site, request an audit, or place an order, we collect the details you enter: your name, email address, phone number, company name, website domain and anything you type into the message field. We also record which page the form was submitted from, the referring URL, any UTM campaign parameters, your device type, screen size and browser language.',
      'Information collected automatically. Our servers may record standard technical data such as IP address, browser type, referring page and pages viewed, in order to operate the site and understand how it is used.',
      'Payment information. Payments are processed entirely by third-party providers (PayPal or, for crypto, the relevant blockchain network). We never receive or store your full card number, your PayPal password or your private wallet keys. We store only the transaction reference and the amount.',
    ],
  },
  {
    h: 'Why we collect it',
    body: [
      'To respond to your enquiry and prepare a quote. This is the primary purpose of collecting form data.',
      'To create and administer your project workspace if you place an order.',
      'To send you invoices and project updates.',
      'To improve the website — for example, to understand which pages are useful and which are not, and to fix broken links and performance problems.',
      'To comply with our legal and tax obligations.',
    ],
  },
  {
    h: 'How long we keep it',
    body: [
      'Enquiries that do not become projects: up to 24 months, after which they are deleted.',
      'Project and order records: seven years, because tax and accounting law generally requires this.',
      'Analytics data: 14 months, then aggregated and anonymised.',
    ],
  },
  {
    h: 'Who we share it with',
    body: [
      'We do not sell your data. We do not rent it. We do not share it for advertising purposes.',
      'We share it only with the service providers strictly necessary to operate our business: our payment processor, our email provider, our hosting provider and our CRM. Each is contractually required to protect it.',
      'We may disclose data if legally required to do so, for example under a valid court order.',
    ],
  },
  {
    h: 'Your rights',
    body: [
      'Under the GDPR, UK GDPR, CCPA/CPRA and comparable laws you may have the right to: access the data we hold about you; request correction of inaccurate data; request deletion; restrict or object to processing; receive a portable copy; and withdraw consent at any time.',
      `To exercise any of these, email ${SITE.contact.email} with the subject "Data request". We respond within 30 days. We may ask you to verify your identity before we can act on a request.`,
      'If you are in the EEA or UK and believe we have handled your data unlawfully, you have the right to complain to your local supervisory authority.',
    ],
  },
  {
    h: 'International transfers',
    body: [
      'We operate internationally and our service providers may process data outside your country. Where data is transferred outside the UK or EEA, we rely on Standard Contractual Clauses or an equivalent safeguard, and we minimise what is transferred.',
    ],
  },
  {
    h: 'Cookies',
    body: [
      'We use a minimal number of cookies. See our Cookie Policy for the specific list. You can control cookies through your browser settings and through any consent management tool we deploy.',
    ],
  },
  {
    h: 'Security',
    body: [
      'All traffic is encrypted with TLS. Data is stored on infrastructure with restricted access, encrypted at rest and regular backups. Access is limited to staff who need it and is logged. No system is perfectly secure, but we treat security as an ongoing obligation rather than a checkbox.',
    ],
  },
  {
    h: 'Changes to this policy',
    body: [
      'We update this policy when our practices change. Material changes are announced on this page with an updated date at the top. Continuing to use the site after a change constitutes acceptance of the updated policy.',
    ],
  },
  {
    h: 'Contact',
    body: [
      `Questions about this policy: ${SITE.contact.email}. We answer every legitimate privacy question in writing.`,
    ],
  },
];

export const TERMS_SECTIONS = [
  {
    h: 'Agreement to terms',
    body: [
      `By using this website or engaging ${SITE.legalName} ("we", "us") you agree to these terms. If you do not agree, please do not use the site.`,
      'These terms apply to website design, development, SEO, content, marketing, video and related services. A signed proposal or written scope agreed in writing between us and you ("the Project") takes precedence over these terms where they conflict.',
    ],
  },
  {
    h: 'Scope, quotes and pricing',
    body: [
      'All prices published on this site are fixed prices for the scope described on the same page. They exclude third-party costs such as hosting, premium themes, paid plugins, stock imagery, app subscriptions, advertising spend and print production.',
      'Before work begins we issue a written scope listing deliverables, exclusions, delivery date, price and revision terms. Work does not begin until you approve that scope. If you request work outside the agreed scope, we will quote it separately and in advance — we will never add it to your invoice without written agreement.',
    ],
  },
  {
    h: 'Payment terms',
    body: [
      'Payment methods: PayPal (including card payment through PayPal), bank transfer, and cryptocurrency (USDT, BTC or ETH) on request. We do not use Stripe.',
      'Project fees are payable as specified in your proposal — typically 50% on approval and 50% on delivery, or 100% upfront for packages under $1,000. Retainers (SEO, PPC and similar) are billed monthly in advance.',
      'Recurring fees continue until cancelled with 30 days written notice. Cancellation takes effect at the end of the current billing period.',
      'Prices are exclusive of VAT, GST, sales tax and any equivalent consumption tax. Where we must collect such tax, we add it clearly at the point of invoice.',
    ],
  },
  {
    h: 'Delivery',
    body: [
      'Delivery dates are estimates based on the agreed scope and on you providing content, feedback and approvals in a timely manner. Delays in receiving content or feedback move the delivery date accordingly.',
      'If we will miss a delivery date by more than five business days for reasons within our control, we will tell you before the original date, and we will offer the remedy set out in the refund section below.',
    ],
  },
  {
    h: 'Revisions',
    body: [
      'Design packages include unlimited revisions on the selected design direction. A "revision" is a round of consolidated feedback on an existing design. Introducing a materially different direction after approval of a design may be treated as a new design, and we will say so and quote it before starting.',
      'Feedback must be consolidated into a single prioritised list per round and sent by the person named as decision-maker on the project. Uncoordinated feedback from multiple parties moves the schedule and may be charged at our then-current rate.',
    ],
  },
  {
    h: 'Client responsibilities',
    body: [
      'You confirm that you have the right to use all materials you supply to us — logos, photographs, copy, data and trademarks. We are not responsible for infringement arising from materials you provide.',
      'You will nominate one decision-maker who can approve designs and content within a reasonable time.',
      'You will provide accurate information about your business, products and legal or regulatory requirements. We rely on it.',
    ],
  },
  {
    h: 'Ownership and licensing',
    body: [
      'On full payment, all rights in the deliverables created specifically for you transfer to you, including source code, design files, content and photography produced by us for the project.',
      'We retain ownership of our pre-existing tools, libraries, internal frameworks and generic components, and grant you a perpetual, worldwide, non-exclusive licence to use them as part of the delivered work.',
      'We may display the project in our portfolio and case studies unless you ask us in writing not to. We will never disclose confidential information about your business without written permission.',
    ],
  },
  {
    h: 'Third-party platforms and services',
    body: [
      'Some services depend on third-party platforms (for example hosting providers, payment processors, social networks, advertising platforms and stock libraries). Their availability, pricing and policies are outside our control.',
      'Where a deliverable depends on such a platform, we are not liable for that platform ceasing to operate, changing its terms, or removing content.',
    ],
  },
  {
    h: 'Refunds and guarantees',
    body: [
      'Before work starts: full refund on request.',
      'Before the first design is approved: we continue revising. If you are not satisfied after three structured rounds, you may cancel for a full refund minus any work already completed and delivered to you.',
      'If we miss an agreed delivery date by more than five business days for reasons within our control, you may claim 20% off the project fee. This is the sole remedy for delay.',
      'We do not guarantee specific rankings, traffic volumes or revenue results from SEO or paid media. Those depend on factors outside our control, including your market, competition, budget and sales process. We guarantee transparent reporting and honest advice about what is realistic.',
    ],
  },
  {
    h: 'Confidentiality',
    body: [
      'We treat your business information as confidential and will not disclose it to third parties except to service providers who need it to perform the work, or where legally required.',
      'We are happy to sign your NDA before any project.',
    ],
  },
  {
    h: 'Limitation of liability',
    body: [
      'To the maximum extent permitted by law, our total liability arising out of or relating to a project is limited to the fees you paid us for that project in the twelve months preceding the claim.',
      'We are not liable for indirect or consequential loss, including loss of profit, revenue or data, except where such limitation is prohibited by law, including under the UK Consumer Rights Act 2015.',
      'Nothing in these terms limits our liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.',
    ],
  },
  {
    h: 'Governing law',
    body: [
      'These terms are governed by the laws of the State of Delaware, United States. Where you are a consumer resident in the UK or EU, you retain the benefit of any mandatory consumer protections of your country of residence.',
      'Disputes: we will first attempt to resolve any dispute informally. If that fails, either party may commence proceedings in the courts of Delaware, and you may also pursue any mandatory dispute resolution available to you locally.',
    ],
  },
  {
    h: 'Changes',
    body: [
      'We may update these terms. The date at the top of this page shows the latest version. Continued use of the site or services after a change constitutes acceptance.',
    ],
  },
];

export const COOKIE_SECTIONS = [
  {
    h: 'What cookies are',
    body: [
      'Cookies are small text files a website stores on your device. Some are essential to make the site work. Others are optional and used to understand usage or provide features.',
    ],
  },
  {
    h: 'Cookies we set',
    body: [
      'Strictly necessary: session and security cookies required for the site to function, including the administrative login session and CSRF protection. These cannot be disabled without breaking the site.',
      'Analytics: aggregate, privacy-conscious measurement of page views and referrers. IP addresses are anonymised and data is not shared with advertising networks.',
      'Preferences: remembers choices such as your region or currency so you do not have to re-select them on every visit.',
    ],
  },
  {
    h: 'Cookies we do not set',
    body: [
      'We do not run third-party advertising cookies, cross-site tracking pixels, or data brokers. We do not sell or share behavioural data with advertising networks.',
    ],
  },
  {
    h: 'Managing cookies',
    body: [
      'You can accept, reject or delete cookies through any consent tool shown on the site, and through your browser settings. Disabling strictly necessary cookies will prevent parts of the site from working.',
    ],
  },
  {
    h: 'Contact',
    body: [`Questions about cookies: ${SITE.contact.email}.`],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Industry
// ─────────────────────────────────────────────────────────────────────────────

export function industryPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  industry: Industry;
  country: Country;
  services: Service[];
  price: (usd: number, pkgId?: string) => string;
  posts: Parameters<typeof postCard>[0][];
  caseStudies: { slug: string; title: string; excerpt: string; metric: string; prefix: string }[];
  hue: number;
}): string {
  const { prefix, crumbs, industry, country, services, price, posts, caseStudies } = args;
  const kw = `${industry.name} Website Design Services`;

  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: `${industry.name} · ${country.longName}`,
  h1Prefix: `${industry.name} Website Design Services`,
  sub: `Websites built specifically for ${industry.name.toLowerCase()} businesses in ${country.longName} — designed around how your customers actually buy, and structured to convert. From <strong>${esc(price(Math.min(...services.map((s) => s.fromPrice))))}</strong>.`,
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Case Studies',
  secondaryHref: resolveStatic(prefix, 'case-studies'),
  chips: [industry.buyingTrigger, `Tracking ${industry.metric.toLowerCase()}`, industry.regulated ? 'Compliance-aware' : 'Fast delivery', 'Unlimited revisions'],
})}

${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <h2 class="h2 mb-5">Why ${esc(industry.name.toLowerCase())} needs a specialist web partner</h2>
      <div class="prose">
        <p>${esc(industry.context)}</p>
        <p>In ${esc(industry.name.toLowerCase())}, the buying trigger is usually ${esc(industry.buyingTrigger.toLowerCase())}. That changes what the website has to do. It is not enough to be attractive — it has to answer the specific objection your buyers arrive with, which is usually ${esc(industry.objection.replace(/"/g, "'"))}</p>
        ${industry.regulated ? `<p>Because this is a regulated sector, we treat trust signals as a build requirement rather than an optional extra. Credentials, named authorship, sourcing and clear compliance language determine both whether you rank and whether anyone trusts you enough to make contact.</p>` : `<p>Speed and proof matter more than decoration in this sector, which is exactly where well-executed ${esc(kw.toLowerCase())} earns its keep.</p>`}
      </div>
    </div>
    <div class="lg:col-span-5">
      <div class="panel">
        <h3 class="h4 mb-4">At a glance</h3>
        <dl class="space-y-3 text-sm">
          ${[
            ['Buying trigger', industry.buyingTrigger],
            ['Primary metric', industry.metric],
            ['Main objection', industry.objection.replace(/"/g, "'")],
            ['Seasonality', industry.season || 'No strong seasonality'],
            ['Regulated', industry.regulated ? 'Yes — compliance-aware build' : 'No'],
            ['Typical delivery', '5–21 business days'],
          ].map(([k, v]) => `<div><dt class="text-faint text-xs mb-0.5">${esc(k)}</dt><dd class="m-0">${esc(v)}</dd></div>`).join('')}
        </dl>
      </div>
    </div>
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'Services', h2: `What we do for ${industry.name.toLowerCase()} businesses`, align: 'left' })}
  ${grid(3, services.map((s) => {
    const href = s.slug === '' ? url(prefix) : resolveServiceLink(prefix, s.slug);
    return `<a href="${esc(href)}" class="block h-full reveal" style="--hue:${s.hue}">
      <div class="card card-hover card-glow p-5 h-full flex flex-col">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:hsla(${s.hue},90%,58%,.14);border:1px solid hsla(${s.hue},90%,58%,.28);color:hsl(${s.hue},90%,62%)">${icon(s.icon, 'w-5 h-5')}</div>
        <h3 class="font-bold text-sm mb-1.5">${esc(s.name)}</h3>
        <p class="text-xs text-muted leading-relaxed flex-1">${esc(s.tagline)}</p>
        <div class="mt-3 pt-3 border-t text-xs" style="border-color:var(--border)"><span class="text-faint">From </span><span class="font-bold" style="color:var(--brand)">${esc(price(s.fromPrice))}</span></div>
      </div>
    </a>`;
  }).join(''))}`,
  tight: true,
})}

${caseStudies.length ? section({
  children: `${sectionHead({ eyebrow: 'Proof', h2: `${industry.name} results`, align: 'left' })}
  ${grid(3, caseStudies.map((c, i) => `<a href="${esc(resolveStatic(prefix, 'case-studies', c.slug))}" class="card card-hover p-5 h-full flex flex-col reveal">
    <span class="chip chip-brand text-xs mb-3 self-start">${esc(industry.name)}</span>
    <h3 class="font-bold text-sm mb-2">${esc(c.title)}</h3>
    <p class="text-xs text-muted leading-relaxed flex-1">${esc(c.excerpt)}</p>
    <div class="mt-3 pt-3 border-t text-xs font-bold" style="border-color:var(--border);color:var(--ok)">${esc(c.metric)}</div>
  </a>`).join(''))}`,
  tight: true,
}) : ''}

${posts.length ? section({
  children: `${sectionHead({ eyebrow: 'Guides', h2: `${industry.name} resources`, align: 'left' })}
  ${grid(3, posts.map((p, i) => postCard(p, i)).join(''))}`,
  tight: true,
}) : ''}

${section({
  children: `<div class="grid lg:grid-cols-2 gap-10 items-start">
    ${leadForm({
      variant: 'contact',
      heading: `Get a fixed quote for ${industry.name.toLowerCase()}`,
      sub: `Tell us about your ${industry.name.toLowerCase()} business and we will send a written scope, a fixed price and a delivery date within one business day.`,
      showServiceSelect: true,
      servicesList: services.map((s) => ({ slug: s.slug, name: s.name })),
    })}
    <div>
      <h2 class="h2 mb-5">What ${industry.name.toLowerCase()} businesses ask us most</h2>
      ${faqBlock([
        { q: `How much should a ${industry.name.toLowerCase()} website cost?`, a: `Our packages start at ${esc(price(Math.min(...services.map((s) => s.fromPrice))))} and scale by scope. For ${industry.name.toLowerCase()} businesses the most common choice is the mid-tier package, which covers a custom design, CMS, on-page SEO, schema and integrations with the tools you already use.` },
        { q: `How long does a ${industry.name.toLowerCase()} website take?`, a: 'Five to twenty-one business days for most projects, depending on scope. Custom applications run longer. We agree a delivery date in the written scope before work starts.' },
        { q: `Do you understand ${industry.regulated ? 'the compliance requirements in' : 'the specifics of'} ${industry.name.toLowerCase()}?`, a: industry.regulated
          ? `Yes. We build ${industry.name.toLowerCase()} sites with credentials, authorship and compliance language treated as build requirements. We will also ask you to confirm the specific regulatory position in your market, because it varies and we are not your legal adviser.`
          : `Yes. We have built for ${industry.name.toLowerCase()} businesses in ${country.longName} and understand the buying trigger, the objections and the channels where your customers actually look.` },
        { q: `What should we track?`, a: `Primary focus should be ${industry.metric.toLowerCase()}. Rankings, impressions and follower counts are context rather than outcomes. We set up the tracking that makes ${industry.metric.toLowerCase()} visible, then report on it monthly.` },
        { q: 'Can you work with our existing brand?', a: 'Yes. If you have a brand we build around it. If you do not, we can pair the website build with our logo design and branding services so the identity and the site are designed together rather than sequentially.' },
      ])}
    </div>
  </div>`,
})}

${section({
  children: ctaBand({
    title: `Ready to grow ${industry.name.toLowerCase()} in ${country.longName}?`,
    body: `Tell us what you need and we will send a fixed price, a written scope and a delivery date within one business day. No obligation.`,
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}

export function industriesIndexPage(args: {
  prefix: string;
  crumbs: { name: string; url: string }[];
  industries: Industry[];
  hue: number;
}): string {
  const { prefix, crumbs, industries } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Sector expertise',
  h1Prefix: 'Industries We Specialise In',
  sub: 'Generic advice underperforms because the buying trigger, the objection and the success metric are different in every sector. Here is what we know about yours.',
  primaryLabel: 'Get My Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View All Services',
  secondaryHref: resolveStatic(prefix, 'services'),
})}
${section({
  children: `<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    ${industries.map((ind, i) => `<a href="${esc(resolveChild(prefix, 'industries', ind.slug))}" class="card card-hover card-glow p-6 h-full flex flex-col reveal" style="transition-delay:${(i % 3) * 60}ms">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h2 class="h4">${esc(ind.name)}</h2>
        ${ind.regulated ? '<span class="chip chip-warn text-xs">Regulated</span>' : ''}
      </div>
      <p class="text-sm text-muted leading-relaxed flex-1">${esc(ind.context.slice(0, 155))}…</p>
      <div class="mt-4 pt-4 border-t" style="border-color:var(--border)">
        <div class="text-xs text-faint mb-1">Primary metric</div>
        <div class="text-xs font-semibold" style="color:var(--brand)">${esc(ind.metric)}</div>
      </div>
    </a>`).join('')}
  </div>`,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search + 404
// ─────────────────────────────────────────────────────────────────────────────

export function searchPage(args: { prefix: string; crumbs: { name: string; url: string }[]; query: string; results: { title: string; url: string; type: string; excerpt: string }[]; hue: number }): string {
  const { prefix, crumbs, query, results } = args;
  return `
${breadcrumbs(crumbs)}
<header class="container pt-10 pb-6">
  <div class="max-w-3xl">
    <h1 class="h1">Search</h1>
    <form action="/search/" method="get" class="relative mt-6" role="search" data-live-search>
      <input type="search" name="q" value="${esc(query)}" class="field pl-12 py-3.5 text-base" placeholder="Search services, locations, guides…" aria-label="Search" autofocus />
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-faint">${icon('search', 'w-5 h-5', 2.2)}</span>
      <button class="btn btn-primary absolute right-1.5 top-1/2 -translate-y-1/2" type="submit">Search</button>
    </form>
    ${query ? `<p class="text-sm text-muted mt-4">${results.length} result${results.length === 1 ? '' : 's'} for <strong>${esc(query)}</strong></p>` : ''}
  </div>
</header>
<div id="searchResults"></div>
${section({
  children: results.length
    ? `<div class="max-w-3xl space-y-3">
        ${results.map((r) => `<a href="${esc(r.url)}" class="card card-hover p-5 block">
          <div class="flex items-center gap-2 mb-1.5"><span class="chip text-xs">${esc(r.type)}</span></div>
          <h2 class="font-bold text-base mb-1">${esc(r.title)}</h2>
          <p class="text-sm text-muted leading-relaxed">${esc(r.excerpt)}</p>
        </a>`).join('')}
      </div>`
    : query
      ? `<div class="max-w-3xl"><div class="card p-8 text-center">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style="background:hsla(190,90%,58%,.12);border:1px solid hsla(190,90%,58%,.28);color:var(--brand)">${icon('search', 'w-6 h-6', 2)}</div>
          <h2 class="h3 mb-2">No results for "${esc(query)}"</h2>
          <p class="text-sm text-muted max-w-md mx-auto">Try a different term, browse our services, or tell us what you are looking for and we will point you to the right person.</p>
          <div class="mt-6 flex flex-wrap gap-3 justify-center">
            <a href="${esc(resolveStatic(prefix, 'services'))}" class="btn btn-primary btn-sm">Browse services</a>
            <a href="${esc(resolveStatic(prefix, 'contact'))}" class="btn btn-ghost btn-sm">Ask us directly</a>
          </div>
        </div></div>`
      : `<p class="text-sm text-muted">Start typing to search services, locations, case studies and guides.</p>`,
  tight: true,
})}`;
}

export function notFoundPage(args: { prefix: string; hue: number; path: string }): string {
  return `
${section({
  children: `<div class="max-w-2xl mx-auto text-center">
    <div class="text-[6rem] md:text-[9rem] font-extrabold leading-none mb-2" style="font-family:Sora,sans-serif;background:linear-gradient(120deg,var(--brand),var(--brand-2));-webkit-background-clip:text;background-clip:text;color:transparent">404</div>
    <h1 class="h2 mb-4">This page does not exist</h1>
    <p class="lead">The page you were looking for has moved or never existed. Here is where to go instead.</p>
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      <a href="/" class="btn btn-primary">Back to homepage</a>
      <a href="/services/" class="btn btn-ghost">Browse services</a>
      <a href="/contact/" class="btn btn-ghost">Contact us</a>
    </div>
    <div class="mt-12 text-left">
      <h2 class="h4 mb-4">Popular pages</h2>
      <div class="grid sm:grid-cols-2 gap-2.5">
        ${[
          ['/logo-design-services/', 'Logo Design Services'],
          ['/seo-services/', 'SEO Services'],
          ['/packages/', 'Pricing & Packages'],
          ['/portfolio/', 'Portfolio'],
          ['/case-studies/', 'Case Studies'],
          ['/blog/', 'Blog'],
          ['/uk/', 'United Kingdom'],
          ['/uae/dubai/', 'Dubai, UAE'],
        ].map(([u, n]) => `<a href="${esc(u)}" class="trust-badge justify-between">${esc(n)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>`).join('')}
      </div>
    </div>
  </div>`,
})}`;
}
