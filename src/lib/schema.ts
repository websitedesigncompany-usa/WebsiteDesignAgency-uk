/**
 * JSON-LD schema graph builders.
 *
 * Design note: services here are BOTH a Service and a Product. Each service
 * page therefore emits a node graph containing:
 *   Organization -> WebSite -> WebPage -> BreadcrumbList
 *   Service (+ provider, areaServed, offers)
 *   Product (+ brand, offers -> Offer -> AggregateOffer)
 *   FAQPage (AEO), Review/AggregateRating (GEO trust)
 * and page-type specific extras (Article, HowTo, LocalBusiness, ItemList...).
 *
 * Everything is emitted as a single @graph with stable @ids so nodes can
 * reference each other, which is what Google recommends.
 */

import { SITE, ORIGIN, abs } from '../config/site.js';
import { Country, City } from '../data/regions.js';
import { Service } from '../data/services.js';
import { Package } from '../data/packages.js';
import { Faq } from '../data/services.js';

const ID = {
  org: `${ORIGIN}/#organization`,
  site: `${ORIGIN}/#website`,
  brand: `${ORIGIN}/#brand`,
};

export type Json = Record<string, unknown>;

export const ORG_ID = ID.org;
export const SITE_ID = ID.site;
export const BRAND_ID = ID.brand;

// ─────────────────────────────────────────────────────────────────────────────
// Core entities
// ─────────────────────────────────────────────────────────────────────────────

