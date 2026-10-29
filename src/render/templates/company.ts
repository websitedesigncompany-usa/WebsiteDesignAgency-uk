/**
 * Company, resource and comparison pages.
 *
 * These are the pages the competitor set (websitedesigncompany.base44.app and
 * the wider agency market) publishes and we did not: resources, insights,
 * start-a-project, request-quote, press, methodology, sustainability,
 * newsletter, onboarding, an HTML sitemap, plus standalone comparison pages.
 */

import { esc, truncate, formatDate } from '../../lib/html.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import {
  section, sectionHead, grid, breadcrumbs, ctaBand, faqBlock, linkCloud,
  trustBadges, statsBar, aggregateRatingBlock, comparisonTable, processTimeline,
  paragraphs, checkList, coverArt,
} from '../components.js';
import { hero, leadForm, inlineCta, auditCallout } from '../hero.js';
import { postCard, portfolioCard, caseStudyCard } from './service.js';
import { Service, PAGE_SERVICES, SERVICE_BY_SLUG } from '../../data/services.js';
import { Country } from '../../data/regions.js';
import { locationPrefix, resolveStatic, url } from '../../lib/routing.js';
import { marketGuidance } from '../../content/market.js';
import { formatPrice } from '../../data/packages.js';
import { marketBlock } from './market.js';

export interface CompanyPage {
  slug: string;
  title: string;
  h1: string;
  keyword: string;
  description: string;
  eyebrow: string;
  intro: string[];
  sections: { h: string; body: string[]; bullets?: string[] }[];
  faqs: { q: string; a: string }[];
}

