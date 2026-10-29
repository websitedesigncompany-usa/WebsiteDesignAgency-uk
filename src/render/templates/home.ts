/**
 * Homepage template.
 *
 * Primary keyword: "Website Design Company" (USA). The home page IS the
 * website design services page for the US market, so it carries the full
 * package set, deliverables, FAQ, reviews and case studies inline — there is
 * no separate /website-design-services/ page for the US.
 */

import { esc, truncate } from '../../lib/html.js';
import { icon } from '../icons.js';
import { SITE } from '../../config/site.js';
import {
  section, sectionHead, grid, statsBar, trustBadges, priceCard, faqBlock,
  testimonialCard, aggregateRatingBlock, ctaBand, processTimeline, checkList,
  paragraphs, linkCloud, coverArt, featureCard, serviceCard,
} from '../components.js';
import { hero, leadForm, inlineCta, heroShowcase, auditCallout } from '../hero.js';
import { postCard, portfolioCard, caseStudyCard } from './service.js';
import { url } from '../../lib/routing.js';
import { PAGE_SERVICES, servicesByCategory, SERVICE_BY_SLUG } from '../../data/services.js';
import { packagesFor } from '../../data/packages.js';
import { FEATURED_PORTFOLIO, PORTFOLIO, featuredTestimonials } from '../../data/clients.js';
import { INDUSTRIES } from '../../data/industries.js';
import { COUNTRIES, PREFIXED_COUNTRIES, HOME_COUNTRY } from '../../data/regions.js';
import { whyUsPoints } from '../../content/service-copy.js';

export interface HomeData {
  posts: Parameters<typeof postCard>[0][];
  caseStudies: Parameters<typeof caseStudyCard>[0][];
  price: (usd: number, pkgId?: string) => string;
}