export function organizationNode(): Json {
  return {
    '@type': ['Organization', 'ProfessionalService', 'LocalBusiness'],
    '@id': ID.org,
    name: SITE.name,
    alternateName: [SITE.altName, 'Marco Marketing Agency'],
    legalName: SITE.legalName,
    url: `${ORIGIN}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${ORIGIN}/#logo`,
      url: abs('/assets/img/logo-72.webp'),
      contentUrl: abs('/assets/img/logo-72.webp'),
      width: 72,
      height: 72,
      caption: `${SITE.name} logo`,
    },
    image: { '@id': `${ORIGIN}/#logo` },
    description: SITE.shortDescription,
    slogan: 'Premium quality. Affordable prices. Unlimited revisions.',
    foundingDate: SITE.founded,
    email: SITE.contact.email,
    telephone: SITE.contact.phone,
    priceRange: '$199 – $3999+',
    currenciesAccepted: 'USD',
    paymentAccepted: 'PayPal, Credit Card, Bank Transfer, USDC, BTC, ETH',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.contact.address.street,
      addressLocality: SITE.contact.address.city,
      addressRegion: SITE.contact.address.region,
      postalCode: SITE.contact.address.postalCode,
      addressCountry: SITE.contact.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 39.8283,
      longitude: -75.1525,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.contact.phone,
        contactType: 'sales',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Portuguese', 'Urdu', 'Hindi'],
      },
      {
        '@type': 'ContactPoint',
        email: SITE.contact.officialEmail,
        contactType: 'customer support',
        areaServed: 'Worldwide',
      },
    ],
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.linkedin,
      SITE.social.x,
      SITE.social.youtube,
      `${ORIGIN}/`,
    ],
    knowsAbout: [
      'Website Design',
      'Web Development',
      'Search Engine Optimization',
      'Generative Engine Optimization',
      'Answer Engine Optimization',
      'E-commerce',
      'Branding',
      'Digital Marketing',
      'Content Marketing',
      'Video Production',
    ],
    makesOffer: [],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: SITE.rating.value,
      reviewCount: SITE.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function websiteNode(): Json {
  return {
    '@type': 'WebSite',
    '@id': ID.site,
    url: `${ORIGIN}/`,
    name: SITE.name,
    alternateName: SITE.altName,
    description: SITE.shortDescription,
    inLanguage: 'en-US',
    publisher: { '@id': ID.org },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${ORIGIN}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function brandNode(): Json {
  return {
    '@type': 'Brand',
    '@id': ID.brand,
    name: SITE.name,
    alternateName: SITE.altName,
    url: `${ORIGIN}/`,
    logo: abs('/assets/img/logo-72.webp'),
    description: SITE.shortDescription,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page-level
// ─────────────────────────────────────────────────────────────────────────────

export interface WebPageArgs {
  url: string;
  name: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  datePublished?: string;
  dateModified?: string;
  primaryKeyword: string;
  /** Extra keywords used for `about` and `mentions`. */
  keywords?: string[];
  speakable?: SpeakableSpec | null;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
  /** @type override, e.g. 'ItemList' or 'WebPage'. */
  type?: string;
}

export interface SpeakableSpec {
  cssSelector: string[];
  xpath: string[];
}

export function webPageNode(args: WebPageArgs): Json {
  const node: Json = {
    '@type': 'WebPage',
    '@id': `${args.url}#webpage`,
    url: args.url,
    name: args.name,
    description: args.description,
    isPartOf: { '@id': ID.site },
    about: { '@id': `${args.url}#service` },
    inLanguage: 'en',
    primaryImageOfPage: abs('/assets/img/og-default.webp'),
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    breadcrumb: { '@id': `${args.url}#breadcrumb` },
    speakable: args.speakable
      ? { '@type': 'SpeakableSpecification', cssSelector: args.speakable.cssSelector, xpath: args.speakable.xpath }
      : undefined,
    significantLink: args.keywords?.slice(0, 6).map((k) => `${args.url}#${k.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
  };
  return prune(node);
}

export function breadcrumbNode(url: string, items: BreadcrumbItem[]): Json {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.type === 'WebPage' ? { '@id': item.url } : item.url,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service + Product (services are both)
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceNodeArgs {
  service: Service;
  url: string;
  country: Country;
  city?: City;
  packages: Package[];
  displayPrice: (usd: number, pkgId?: string) => string;
  schemaPrice: (usd: number, pkgId?: string) => { amount: number; currency: string };
}

export function serviceNode(args: ServiceNodeArgs): Json {
  const { service, url, country, city, packages, schemaPrice } = args;
  const from = schemaPrice(service.fromPrice, service.slug);

  return prune({
    '@type': 'Service',
    '@id': `${url}#service`,
    name: `${service.primaryKeyword}${city ? ` in ${city.name}` : country.slug ? ` in ${country.longName}` : ''}`,
    serviceType: service.name,
    alternateName: service.name,
    description: service.summary,
    url,
    provider: { '@id': ID.org },
    areaServed: areaServed(country, city),
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Small and medium business owners, enterprise marketing teams and e-commerce brands',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${url}#packages`,
      servicePhone: SITE.contact.phone,
    },
    termsOfService: `${ORIGIN}/terms/`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: from.currency,
      lowPrice: from.amount,
      highPrice: schemaPrice(Math.max(...packages.map((p) => p.usd))).amount,
      offerCount: packages.length,
      offers: packages.map((p) => offerNode(p, url, args)),
      seller: { '@id': ID.org },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} packages`,
      itemListElement: packages.map((p, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: {
          '@type': 'Service',
          name: p.name,
          description: p.suited,
        },
      })),
    },
  });
}

export function productNode(args: ServiceNodeArgs): Json {
  const { service, url, packages, schemaPrice } = args;
  const from = schemaPrice(service.fromPrice, service.slug);

  return prune({
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `${service.name}${args.city ? ` — ${args.city.name}` : ''}`,
    description: service.summary,
    url,
    image: [abs('/assets/img/og-default.webp')],
    sku: packages[0]?.sku || `SVC-${service.slug || 'web'}`,
    mpn: `WDC-${(service.slug || 'websitedesign').toUpperCase()}`,
    category: `${service.category} Services`,
    brand: { '@id': ID.brand },
    manufacturer: { '@id': ID.org },
    additionalProperty: service.deliverables.slice(0, 8).map((d, i) => ({
      '@type': 'PropertyValue',
      name: d,
      position: i + 1,
    })),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: from.currency,
      lowPrice: from.amount,
      highPrice: schemaPrice(Math.max(...packages.map((p) => p.usd))).amount,
      offerCount: packages.length,
      offers: packages.map((p) => offerNode(p, url, args)),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: SITE.rating.value,
      reviewCount: SITE.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: buildReviews(url),
    isRelatedTo: { '@id': `${url}#service` },
  });
}

function offerNode(pkg: Package, pageUrl: string, args: ServiceNodeArgs): Json {
  const price = args.schemaPrice(pkg.usd, pkg.id);
  const url = `${pageUrl}#pkg-${pkg.id}`;
  return {
    '@type': 'Offer',
    '@id': url,
    name: `${pkg.name} — ${args.service.name}`,
    sku: pkg.sku,
    url,
    priceCurrency: price.currency,
    price: price.amount,
    priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ID.org },
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 999,
      unitText: 'project',
    },
    priceSpecification: {
      '@type': args.displayPrice(pkg.usd).includes('249') ? 'UnitPriceSpecification' : 'PriceSpecification',
      priceCurrency: price.currency,
      price: price.amount,
      valueAddedTaxIncluded: true,
    },
  };
}