export const COMPANY_PAGES: CompanyPage[] = [
  {
    slug: 'resources',
    title: 'Resources',
    h1: 'Free Resources for Website Owners',
    keyword: 'Web Design Resources',
    description:
      'Guides, checklists, templates and free tools for business owners running their own website — practical, plain-English and written by people who build these sites for a living.',
    eyebrow: 'Resource library',
    intro: [
      'Everything here exists because a client asked the same question twice. We wrote the answer properly, published it, and kept updating it.',
      'No gated PDFs, no email wall on the useful stuff, and no "AI-generated" filler. If a guide helps, you get the whole thing.',
    ],
    sections: [
      {
        h: 'What is in the library',
        body: [],
        bullets: [
          'Free browser-based tools — invoice generator, image compressor, schema markup builder, keyword density checker and more',
          'Step-by-step guides for launching, maintaining and growing a website',
          'Pricing breakdowns so you know what a fair quote looks like before you ask for one',
          'Checklists you can hand to any developer and expect to be taken seriously',
          'Regional SEO and AI-search explainers for each market we work in',
        ],
      },
      {
        h: 'How to use the resources well',
        body: [
          'Start with the free audit tool. It gives you a scored breakdown in about a minute, and it is genuinely the fastest way to find out what is wrong with a site you have not looked at in a year.',
          'Then work down the priority list it produces. Everything above the line has a real cost attached to it, and everything below the line can wait a quarter.',
        ],
      },
    ],
    faqs: [
      { q: 'Is everything here really free?', a: 'Yes. The guides are free to read and the tools are free to use with no account. We do not need an email address to give you something useful.' },
      { q: 'Who writes these?', a: 'The people who do the work — our designers, engineers and strategists. Each guide names its author, and we publish the date it was last reviewed.' },
      { q: 'Can I use these with my own developer?', a: 'Yes, and that is the point. A brief you can hand to any competent developer is worth more to you than a sales pitch from us.' },
    ],
  },
  {
    slug: 'insights',
    title: 'Insights',
    h1: 'Insights & Analysis',
    keyword: 'Digital Marketing Insights',
    description:
      'Analysis, benchmarks and considered opinion on web design, SEO, AI search and digital strategy — published when we have something worth saying.',
    eyebrow: 'Insights',
    intro: [
      'Insights is where we publish work that is not a how-to: analysis of what is actually changing, benchmark data from our own delivery, and the occasional strong opinion we can defend.',
      'We publish when there is something to say, which is less often than most agencies publish.',
    ],
    sections: [
      { h: 'What we cover', body: [], bullets: [
        'AI search and how answer engines actually change discovery',
        'Benchmarks from our own delivery data — what timelines, prices and conversion rates actually look like',
        'Design and performance trade-offs, explained with the numbers behind them',
        'Market and regional analysis for the countries we work in',
      ] },
      { h: 'Editorial standard', body: [
        'Every piece names a real author with relevant experience, states the date it was last reviewed, and separates what we measured from what we believe.',
        'Where we do not have data, we say so rather than padding the piece to look authoritative.',
      ] },
    ],
    faqs: [
      { q: 'How often do you publish?', a: 'When there is something to say. That is typically two to four times a month across the whole library, and more often when a topic is genuinely new.' },
      { q: 'Do you publish under your own name?', a: 'Always. Every author is named with their role and a short bio describing what they actually do.' },
    ],
  },
  {
    slug: 'start-a-project',
    title: 'Start a Project',
    h1: 'Start a Project',
    keyword: 'Start a Website Design Project',
    description:
      'Tell us what you are building and get a written scope, a fixed price and a delivery date within one business day. No obligation, no sales call.',
    eyebrow: 'Project intake',
    intro: [
      'This is the shortest path to a real answer. Fill in the form and you get a written scope, a fixed price and a delivery date within one business day.',
      'If you are not sure what you need, say that in the form. It is the most common thing people tell us, and it is genuinely fine.',
    ],
    sections: [
      { h: 'What happens after you send this', body: [], bullets: [
        'We read the brief and check it against the service catalogue and the current capacity',
        'You get a written scope with a fixed price and a delivery date',
        'If anything is ambiguous, we ask one round of questions first — not a discovery call',
        'Nothing is charged until you approve the scope in writing',
      ] },
      { h: 'Useful things to include', body: [], bullets: [
        'What the site needs to achieve, in business terms rather than design terms',
        'Your deadline, if you have one, and whether it is fixed or flexible',
        'Examples of sites you like, and what specifically you like about them',
        'Your existing content, brand assets and any integrations you already use',
      ] },
    ],
    faqs: [
      { q: 'Do I need a budget to get a quote?', a: 'No. We quote against the scope regardless of your budget, and if the scope is out of range we will say so and suggest what to cut.' },
      { q: 'Is there a sales call?', a: 'Not for the quote. If the project is complex enough that a call genuinely helps, we suggest one — but you will already have the written scope by then.' },
      { q: 'How fast is the reply?', a: 'Within one business day. If you have not heard from us by the end of the next working day, something went wrong and you should chase us.' },
    ],
  },
  {
    slug: 'request-quote',
    title: 'Request a Quote',
    h1: 'Request a Fixed Quote',
    keyword: 'Request a Website Design Quote',
    description:
      'Get a fixed-price, written quote for your website, SEO or marketing project — usually within one business day, with no obligation.',
    eyebrow: 'Fixed-price quoting',
    intro: [
      'A quote from us is always fixed, always written, and always lists what is included and what is not.',
      'That means you can compare it against another quote on the same terms, which is the only way to compare quotes at all.',
    ],
    sections: [
      { h: 'What a quote from us contains', body: [], bullets: [
        'The exact deliverables, listed',
        'The exact exclusions, listed',
        'A fixed price in your currency',
        'A delivery date with the review rounds spelled out',
        'The revision terms and ownership transfer terms',
      ] },
      { h: 'How to compare quotes fairly', body: [
        'Send every provider the identical scope document. If the quotes differ by a factor of two, it is almost always because the scopes differ, not because the providers differ.',
        'Then read the exclusions line by line. The gap between quotes is almost always in what one of them left out.',
      ] },
    ],
    faqs: [
      { q: 'Do you charge for the quote?', a: 'No. Quoting is free and there is no obligation to proceed.' },
      { q: 'Can I get a quote without a call?', a: 'Yes. The form below is enough for most projects.' },
    ],
  },
  {
    slug: 'press',
    title: 'Press & Media',
    h1: 'Press & Media',
    keyword: 'Website Design Company Press',
    description:
      'Press information, media enquiries, company facts and brand assets for journalists, publications and partner agencies.',
    eyebrow: 'Press room',
    intro: [
      'Everything a journalist needs: company facts, our position on the industry, and a direct route to a human who can answer.',
      'We reply to media enquiries the same day they arrive.',
    ],
    sections: [
      { h: 'Company facts', body: [], bullets: [
        `Founded: ${SITE.founded}`,
        `Team: ${SITE.stats.teamSize} people across design, engineering, SEO and content`,
        `Projects delivered: ${SITE.stats.projectsDelivered} across ${SITE.stats.countriesServed} countries`,
        `Average client rating: ${SITE.rating.value}/5 from ${SITE.rating.count} verified reviews`,
        `Typical delivery: ${SITE.stats.avgDeliveryDays} business days for a standard build`,
      ] },
      { h: 'Our position on the industry', body: [
        'Most web design is sold on page count and consumed as a black box. We think that is the single biggest reason the industry has a trust problem.',
        'Our position is simple: publish the inclusions, publish the exclusions, publish the price, and let the work speak. It makes us slower to win some projects and much easier to keep.',
      ] },
    ],
    faqs: [
      { q: 'Can I request brand assets?', a: 'Yes — logo files in vector and raster formats are available on request for editorial use.' },
      { q: 'Do you accept guest contributions?', a: 'We accept genuinely expert contributions that add something a client could not have written themselves. Pitch a topic and an outline, not a finished draft.' },
    ],
  },
  {
    slug: 'methodology',
    title: 'Methodology',
    h1: 'How We Work',
    keyword: 'Web Design Methodology',
    description:
      'The exact process behind every Website Design Company project — from first brief to handover, including what we check and what we refuse to do.',
    eyebrow: 'Our process',
    intro: [
      'Most agency process pages are marketing. This one is the actual sequence, including the parts where we push back.',
      'If you have been burned by a web project before, this is the page that will tell you whether we are different.',
    ],
    sections: [
      { h: 'Stage 1 — Scope, in writing', body: [
        'Before anything is designed, you get a document that states the deliverables, the exclusions, the price, the delivery date, the revision terms and what you own at the end.',
        'If we cannot write that scope honestly, we do not start the project. That conversation is more valuable than a bad build.',
      ] },
      { h: 'Stage 2 — Research and structure', body: [
        'We analyse the competitive landscape, the real search demand behind the offer, and the analytics and CRM data you already have.',
        'The output is a sitemap and wireframes. We get the structure agreed before visual design, because structure is cheap to change here and expensive to change later.',
      ] },
      { h: 'Stage 3 — Design, with unlimited revisions', body: [
        'Custom design from a blank file, in structured review rounds. You see a real design, not a mockup with placeholder text.',
        'We revise until you approve. We ask for one consolidated list of feedback per round, because scattered feedback is the single most common reason a project runs late.',
      ] },
      { h: 'Stage 4 — Build and verification', body: [
        'Responsive, accessible, fast. Every page passes a performance budget, a schema validation check and a link check before it ships.',
        'We test on real devices over real mobile data, not a desktop browser scaled down.',
      ] },
      { h: 'Stage 5 — Launch and aftercare', body: [
        'DNS, SSL, redirects, sitemap submission, Search Console verification, training and a written handover document.',
        'Then 30 days of support as standard, longer on higher tiers. You own the code, the design files and the domain from day one of payment.',
      ] },
    ],
    faqs: [
      { q: 'What do you refuse to do?', a: 'We do not do template resales, we do not buy links, we do not use stock AI copy as a deliverable, and we do not take on a project where the budget is below what the scope actually costs.' },
      { q: 'How do you handle a client who changes their mind mid-project?', a: 'We quote the change in writing before doing it, with a revised price and a revised date. Nothing gets added to your invoice without your explicit agreement.' },
    ],
  },
  {
    slug: 'sustainability',
    title: 'Sustainability',
    h1: 'Sustainable Web Design',
    keyword: 'Sustainable Website Design',
    description:
      'How we reduce the environmental cost of the websites we build — lighter pages, greener hosting, honest measurement and no greenwashing.',
    eyebrow: 'Sustainability',
    intro: [
      'A website is not a physical product, but it still has a carbon cost, and most of it comes from weight, requests and hosting.',
      'We think about it because fast sites are good sites, and the same engineering serves both goals. Here is what we actually do.',
    ],
    sections: [
      { h: 'What we do', body: [], bullets: [
        'Performance budgets enforced at build time, so a page cannot silently get heavy',
        'WebP and AVIF images with responsive sizing, lazy loading below the fold, and no gratuitous third-party scripts',
        'Green hosting options on renewable-powered infrastructure, matched to your traffic profile',
        'Minimal, dependency-light builds that need less CPU to serve',
        'No autoplay video, no third-party ad tech, and no consent-banner theatre on pages that do not need it',
      ] },
      { h: 'What we do not claim', body: [
        'We are not going to tell you a website is carbon neutral. There is no honest way to make that claim for a site we have not measured.',
        'What we can do is make the page light, the hosting sensible, and the measurement available so you can see the real number rather than a marketing estimate.',
      ] },
    ],
    faqs: [
      { q: 'Do you publish per-site carbon figures?', a: 'We can provide an estimate for any site we build, based on actual page weight and request counts rather than a generic figure. Ask.' },
      { q: 'Is green hosting worth the cost?', a: 'Often, yes, and the price difference is usually small. Where it is not worth it we will say so rather than upsell you.' },
    ],
  },
  {
    slug: 'newsletter',
    title: 'Newsletter',
    h1: 'The Newsletter',
    keyword: 'Web Design Newsletter',
    description:
      'One practical email a month on website design, SEO and AI search — with something you can actually apply, and no filler.',
    eyebrow: 'Email',
    intro: [
      'One email a month. It contains one thing worth acting on, plus a short list of what changed and what we are reading.',
      'No drip sequence, no "exclusive" webinar, no course pitch. Unsubscribe in one click.',
    ],
    sections: [
      { h: 'What lands in your inbox', body: [], bullets: [
        'One deep, practical piece — usually something we have just shipped and learned from',
        'A short list of meaningful changes in search, AI search and the web platform',
        'One tool or template worth bookmarking',
        'A short note on what we are working on internally',
      ] },
      { h: 'Who it is for', body: [
        'People who own or run a website and do not want to become full-time SEOs.',
        'In-house marketers who need a second opinion they can trust. Agency owners who want to see how we work.',
      ] },
    ],
    faqs: [
      { q: 'How often does it arrive?', a: 'Monthly. If we cannot write something worth sending, we do not send it.' },
      { q: 'Can I unsubscribe?', a: 'One click, from every email. We do not sell or share the list.' },
    ],
  },
  {
    slug: 'onboarding',
    title: 'Onboarding',
    h1: 'Client Onboarding',
    keyword: 'Website Project Onboarding',
    description:
      'Everything we need from you in the first week, how the project runs day to day, and how to get the most out of working with us.',
    eyebrow: 'Onboarding',
    intro: [
      'Good onboarding is the difference between a project that lands in two weeks and one that lands in two months. This is the full list.',
      'Send it all in one go and the first design round usually comes back within three business days.',
    ],
    sections: [
      { h: 'What we need from you', body: [], bullets: [
        'Brand assets — logo in vector format, brand colours, any type guidelines you have',
        'Content — service descriptions, about copy, contact details, pricing, and any proof you have',
        'Access — domain registrar, current hosting, Google Business Profile, analytics, CRM, and any third-party tools the site talks to',
        'Approvals — one named person who can approve design and content decisions, and who is reachable',
        'Analytics access — a read-only view of your existing Search Console and analytics, so we can see what is already working',
      ] },
      { h: 'How the project runs', body: [], bullets: [
        'A shared channel with your project manager, and a weekly update during the build',
        'Two structured design review rounds are typical, three if the project is complex',
        'You get a staging link to review the real build, not screenshots',
        'You approve the scope, the wireframes, the design and the launch checklist — four clear gates',
        'A 60-minute handover call and a written document at the end',
      ] },
      { h: 'What we need from you day to day', body: [], bullets: [
        'One consolidated list of feedback per review round, from one person',
        'Decisions within two business days — a slow decision costs a week of build time',
        'Content, not just approval. If the copy is not ready, the build waits',
      ] },
    ],
    faqs: [
      { q: 'What if we already have a website?', a: 'We audit it first and tell you honestly whether to redesign, rebuild or leave it. Sometimes the right answer is to fix what is there.' },
      { q: 'Do you work with our existing developer?', a: 'Yes. We can work alongside an in-house team, or hand over entirely with full documentation.' },
      { q: 'How do payments work?', a: 'Under $1,000 is paid in full upfront. Above that it is typically 50% on approval and 50% on delivery, with interest-free instalment plans available.' },
    ],
  },
];