export function homePage(d: HomeData): string {
  const homeService = SERVICE_BY_SLUG[''];
  const packages = packagesFor('', 'standard');
  const entry = d.price(homeService.fromPrice);

  return `
${hero({
  eyebrow: `Premium quality · Affordable prices · Since ${SITE.founded}`,
  h1Prefix: 'Website Design Company',
  h1Emphasis: 'for growth',
  sub: `Custom, responsive, modern and SEO-friendly websites for US businesses — with fast turnaround, unlimited revisions and fixed prices from <strong>${esc(entry)}</strong>. Premium agency output without the agency invoice.`,
  primaryLabel: 'Get My Free Quote',
  primaryHref: '/contact/',
  secondaryLabel: 'See Packages',
  secondaryHref: '#packages',
  chips: ['2,400+ projects delivered', 'Unlimited revisions', '5–21 day delivery', '4.9/5 from 268 reviews'],
  variant: 'home',
})}

${section({
  children: `${statsBar()}<div class="mt-8">${trustBadges()}</div>`,
  tight: true,
})}

${section({
  children: `<div class="grid lg:grid-cols-2 gap-12 items-center">
    <div class="reveal">
      <div class="eyebrow mb-4">Why ${esc(SITE.name)}</div>
      <h2 class="h2">A ${esc('website design company')} built on speed, transparency and results</h2>
      <p class="lead mt-5">Most businesses do not have a website problem — they have a website provider problem. Slow delivery, vague scope, surprise invoices, a site that looks like a template and loads like it was built in 2009.</p>
      <p class="text-muted leading-relaxed mt-4">We built ${esc(SITE.name)} to do the opposite. Published fixed prices. Deliveries measured in days rather than quarters. Unlimited revisions until you are genuinely happy. On-page SEO, Core Web Vitals work and schema included in every build, because they should have been from the start.</p>
      <p class="text-muted leading-relaxed mt-4">Today we have delivered more than 2,400 projects for 1,180+ clients across 38 countries. The average client has been with us for over three years. And every project still starts the same way: you tell us what you need, we come back within one business day with a fixed price.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="/contact/" class="btn btn-primary btn-lg btn-shine">Start My Project ${icon('arrow', 'w-4 h-4', 2.2)}</a>
        <a href="/portfolio/" class="btn btn-ghost btn-lg">See Our Work</a>
      </div>
    </div>
    <div class="reveal">${heroShowcase()}</div>
  </div>`,
  id: 'why-us',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Core services',
    h2: 'Everything you need to build and grow a web presence',
    sub: 'Design, development, SEO, content, video and paid marketing — delivered by one team, so nothing falls between vendors.',
  })}
  ${grid(4, PAGE_SERVICES.slice(0, 8).map((s, i) => serviceCard({
    href: url('', s.slug), icon: s.icon, title: s.name, body: s.tagline,
    price: d.price(s.fromPrice), accentHue: s.hue, delay: i * 55,
  })).join(''))}
  <div class="text-center mt-10 reveal">
    <a href="/services/" class="btn btn-ghost btn-lg">Explore all ${PAGE_SERVICES.length} services ${icon('arrow', 'w-4 h-4', 2.2)}</a>
  </div>`,
  id: 'services',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Pricing',
    h2: '<span id="exact-primary-h2">Website Design Company</span> packages',
    sub: 'Fixed-price packages, not hourly billing. Choose a tier, or request a custom scope — every package below is a complete, sellable product.',
  })}
  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    ${packages.slice(0, 6).map((p, i) => priceCard({
      id: `pkg-${p.id}`,
      name: p.name,
      priceDisplay: d.price(p.usd, p.id),
      periodLabel: p.period === 'monthly' ? 'per month' : 'one-time',
      suited: p.suited,
      features: p.features,
      eta: p.eta,
      units: p.units,
      badge: p.badge,
      ctaHref: url('', 'checkout', p.sku),
      featured: i === 1,
    })).join('')}
  </div>
  <p class="text-center text-sm text-muted mt-7 reveal">Every package includes a CMS, mobile-first design, on-page SEO, schema markup, analytics and post-launch support. <a href="/packages/" class="font-semibold underline" style="color:var(--brand)">Compare all packages</a></p>`,
  id: 'packages',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Our process',
    h2: 'From brief to launch in five clear steps',
    sub: 'The same five steps on every project, whether it is a 5-page site or a custom platform.',
  })}
  ${processTimeline([
    { title: 'Brief & fixed quote', body: 'You tell us what you need. Within one business day you get a written scope, a fixed price and a delivery date. No estimates that move later.' },
    { title: 'Research & wireframes', body: 'We analyse your market, competitors and real search demand. You approve the structure before anyone spends time on visual design.' },
    { title: 'Design & unlimited revisions', body: 'Full custom design in structured review rounds. Unlimited revisions until the direction is right — we never start building on an unapproved design.' },
    { title: 'Build, CMS & SEO', body: 'Responsive, accessible, fast build. CMS setup, on-page SEO, schema, analytics and form routing, then a full QA pass across devices and browsers.' },
    { title: 'Launch & aftercare', body: 'DNS, SSL, redirects, sitemap submission, Search Console. Source access, documentation and training handed over. 30 days of support included.' },
  ])}`,
  id: 'process',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Selected work',
    h2: 'Recent projects and measurable results',
    sub: 'A sample of recent work. Every number below was measured after launch.',
  })}
  ${grid(3, FEATURED_PORTFOLIO.slice(0, 6).map((p, i) => portfolioCard(p, '', i)).join(''))}
  <div class="text-center mt-10 reveal"><a href="/portfolio/" class="btn btn-ghost btn-lg">View the full portfolio ${icon('arrow', 'w-4 h-4', 2.2)}</a></div>`,
  id: 'portfolio',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Case studies',
    h2: 'How we have moved the numbers for real clients',
    sub: 'Challenge, approach and the measured outcome. No vanity metrics.',
  })}
  ${grid(3, d.caseStudies.slice(0, 3).map((c, i) => caseStudyCard(c, i)).join(''))}
  <div class="text-center mt-10 reveal"><a href="/case-studies/" class="btn btn-ghost btn-lg">Read all case studies ${icon('arrow', 'w-4 h-4', 2.2)}</a></div>`,
  id: 'case-studies',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Client reviews',
    h2: 'Trusted by founders, owners and marketing teams',
    sub: `${SITE.rating.value} out of 5 from ${SITE.rating.count} verified reviews.`,
  })}
  ${grid(3, featuredTestimonials(6).map((t, i) => testimonialCard(t, i)).join(''))}
  <div class="mt-8">${aggregateRatingBlock()}</div>`,
  id: 'reviews',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Industries',
    h2: 'Sector-specific expertise, not generic templates',
    sub: 'We know what actually drives revenue in your market — and what objection is stopping people enquiring.',
  })}
  ${linkCloud(INDUSTRIES.slice(0, 20).map((i) => ({ name: i.name, url: url('', 'industries', i.slug) })), 'justify-center')}`,
  id: 'industries',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Global reach',
    h2: `A US-based team serving ${COUNTRIES.length} countries`,
    sub: `Our primary market is the USA — all 50 states, from ${HOME_COUNTRY.cities.length} major metro areas. We also deliver local campaigns in ${PREFIXED_COUNTRIES.length} other countries, priced in local currency and written by people who know the market.`,
  })}
  ${linkCloud(PREFIXED_COUNTRIES.map((c) => ({ name: c.longName, url: url('/', c.slug) })), 'justify-center')}`,
  id: 'locations',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Guides',
    h2: 'Latest from our blog',
    sub: 'Practical guides on cost, process, SEO and getting a better result from your website investment.',
  })}
  ${grid(3, d.posts.slice(0, 6).map((p, i) => postCard(p, i)).join(''))}
  <div class="text-center mt-10 reveal"><a href="/blog/" class="btn btn-ghost btn-lg">Read the blog ${icon('arrow', 'w-4 h-4', 2.2)}</a></div>`,
  id: 'blog',
})}

