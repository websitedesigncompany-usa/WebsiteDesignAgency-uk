/**
 * Service page copy composer.
 *
 * Produces genuinely differentiated body copy for a (service × location) pair.
 * The composer mixes:
 *   - service-specific facts (deliverables, timeline, process)
 *   - location-specific facts (city note, region, currency, market context)
 *   - industry-specific context where relevant
 * so that two service pages in two cities are not the same page with the city
 * name swapped in.
 */

import { City, Country } from '../data/regions.js';
import { Service } from '../data/services.js';
import { Package } from '../data/packages.js';
import { INDUSTRY_BY_SLUG } from '../data/industries.js';
import { weaveKeywords } from './keyword-weaver.js';
import { pick, seededRandom } from '../lib/html.js';

export interface CopyContext {
  service: Service;
  country: Country;
  city?: City;
  packages: Package[];
  /** Local display price formatter. */
  price: (usd: number, pkgId?: string) => string;
  entryPriceDisplay: string;
}

const DELIVERY_PHRASES = [
  'Most {kw} projects ship inside two weeks',
  'A typical {kw} engagement runs 7–21 days from kickoff',
  'We deliver the majority of {kw} projects within three weeks',
  'Realistic timelines for {kw} work sit between 5 and 21 business days',
];

const TRUST_PHRASES = [
  'We have delivered more than 2,400 projects since 2015',
  'Over 1,180 businesses have used our services',
  'We work with clients across 38 countries',
  'Our team of 64 includes designers, engineers and strategists',
];