export const COMPANY_PAGE_BY_SLUG: Record<string, CompanyPage> = Object.fromEntries(
  COMPANY_PAGES.map((p) => [p.slug, p]),
);

/** Render a company/resource page. */
export function companyPage(args: {
  page: CompanyPage;
  prefix: string;
  country: Country;
  crumbs: { name: string; url: string }[];
  posts?: Parameters<typeof postCard>[0][];
  tools?: { name: string; url: string }[];
  hue: number;
}): string {
  const { page, prefix, crumbs, posts = [], tools = [], hue, country } = args;
  const absPath = url(prefix, page.slug);

  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: page.eyebrow,
  h1Prefix: page.h1,
  sub: page.description,
  primaryLabel: page.slug === 'request-quote' || page.slug === 'start-a-project' ? 'Get My Fixed Quote' : 'Talk to a strategist',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'View Packages',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}

${section({
  children: `<div class="grid lg:grid-cols-12 gap-10">
    <div class="lg:col-span-7">
      <div class="prose">${page.intro.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}</div>
      ${page.sections
        .map(
          (s) => `<div class="mt-10">
        <h2 class="h2 mb-4">${esc(s.h)}</h2>
        ${s.body.map((p) => `<p class="text-[#c3cee6] leading-relaxed mb-4">${esc(p)}</p>`).join('\n        ')}
        ${s.bullets?.length ? checkList(s.bullets, 1) : ''}
      </div>`,
        )
        .join('\n      ')}
    </div>
    <div class="lg:col-span-5">
      <div class="lg:sticky" style="top:calc(var(--header-h) + 22px)">
        ${leadForm({
          variant: 'contact',
          heading: page.slug === 'newsletter' ? 'Join the newsletter' : 'Talk to us',
          sub: page.slug === 'newsletter'
            ? 'One practical email a month. No drip sequence, no course pitch, one-click unsubscribe.'
            : 'Tell us what you need and we will come back within one business day with a written scope and a fixed price.',
          compact: true,
        })}
        ${tools.length ? `<div class="panel mt-5">
          <h3 class="h4 mb-3">Free tools</h3>
          <div class="space-y-2">${tools.map((t) => `<a href="${esc(t.url)}" class="trust-badge w-full justify-between">${esc(t.name)} ${icon('arrow', 'w-4 h-4', 2.2)}</a>`).join('')}</div>
        </div>` : ''}
      </div>
    </div>
  </div>`,
})}