${section({
  children: `${sectionHead({
    eyebrow: 'Questions',
    h2: 'Website Design Company — frequently asked questions',
    sub: 'The questions we are asked most often by US businesses planning a website.',
  })}
  ${faqBlock(homeFaqs(), 'faq')}`,
  id: 'faq',
})}

${section({
  children: `<div class="grid lg:grid-cols-2 gap-10 items-start">
    ${leadForm({
      service: '',
      region: 'United States',
      heading: 'Get your free fixed quote',
      sub: 'Tell us about your project and we will come back within one business day with a written scope, fixed price and delivery date. No obligation.',
      showServiceSelect: true,
      servicesList: PAGE_SERVICES.map((s) => ({ slug: s.slug, name: s.name })),
    })}
    <div class="reveal">
      <div class="eyebrow mb-4">Why clients choose us</div>
      <h2 class="h2 mb-6">Premium quality. Affordable prices. No compromise.</h2>
      <div class="space-y-4">
        ${whyUsPoints().map((p) => `<div class="flex gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:hsla(190,90%,58%,.13);border:1px solid hsla(190,90%,58%,.26);color:var(--brand)">${icon(p.icon, 'w-5 h-5', 2)}</div>
          <div><h3 class="font-bold text-sm mb-1">${esc(p.title)}</h3><p class="text-sm text-muted leading-relaxed">${esc(p.body)}</p></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`,
  id: 'contact',
})}

${section({
  children: ctaBand({
    title: 'Let us build you a website that actually works',
    body: 'Fixed price, fast delivery, unlimited revisions and full ownership. Tell us what you need — you will have a written scope within one business day.',
    primaryLabel: 'Get My Free Quote',
    primaryHref: '/contact/',
    secondaryLabel: 'Explore Our Services',
    secondaryHref: '/services/',
  }),
  tight: true,
})}
`;
}

export function homeFaqs() {
  return [
    { q: 'How much does a website cost?', a: `Our website design packages start at ${'$199'} for a 5-page starter site and scale to ${'$3,999+'} for complex platforms. Every package is a fixed price with a published feature list — not an hourly meter. Most US businesses land between $399 and $1,199.` },
    { q: 'How long will my website take?', a: 'A starter site ships in 5–7 business days. Business and e-commerce builds run 10–21 days. Custom web applications are scoped individually, typically 4–10 weeks. We commit to a delivery date in the written scope before work starts.' },
    { q: 'Do I really get unlimited revisions?', a: 'Yes. Unlimited revisions are included on the design direction you choose. We work in structured review rounds so your feedback lands in one consolidated pass rather than trickling in over weeks, which is what actually makes the promise workable.' },
    { q: 'Will my website be mobile-friendly and fast?', a: 'Every build is mobile-first and designed at 360px upward. We set an explicit performance budget — LCP under 2.5 seconds on 4G, CLS under 0.1 — and verify on real device sizes rather than a desktop preview scaled down.' },
    { q: 'Is SEO included or is it an upsell?', a: 'SEO fundamentals are included in every build: unique title and description per page, proper heading hierarchy, canonical URLs, Open Graph tags, structured data, XML sitemap, robots.txt, image alt text and Search Console setup. Ongoing SEO campaigns are separate because they are ongoing work.' },
    { q: 'Who owns the website when it is finished?', a: 'You do — completely. Source code, design files, content, domain registration and hosting credentials all transfer to you on final payment. We include a documented handover call and training session. There is no lock-in and no hostage situation.' },
    { q: 'What do I need to provide?', a: 'Your logo files if you have them, any brand guidelines, your content or a rough idea of your content, and a clear picture of who you are trying to reach. If you do not have content ready, we can help structure it — that is part of the scope on most packages.' },
    { q: 'Can you redesign my site without losing my rankings?', a: 'Yes. We map every existing URL, preserve redirect chains, keep title and heading structure where it already performs, and roll out in stages so rankings do not dip during the transition. Several of our projects have gained traffic immediately after a redesign.' },
    { q: 'What happens after launch?', a: 'You get 30 days of post-launch support as standard, and longer support windows on higher tiers. After that you are free to maintain it yourself — we provide a CMS, a written guide and a training session — or keep it on a care plan if you would rather we handled updates, security patching and monitoring.' },
    { q: 'Do you work with businesses outside the USA?', a: `Yes. We serve clients in ${COUNTRIES.length} countries including the UK, Canada, Australia, the UAE, Saudi Arabia, Pakistan, India, Germany, France and Brazil. We price in your local currency and write copy in your market's language rather than exporting a US template.` },
  ];
}