export interface ServiceCopy {
  /** Opening block, 3–4 paragraphs. Keyword woven to target density. */
  intro: string[];
  /** Section under the exact-match H2. */
  valueProps: { title: string; body: string }[];
  /** How we work — also feeds HowTo schema. */
  processSteps: { title: string; body: string }[];
  /** Local-market paragraph set. */
  local: string[];
  /** Industry relevance set. */
  industry: string[];
  /** What is explicitly not included — builds trust, reduces churn. */
  notIncluded: string[];
  /** The full woven body used for density QA. */
  bodyText: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export function composeServiceCopy(ctx: CopyContext): ServiceCopy {
  const { service, country, city, price, entryPriceDisplay } = ctx;
  const kw = service.primaryKeyword;
  const loc = locationPhrase(country, city);
  const seed = `${service.slug}|${country.code}|${city?.slug || 'root'}`;
  const localKw = city ? `${kw} in ${city.name}` : country.slug ? `${kw} in ${country.longName}` : kw;

  // ── Intro ──────────────────────────────────────────────────────────────────
  const intro = weaveKeywords(
    [
      service.summary,

      city
        ? `Businesses in ${city.name} searching for ${kw.toLowerCase()} usually have the same problem: they cannot tell which provider will actually deliver. ${city.note} Our answer is a published scope, a fixed price, a real timeline, and unlimited revisions before launch — so the only surprise is how quickly it ships.`
        : country.slug
          ? `Companies across ${country.longName} comparing ${kw.toLowerCase()} providers are usually looking for the same three things: a fixed price, a real delivery date, and someone who answers the phone after launch. ${country.note}`
          : `Choosing between ${kw.toLowerCase()} providers is harder than it should be, because almost every agency page looks the same. We have taken a different approach: fixed-price packages, published inclusions, fast turnaround, and unlimited revisions until you are genuinely happy with the result.`,

      `Our ${localKw} starts at ${entryPriceDisplay} and includes the things most providers treat as extras: on-page SEO, Core Web Vitals work, mobile-first design, schema markup, a CMS so you can edit your own content, and thirty days of support after launch. ${pick(DELIVERY_PHRASES, seed).replace('{kw}', localKw)}. You approve every design round before we build it, and you own everything — code, content, domain, design files — the moment the final invoice clears.`,

      `${pick(TRUST_PHRASES, seed + 'trust')}. That matters because ${service.category.toLowerCase()} work compounds: a site built properly in week one keeps paying out for years, while a rushed one costs you again within eighteen months. ${kw} is not a line item, it is the foundation everything else sits on.`,
    ],
    { keyword: localKw, locality: loc, category: service.category },
  );

  // ── Value props ────────────────────────────────────────────────────────────
  const valueProps = buildValueProps(ctx, localKw);

  // ── Process ────────────────────────────────────────────────────────────────
  const processSteps = buildProcess(ctx, localKw);

  // ── Local ──────────────────────────────────────────────────────────────────
  const local = weaveKeywords(
    [
      city
        ? `${city.name} is a specific market with specific dynamics. ${city.note} That shapes how we build: the page structure, the proof we surface above the fold, the local proof points we include, and how aggressively we chase the long tail of city-plus-service searches.`
        : `Serving ${country.longName} means working in ${country.currency} pricing, ${country.language} copy, and ${country.tld} domain conventions, not exporting a US template and changing the currency symbol. ${country.note}`,

      city
        ? `Practically, that means your ${localKw} includes city-specific content rather than a generic page with your city name dropped in, structured data marked up for ${city.name}, and internal linking that reflects how people in ${city.region} actually search.`
        : `Practically, that means your ${localKw} is written in ${country.language}, priced in ${country.currency} so your team can budget against a real number, and structured for how search engines in that market index local intent.`,

      `We also handle the parts that quietly cost agencies their clients: image optimisation, redirect chains on migrations, form routing, and analytics that actually record what happened rather than what the defaults record.`,
    ],
    { keyword: localKw, locality: loc, category: service.category, min: 1.2, max: 2.2 },
  );

  // ── Industry ───────────────────────────────────────────────────────────────
  const industrySlug = service.industries[Math.floor(seededRandom(seed + 'ind') * service.industries.length)] || '';
  const ind = INDUSTRY_BY_SLUG[industrySlug.toLowerCase().replace(/\s+/g, '-')];
  const industry: string[] = ind
    ? [
        `A note on ${ind.name.toLowerCase()}: ${ind.context}`,
        `In that sector the buying trigger is usually ${ind.buyingTrigger.toLowerCase()}, and the objection we hear most is ${ind.objection.replace('"', '"')}. We build against both — the page answers the objection before they ask it, and the proof is measured in ${ind.metric.toLowerCase()}.`,
        ind.regulated
          ? `Because this is a regulated sector, we treat trust signals as a requirement rather than a nice-to-have: credentials, authorship, sources and compliance-friendly language throughout.`
          : `Speed and proof matter more than decoration here, which is where good ${kw.toLowerCase()} earns its keep.`,
      ]
    : [
        `We work across ${service.industries.slice(0, 4).join(', ')} and a good number of industries we did not plan for. The through-line is always the same: the site has to load fast, answer the real question, and make the next step obvious.`,
      `Different markets have different buying triggers, and the copy has to reflect that. A generic page that works for everyone works for no one.`,
    ];

  // ── Not included (trust builder) ───────────────────────────────────────────
  const notIncluded = buildNotIncluded(service);

  const bodyText = [
    ...intro,
    ...valueProps.map((v) => `${v.title} ${v.body}`),
    ...processSteps.map((s) => `${s.title} ${s.body}`),
    ...local,
    ...industry,
  ].join(' ');

  return { intro, valueProps, processSteps, local, industry, notIncluded, bodyText };
}

// ─────────────────────────────────────────────────────────────────────────────

function locationPhrase(country: Country, city?: City): string {
  if (city) return `${city.name}, ${country.longName}`;
  return country.longName;
}

function buildValueProps(ctx: CopyContext, localKw: string): { title: string; body: string }[] {
  const { service, price, entryPriceDisplay } = ctx;
  const seed = service.slug;

  const props: { title: string; body: string }[] = [
    {
      title: 'Custom work, not a template assembly line',
      body: `Every build is designed from a blank file against your brief and your market. We do not buy a theme, swap the logo and resell it. That is why our ${localKw.toLowerCase()} looks like your business rather than the last eleven clients.`,
    },
    {
      title: 'Mobile-first, and tested on real devices',
      body: `The majority of traffic is on a phone, so mobile is the primary design target rather than a shrunk-down desktop layout. We verify at 360px up, and we check on real hardware — not just a browser preview at desktop width.`,
    },
    {
      title: 'Speed treated as a design constraint',
      body: `We set an explicit performance budget on day one: LCP under 2.5 seconds on 4G, CLS under 0.1, images in WebP with lazy loading below the fold, and no render-blocking JavaScript. Speed is a feature, not an afterthought we optimise for later.`,
    },
    {
      title: 'SEO built in, not bolted on',
      body: `Every page ships with a unique title and description, a proper heading hierarchy, canonical URLs, Open Graph tags, and the right structured data for the page type. You are not paying extra to retrofit search fundamentals.`,
    },
    {
      title: 'A CMS your team can actually use',
      body: `You get an admin panel with sensible fields, plus a recorded walkthrough and a written guide. Publishing a page, post or product should never require opening a ticket.`,
    },
    {
      title: 'Unlimited revisions',
      body: `We work in structured review rounds so your feedback lands in one consolidated pass. Revisions on the selected design direction are unlimited — we would rather get it right than get it signed off quickly.`,
    },
    {
      title: 'Fixed price, published inclusions',
      body: `Packages start at ${entryPriceDisplay} and the feature list is written out in full on this page. No vague "and other services" line items, no surprise change orders halfway through.`,
    },
    {
      title: `You own everything at handover`,
      body: `Code, design files, content, domain and hosting credentials transfer to you on final payment. We include a documented handover call so your team knows exactly how everything works.`,
    },
  ];

  // Deliverables become their own value props for services with strong lists.
  if (service.deliverables.length >= 6) {
    props.push({
      title: 'Concrete deliverables, written down',
      body: `Specifically what you receive: ${service.deliverables
        .slice(0, 4)
        .map((d) => d.toLowerCase())
        .join(', ')}, plus everything listed in the package table above. If it is not on the list, we do not charge you for it.`,
    });
  }

  return props;
}

function buildProcess(ctx: CopyContext, localKw: string): { title: string; body: string }[] {
  const { service, country, city } = ctx;
  const loc = locationPhrase(country, city);

  return [
    {
      title: 'Brief and scope (Day 0–1)',
      body: `You fill in the form on this page or book a call. We come back within one business day with questions, a recommended package, a fixed price and a delivery date. ${localKw} does not start until you approve that scope in writing.`,
    },
    {
      title: 'Research and wireframes (Day 1–4)',
      body: `We analyse your market, your closest competitors and the search demand behind this service in ${loc}. You get a sitemap and low-fidelity wireframes for every template, so structure is agreed before anyone spends time on visual design.`,
    },
    {
      title: 'Design and unlimited revisions (Day 4–10)',
      body: `You see a first design pass, then structured review rounds with unlimited revisions until the direction is right. We do not start building until you approve a design — this is where most projects go wrong when they skip it.`,
    },
    {
      title: 'Build, CMS and SEO wiring (Day 10–16)',
      body: `We build responsive, accessible and fast, wire up the CMS, add on-page SEO, structured data, analytics and form routing, and run a full QA pass across devices, browsers and screen readers where relevant.`,
    },
    {
      title: 'Launch and aftercare (Day 16+)',
      body: `We handle DNS, SSL, redirects, sitemap submission and search console verification, then hand over source access, documentation and a training session. ${service.timeline === 'Ongoing' ? 'Retainer work continues monthly with a named point of contact.' : 'Thirty days of post-launch support are included as standard.'}`,
    },
  ];
}

function buildNotIncluded(service: Service): string[] {
  const base = [
    'Paid advertising or media spend of any kind',
    'Third-party subscriptions (hosting, licences, premium themes) — we tell you what is needed and why, at cost',
    'Stock photography, print production and physical shipping',
    'Writing an unlimited volume of content on a fixed-price build',
  ];
  if (service.packageSet === 'seo' || service.packageSet === 'ppc') {
    return [
      'The ad budget itself, where a paid package is involved — you pay platforms directly at cost',
      'Content production beyond the volume stated in the package',
      'Development for functionality outside the agreed scope',
      'Emergency out-of-hours support, which is available as a priced add-on',
    ];
  }
  return base;
}

/** Generate the "why us" bullets used across the site. */
export function whyUsPoints() {
  return [
    {
      title: 'Premium quality, affordable prices',
      body: 'Agency-grade output at roughly a third of what a US or Western European agency charges for the same scope.',
      icon: 'gem',
    },
    {
      title: 'Fast turnaround',
      body: 'Most projects ship in 5–21 business days. You are never waiting three months for a WordPress theme install.',
      icon: 'bolt',
    },
    {
      title: 'Unlimited revisions',
      body: 'We revise the chosen direction until you approve it. No capped rounds, no "that is the third change" conversation.',
      icon: 'refresh',
    },
    {
      title: 'Custom, responsive, modern',
      body: 'Designed from a blank file, built mobile-first, and modern in look without being experimental for its own sake.',
      icon: 'layout',
    },
    {
      title: 'SEO-friendly from day one',
      body: 'On-page SEO, schema, sitemaps and Core Web Vitals are part of the build, not a follow-up invoice.',
      icon: 'search',
    },
    {
      title: 'You own everything',
      body: 'Code, design files, content and domain transfer to you on final payment. No lock-in, no hostage situation.',
      icon: 'key',
    },
  ];
}