${marketBlock(country, {
  subject: page.h1.toLowerCase(),
  h2: `${page.h1} in ${country.longName}`,
  eyebrow: `In ${country.longName}`,
  close: `The stages do not change. What changes is the law you have to satisfy, the evidence your buyer asks for, and the currency the quote is written in — so we write it in ${country.currency} and hold it for 30 days.`,
  prices: [
    { label: 'Website design from', usd: 99 },
    { label: 'Website redesign from', usd: 449 },
  ],
})}

${page.sections.length ? section({
  children: `${sectionHead({ eyebrow: 'Questions', h2: `${page.h1} — FAQ` })}
  ${faqBlock(page.faqs)}`,
  tight: true,
}) : ''}

${posts.length ? section({
  children: `${sectionHead({ eyebrow: 'Latest', h2: 'Recent guides', align: 'left' })}
  ${grid(3, posts.map((p, i) => postCard(p, i)).join(''))}`,
  tight: true,
}) : ''}

${section({
  children: ctaBand({
    title: 'Ready when you are',
    body: 'Fixed price, written scope, fast delivery and a delivery date you can hold us to.',
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison pages
// ─────────────────────────────────────────────────────────────────────────────

export interface ComparisonPair {
  slug: string;
  a: string; // service slug
  b: string; // service slug
  h1: string;
  keyword: string;
  intro: string;
  rows: { label: string; a: string | boolean; b: string | boolean }[];
  verdict: string;
  faqs: { q: string; a: string }[];
}

export const COMPARISONS: ComparisonPair[] = [
  {
    slug: 'seo-services-vs-ppc-services',
    a: 'seo-services',
    b: 'ppc-advertising-services',
    h1: 'SEO Services vs PPC Advertising: Which Should You Choose?',
    keyword: 'SEO vs PPC Services',
    intro:
      'This is the most common question we are asked, and the honest answer is usually "both, in a specific order". Here is how the two differ in cost, timeline, risk and what they are actually good for — so you can pick the right one for your situation.',
    rows: [
      { label: 'Time to first result', a: '4–8 months', b: '1–7 days' },
      { label: 'Cost to start', a: '$99 one-time or $149/month', b: '$199 one-time setup + $249/month + ad spend' },
      { label: 'Ongoing cost', a: 'Fixed, predictable', b: 'Fixed management fee + variable ad spend' },
      { label: 'Fully controllable?', a: 'No — depends on ranking and competition', b: 'Yes — you set the budget ceiling' },
      { label: 'Compounding?', a: 'Yes — content and authority keep working', b: 'No — you stop paying, you stop getting leads' },
      { label: 'Best for', a: 'Long-term sustainable growth, trust, high-intent organic traffic', b: 'Immediate demand, testing new offers, seasonal pushes' },
      { label: 'Risk if it goes wrong', a: 'Low — you can pause and keep what you built', b: 'Medium — spend stops, results stop' },
      { label: 'Measurable how?', a: 'Rankings, organic sessions, assisted revenue', b: 'Cost per lead, ROAS, impression share' },
      { label: 'Works best with', a: 'PPC in the first 3–6 months to generate data', b: 'SEO running alongside to compound over time' },
    ],
    verdict:
      'If you need customers this month and can fund ad spend, start with PPC to generate real conversion data, then layer SEO underneath it from day one so you are not renting traffic forever. If you cannot fund ongoing ad spend, SEO is the only version of this that builds something you own.',
    faqs: [
      { q: 'Which gives a faster return?', a: 'PPC, by a wide margin — a day or two versus four to eight months. The cost of that speed is that you keep paying for it forever.' },
      { q: 'Can I do SEO first and add PPC later?', a: 'You can, but you lose the single most valuable thing PPC gives you: real conversion data that tells you what people actually respond to.' },
      { q: 'Is PPC a waste of money for small businesses?', a: 'Only if the budget is too small to generate statistically useful data, or if the landing page is not ready to convert. Below roughly $500 a month, results become noise.' },
      { q: 'What happens if I stop paying for ads?', a: 'Your cost per lead rises immediately and your lead volume falls to near zero within weeks. Nothing you built in PPC carries over.' },
    ],
  },
  {
    slug: 'website-design-vs-web-development',
    a: 'website-design-services',
    b: 'website-development',
    h1: 'Website Design vs Web Development: What Is the Difference?',
    keyword: 'Website Design vs Web Development',
    intro:
      'Design is what it looks like and how it works. Development is what makes it actually run. Clients who understand the difference get better results and better value, because they know what they are buying.',
    rows: [
      { label: 'Focus', a: 'Layout, visual system, user experience, copy structure', b: 'Code, performance, integrations, security, hosting' },
      { label: 'Deliverable', a: 'Design files, prototypes, a visual system', b: 'A working, fast, secure, live website' },
      { label: 'Typical duration', a: '5–14 days', b: '10–28 days' },
      { label: 'Who needs it?', a: 'Everyone', b: 'Everyone — a design without a build is a picture' },
      { label: 'Tooling', a: 'Figma, Adobe CC', b: 'Next.js, WordPress, Shopify, custom stacks' },
      { label: 'Outcome', a: 'A plan for what to build', b: 'The thing itself, running on the internet' },
      { label: 'Can you buy one without the other?', a: 'Yes — design only, if your developer builds from Figma', b: 'Rarely, unless you already have a design' },
    ],
    verdict:
      'You need both, and you should buy them together from one team if you can. The risk of buying them separately is a design that is beautiful and technically impractical, or a build that implements the wrong structure faithfully.',
    faqs: [
      { q: 'Can I hire a designer and use my own developer?', a: 'Yes, and it works well when both sides work from a proper Figma file with a documented component library. It requires more coordination from you.' },
      { q: 'Do I need a design if I am building a simple site?', a: 'You need at least a considered layout, type scale and colour system. Without it you get a template with your logo on it.' },
      { q: 'Which costs more?', a: 'Development usually costs more than design for the same scope, because it includes the engineering, integrations, testing and launch.' },
    ],
  },
  {
    slug: 'wordpress-vs-shopify',
    a: 'wordpress-website-design',
    b: 'shopify-website-design',
    h1: 'WordPress vs Shopify: Which Platform Should You Choose?',
    keyword: 'WordPress vs Shopify',
    intro:
      'Both are excellent. They suit genuinely different businesses, and the wrong choice is expensive to undo. Here is the honest comparison based on what we build on both.',
    rows: [
      { label: 'Best for', a: 'Content-heavy sites, blogs, membership, complex content models', b: 'E-commerce where the store is the business' },
      { label: 'Ownership', a: 'You own everything, including the data', b: 'You own the data, the theme and the store — but the platform evolves around you' },
      { label: 'Running cost', a: 'Hosting only, typically $20–50/month', b: 'Plan fee plus app subscriptions, often $50–200/month' },
      { label: 'Catalogue size', a: 'Unlimited, but it needs a real developer', b: 'Excellent to about 10,000 products without pain' },
      { label: 'Speed ceiling', a: 'Depends entirely on the build and hosting', b: 'Very high out of the box' },
      { label: 'Content editing', a: 'Powerful but needs training', b: 'Very easy, almost no training needed' },
      { label: 'Checkout', a: 'Plugin-dependent', b: 'Excellent, battle-tested, converts well' },
      { label: 'Our recommendation', a: 'Choose when content is the product', b: 'Choose when selling is the product' },
    ],
    verdict:
      'If you sell more than you publish, choose Shopify. If you publish more than you sell — a media brand, a membership site, a complex service business — choose WordPress. If you are genuinely unsure, that usually means you have not decided whether the site sells or informs, and that decision is worth making first.',
    faqs: [
      { q: 'Can I move from WordPress to Shopify later?', a: 'Yes, and it is a common migration. The cost is losing your URL structure unless you map it carefully.' },
      { q: 'Is WooCommerce the same as WordPress?', a: 'WooCommerce is a WordPress plugin that turns WordPress into a store. We build both — WordPress for content sites, WooCommerce when the store needs to live alongside a heavy content site.' },
      { q: 'Which is better for SEO?', a: 'Both rank well. WordPress gives more control for a large content site; Shopify gives a cleaner technical foundation for a store. On-page work matters more than the platform in most cases.' },
    ],
  },
  {
    slug: 'ecommerce-website-vs-landing-page',
    a: 'ecommerce-website-design',
    b: 'landing-page-design',
    h1: 'Ecommerce Website vs Landing Page: What Do You Actually Need?',
    keyword: 'Ecommerce Website vs Landing Page',
    intro:
      'A landing page is a single page built to convert one action. An ecommerce site is a platform built to sell a catalogue over time. Confusing the two is one of the most expensive mistakes we see.',
    rows: [
      { label: 'Pages', a: 'As many as the catalogue needs', b: 'One' },
      { label: 'Purpose', a: 'Ongoing selling and brand building', b: 'Testing one offer or one campaign' },
      { label: 'Typical budget', a: '$1,999+', b: '$149–$399' },
      { label: 'Typical timeline', a: '10–28 days', b: '3–7 days' },
      { label: 'SEO value', a: 'Compounds — each category page is an entry point', b: 'Limited — one page, one keyword cluster' },
      { label: 'Best when', a: 'You have a product range and want to sell it', b: 'You are testing a new offer, service or campaign' },
      { label: 'Maintenance', a: 'Ongoing — products, stock, content', b: 'Minimal' },
    ],
    verdict:
      'Launch a landing page to test an offer, then build the store once you know what sells. Building a full ecommerce site before you know which products sell is the most common way small brands waste their entire web budget.',
    faqs: [
      { q: 'Can I start with a landing page and add a store later?', a: 'Yes, and we would usually recommend it. The landing page generates the demand data that should shape the store catalogue.' },
      { q: 'Does a landing page hurt SEO?', a: 'Not if it is genuinely useful and structured properly. A thin campaign-only page with no lasting value will not earn rankings, but it does not hurt the pages around it either.' },
      { q: 'What if I have only one product?', a: 'A landing page is usually enough, and it will outperform a full store for a single product. Build a store when you have a catalogue worth browsing.' },
    ],
  },
  {
    slug: 'seo-services-vs-ai-search-optimisation',
    a: 'seo-services',
    b: 'seo-geo-aeo-services',
    h1: 'SEO Services vs GEO and AEO: Do You Need Both?',
    keyword: 'SEO vs GEO and AEO Services',
    intro:
      'Traditional SEO gets you a ranked link. GEO and AEO get you cited inside an AI answer. Buyers increasingly start in an assistant, so the two increasingly work together rather than against each other.',
    rows: [
      { label: 'Target', a: 'Search engine result pages', b: 'AI answers, featured snippets, voice results' },
      { label: 'Mechanism', a: 'Ranking signals, authority, content relevance', b: 'Entity clarity, structured data, answer-shaped content, llms.txt' },
      { label: 'What it optimises', a: 'Your pages', b: 'How machines understand and quote you' },
      { label: 'Typical horizon', a: '4–8 months', b: '2–6 weeks for the technical layer' },
      { label: 'Should it be bought alone?', a: 'Yes — it is the foundation', b: 'No — it assumes the pages already exist and rank' },
      { label: 'Our recommendation', a: 'Both, in that order: SEO first, GEO on top', b: 'Buy the GEO package as an add-on to an SEO retainer' },
    ],
    verdict:
      'They are layers, not alternatives. GEO without SEO is optimising the citation of a page nobody ranks. SEO without GEO increasingly means being invisible in the place buyers now actually start. If your buyers use ChatGPT or Perplexity to research, you need both — and the GEO package is a fixed $249 one-time build.',
    faqs: [
      { q: 'What is llms.txt?', a: 'A plain-text file at your domain root that tells AI systems what your site is, who you serve and which pages matter. We author both a concise and a detailed version.' },
      { q: 'Do I need GEO if I already rank on Google?', a: 'If your buyers use AI assistants for research, yes. Ranking well and being cited are different mechanisms and they need different work.' },
      { q: 'Is the GEO package a one-off?', a: 'Yes — $249 in USD, GBP and EUR, and roughly converted in every other currency. It is a build, not a retainer. Ongoing visibility is the SEO retainer.' },
    ],
  },
];

export const COMPARISON_BY_SLUG: Record<string, ComparisonPair> = Object.fromEntries(
  COMPARISONS.map((c) => [c.slug, c]),
);

export function comparisonPage(args: {
  pair: ComparisonPair;
  prefix: string;
  country: Country;
  crumbs: { name: string; url: string }[];
  hue: number;
}): string {
  const { pair, prefix, crumbs, hue, country } = args;
  const A = SERVICE_BY_SLUG[pair.a];
  const B = SERVICE_BY_SLUG[pair.b];
  const guidance = marketGuidance(country);

  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Comparison · Honest analysis',
  h1Prefix: pair.h1,
  sub: pair.intro,
  primaryLabel: 'Get a Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'See All Packages',
  secondaryHref: resolveStatic(prefix, 'packages'),
})}

${section({
  children: `${sectionHead({ eyebrow: 'Side by side', h2: `${A.name} compared with ${B.name}` })}
  ${comparisonTable({
    caption: pair.h1,
    columns: [A.name, B.name],
    rows: pair.rows.map((r) => ({ label: r.label, values: [r.a, r.b] })),
    highlightIndex: 0,
  })}
  <div class="mt-8 grid md:grid-cols-2 gap-5">
    <div class="card p-6">
      <div class="eyebrow mb-2">Option A</div>
      <h3 class="h4 mb-3">${esc(A.name)}</h3>
      <p class="text-sm text-muted leading-relaxed mb-4">${esc(A.tagline)}</p>
      <div class="flex flex-wrap gap-2 mb-5">${A.deliverables.slice(0, 4).map((d) => `<span class="chip text-xs">${esc(d.split(' ').slice(0, 3).join(' '))}</span>`).join('')}</div>
      <a href="${esc(url(prefix, A.slug))}" class="btn btn-ghost btn-sm">Explore ${esc(A.name)}</a>
    </div>
    <div class="card p-6">
      <div class="eyebrow mb-2">Option B</div>
      <h3 class="h4 mb-3">${esc(B.name)}</h3>
      <p class="text-sm text-muted leading-relaxed mb-4">${esc(B.tagline)}</p>
      <div class="flex flex-wrap gap-2 mb-5">${B.deliverables.slice(0, 4).map((d) => `<span class="chip text-xs">${esc(d.split(' ').slice(0, 3).join(' '))}</span>`).join('')}</div>
      <a href="${esc(url(prefix, B.slug))}" class="btn btn-ghost btn-sm">Explore ${esc(B.name)}</a>
    </div>
  </div>
  <div class="panel mt-6">
    <h3 class="h4 mb-2">Our recommendation</h3>
    <p class="text-sm text-[#c3cee6] leading-relaxed">${esc(pair.verdict)}</p>
  </div>`,
})}

${section({
  children: `${sectionHead({
    eyebrow: `Choosing in ${country.longName}`,
    h2: `What actually decides it in ${country.longName}`,
    sub: 'The same two options behave differently depending on the law, the buyer and the budget. Here is what applies in this market.',
    align: 'left',
  })}
  <div class="grid md:grid-cols-3 gap-5 mb-8">
    <div class="card p-5">
      <div class="eyebrow mb-2">The law</div>
      <p class="text-sm text-muted leading-relaxed">${esc(guidance.compliance)}</p>
    </div>
    <div class="card p-5">
      <div class="eyebrow mb-2">The expectation</div>
      <p class="text-sm text-muted leading-relaxed">${esc(guidance.expectation)}</p>
    </div>
    <div class="card p-5">
      <div class="eyebrow mb-2">How it gets bought</div>
      <p class="text-sm text-muted leading-relaxed">${esc(guidance.buying)}</p>
    </div>
  </div>
  <div class="panel mt-2">
    <h3 class="h4 mb-2">Where this lands in ${esc(country.longName)}</h3>
    <p class="text-sm text-[#c3cee6] leading-relaxed">${esc(pair.verdict)}</p>
    <div class="mt-5 grid sm:grid-cols-2 gap-3">
      <div class="flex items-center justify-between gap-3 rounded-lg px-4 py-3" style="background:rgba(255,255,255,.04);border:1px solid var(--border)">
        <span class="text-sm text-muted">${esc(A.name)} from</span>
        <strong class="text-base" style="color:var(--brand)">${esc(formatPrice(A.fromPrice, country))}</strong>
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg px-4 py-3" style="background:rgba(255,255,255,.04);border:1px solid var(--border)">
        <span class="text-sm text-muted">${esc(B.name)} from</span>
        <strong class="text-base" style="color:var(--brand)">${esc(formatPrice(B.fromPrice, country))}</strong>
      </div>
    </div>
    <p class="text-xs text-faint mt-4">Prices shown in ${esc(country.currency)}, converted from our USD book at the published rate. The final quote is fixed in writing before work starts, and it does not change mid-project.</p>
  </div>`,
})}

${section({
  children: `${sectionHead({ eyebrow: 'Questions', h2: `${pair.h1} — FAQ` })}
  ${faqBlock(pair.faqs)}`,
  tight: true,
})}

${section({
  children: ctaBand({
    title: 'Not sure which one you need?',
    body: 'Tell us the outcome you want and we will tell you which route gets you there fastest. No obligation, and we will say if the answer is "neither".',
    primaryLabel: 'Get My Free Quote',
    primaryHref: resolveStatic(prefix, 'contact'),
    secondaryLabel: 'View Packages',
    secondaryHref: resolveStatic(prefix, 'packages'),
  }),
  tight: true,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison index
// ─────────────────────────────────────────────────────────────────────────────

export function comparisonIndexPage(args: {
  prefix: string;
  country: Country;
  crumbs: { name: string; url: string }[];
  hue: number;
}): string {
  const { prefix, country, crumbs } = args;
  return `
${breadcrumbs(crumbs)}
${hero({
  eyebrow: 'Comparisons',
  h1Prefix: 'Service Comparisons',
  sub: 'Honest, side-by-side comparisons of the services we offer — including where each one is the wrong choice for your business.',
  primaryLabel: 'Get a Free Quote',
  primaryHref: resolveStatic(prefix, 'contact'),
  secondaryLabel: 'See All Services',
  secondaryHref: resolveStatic(prefix, 'services'),
})}
${section({
  children: `${grid(2, COMPARISONS.map((c, i) => `<a href="${esc(resolveStatic(prefix, 'compare', c.slug))}" class="card card-hover card-glow p-6 h-full flex flex-col reveal" style="transition-delay:${i * 60}ms">
      <h2 class="h4 mb-3">${esc(c.h1)}</h2>
      <p class="text-sm text-muted leading-relaxed flex-1">${esc(truncate(c.intro, 180))}</p>
      <span class="mt-4 text-sm font-semibold inline-flex items-center gap-1.5" style="color:var(--brand)">Read the comparison ${icon('arrow', 'w-4 h-4', 2.2)}</span>
    </a>`).join(''))}`,
})}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML sitemap — a human-readable index of every URL on the site
// ─────────────────────────────────────────────────────────────────────────────

export interface SitemapLink {
  name: string;
  url: string;
}

export function htmlSitemapPage(args: {
  prefix: string;
  country: Country;
  crumbs: { name: string; url: string }[];
  groups: { title: string; links: SitemapLink[] }[];
  hue: number;
}): string {
  const { prefix, crumbs, groups } = args;
  const body = groups
    .map(
      (g) =>
        '<div class="mb-9">' +
        '<h2 class="h3 mb-4" id="' + slugifyGroup(g.title) + '">' + esc(g.title) + '</h2>' +
        '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">' +
        g.links
          .map(
            (l) =>
              '<a href="' + esc(l.url) + '" class="text-sm text-muted hover:text-white transition-colors">' + esc(l.name) + '</a>',
          )
          .join('') +
        '</div></div>',
    )
    .join('');

  return (
    breadcrumbs(crumbs) +
    hero({
      eyebrow: 'Every page, indexed',
      h1Prefix: 'Site Map',
      sub: 'A complete, human-readable index of every page on this website — useful for finding something quickly, and for crawlers that do not read XML.',
      primaryLabel: 'Get My Free Quote',
      primaryHref: resolveStatic(prefix, 'contact'),
      secondaryLabel: 'XML sitemap',
      secondaryHref: '/sitemap.xml',
    }) +
    section({ children: body })
  );
}

function slugifyGroup(s: string): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