export interface ReviewInput {
  author: string;
  datePublished: string;
  reviewBody: string;
  name: string;
  rating: number;
}

export function reviewNode(review: ReviewInput, pageUrl: string): Json {
  return {
    '@type': 'Review',
    '@id': `${pageUrl}#review-${review.author.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    author: { '@type': 'Person', name: review.author },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    name: review.name,
    reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    itemReviewed: { '@id': `${pageUrl}#product` },
    publisher: { '@id': ID.org },
  };
}

function buildReviews(pageUrl: string): Json[] {
  // Populated by the page template with real testimonials.
  return [];
}

export function reviewsArray(reviews: ReviewInput[], pageUrl: string): Json[] {
  return reviews.map((r) => reviewNode(r, pageUrl));
}

export function areaServed(country: Country, city?: City): Json {
  if (city) {
    return {
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'Country', name: country.longName },
    };
  }
  if (country.slug) {
    return {
      '@type': 'Country',
      name: country.longName,
      alternateName: [country.longName, country.name],
    };
  }
  return {
    '@type': 'Country',
    name: country.longName,
    containsPlace: country.cities.slice(0, 25).map((c) => ({ '@type': 'City', name: c.name })),
  };
}

export function localBusinessNode(country: Country, city: City, url: string, service: Service): Json {
  return prune({
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${url}#localbusiness`,
    name: `${SITE.name} — ${service.name} in ${city.name}`,
    description: service.summary,
    url,
    image: abs('/assets/img/og-default.webp'),
    logo: abs('/assets/img/logo-72.webp'),
    telephone: city.phone || SITE.contact.phone,
    email: SITE.contact.email,
    priceRange: '$199 – $3999+',
    parentOrganization: { '@id': ID.org },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: country.code,
    },
    areaServed: { '@type': 'City', name: city.name },
    geo: { '@type': 'GeoCoordinates', latitude: 0, longitude: 0 },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} in ${city.name}`,
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: service.primaryKeyword } },
      ],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AEO / GEO
// ─────────────────────────────────────────────────────────────────────────────

export function faqNode(faqs: Faq[], url: string): Json {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** The exact shape Google's AI/LLM crawlers look for to extract an answer. */
export function answerNode(question: string, answer: string, url: string): Json {
  return {
    '@type': 'Question',
    '@id': `${url}#q-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}`,
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
    url: `${url}#faq`,
  };
}

export function howToNode(args: {
  name: string;
  steps: { name: string; text: string; url?: string }[];
  url: string;
  totalTime?: string;
}): Json {
  return {
    '@type': 'HowTo',
    '@id': `${args.url}#howto`,
    name: args.name,
    totalTime: args.totalTime,
    step: args.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: s.url,
    })),
  };
}

export function articleNode(args: {
  url: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: { name: string; url: string; jobTitle: string };
  publisher: string;
  wordCount: number;
  keywords: string[];
  section: string;
  imageWidth?: number;
  imageHeight?: number;
}): Json {
  return prune({
    '@type': ['Article', 'BlogPosting', 'TechArticle'],
    '@id': `${args.url}#article`,
    headline: args.headline,
    alternativeHeadline: args.headline,
    description: args.description,
    image: { '@type': 'ImageObject', url: args.image, width: 1200, height: 630 },
    datePublished: args.datePublished,
    dateModified: args.dateModified,
    author: { '@type': 'Person', name: args.author.name, url: args.author.url, jobTitle: args.author.jobTitle },
    publisher: { '@id': ID.org },
    isPartOf: { '@id': ID.site },
    mainEntityOfPage: { '@id': `${args.url}#webpage` },
    inLanguage: 'en',
    keywords: args.keywords.join(', '),
    articleSection: args.section,
    wordCount: args.wordCount,
    proficiencyLevel: 'Expert',
    articleBody: undefined,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.article-summary', '.faq-answer'],
      xpath: ['/html/body/article/div[1]', '//div[contains(@class,"faq-answer")]'],
    },
  });
}

export function caseStudyNode(args: {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image: string;
  industry: string;
  location: string;
  results: { metric: string; value: string }[];
}): Json {
  return prune({
    '@type': 'Article',
    '@id': `${args.url}#article`,
    headline: args.title,
    description: args.description,
    image: { '@type': 'ImageObject', url: args.image, width: 1200, height: 630 },
    datePublished: args.datePublished,
    dateModified: args.dateModified,
    author: { '@id': ID.org },
    publisher: { '@id': ID.org },
    isPartOf: { '@id': ID.site },
    mainEntityOfPage: { '@id': `${args.url}#webpage` },
    articleSection: 'Case Study',
    about: args.industry,
    contentLocation: { '@type': 'Place', name: args.location },
    keywords: `case study, ${args.industry}, ${args.location}, results`,
  });
}

export function itemListNode(items: { name: string; url: string }[], url: string, name: string): Json {
  return {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function collectionPageNode(url: string, name: string, description: string, breadcrumb: BreadcrumbItem[]): Json {
  return prune({
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': ID.site },
    breadcrumb: { '@id': `${url}#breadcrumb` },
  });
}

export function faqCollectionNode(url: string, name: string, faqs: Faq[]): Json {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    name,
    url,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function siteSearchNode(url: string): Json {
  return {
    '@type': 'WebSite',
    '@id': `${url}#website`,
    url: ORIGIN,
    name: SITE.name,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function contactPageNode(url: string, areaServedList: string[]): Json {
  return prune({
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    url,
    name: 'Contact',
    mainEntity: {
      '@type': 'Organization',
      name: SITE.name,
      telephone: SITE.contact.phone,
      email: SITE.contact.email,
      contactPoint: areaServedList.map((a) => ({
        '@type': 'ContactPoint',
        contactType: 'sales',
        areaServed: a,
        telephone: SITE.contact.phone,
        availableLanguage: 'English',
      })),
    },
  });
}

export function aboutPageNode(url: string): Json {
  return prune({
    '@type': 'AboutPage',
    '@id': `${url}#webpage`,
    url,
    name: `About ${SITE.name}`,
    mainEntity: { '@id': ID.org },
  });
}

/** WebSite + Organization + Brand, present on every page. */
export function baseGraph(): Json[] {
  return [organizationNode(), websiteNode(), brandNode()];
}

/** Assemble the full graph for a page. */
export function graph(nodes: Json[]): { '@context': string; '@graph': Json[] } {
  return { '@context': 'https://schema.org', '@graph': pruneArray(nodes) };
}

/** Remove undefined / null / empty-array values recursively. */
export function prune<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => prune(v)).filter((v) => v !== undefined && v !== null) as unknown as T;
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (typeof v === 'string' && v.trim() === '') continue;
      out[k] = prune(v);
    }
    return out as T;
  }
  return obj;
}

function pruneArray(arr: Json[]): Json[] {
  return arr.map((n) => prune(n)).filter((n) => n && Object.keys(n).length > 0);
}
