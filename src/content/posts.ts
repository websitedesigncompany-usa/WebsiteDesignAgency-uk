/**
 * Blog + case study generation.
 *
 * These are generated from a structured matrix of
 *     post type × service × region/city × industry × angle
 * and assembled from genuinely differentiated section templates, so two
 * posts in the matrix are never the same page with a swapped name.
 *
 * Every generated post carries:
 *   - a unique primary keyword
 *   - a meta title (<=60) and description (101–159)
 *   - H1 / H2 / H3 hierarchy
 *   - an FAQ block (AEO) and JSON-LD Article schema
 *   - author, dates, reading time
 */

import { City, Country } from '../data/regions.js';
import { Service } from '../data/services.js';
import { INDUSTRIES, Industry } from '../data/industries.js';
import { seededRandom, pick, slugify, readingTime, wordCount } from '../lib/html.js';

/**
 * Redesign topics.
 *
 * One post per keyword per region. The body is written around the region —
 * local cost context, local buyer behaviour, local market notes — so two
 * regions never carry the same article.
 */
export interface RedesignTopic {
  slug: string;
  /** Exact-match primary keyword, before the region suffix. */
  keyword: string;
  /** Title stem; the region and year are appended. */
  title: string;
  /** Section headings, in order. */
  headings: string[];
  /** The 3–5 body paragraphs, written region-agnostically with {loc}/{kw}/{svc} tokens. */
  body: string[];
  /** Bullet list under the closing section. */
  takeaways: string[];
}

export const REDESIGN_TOPICS: RedesignTopic[] = [
  {
    slug: 'rebranding-checklist',
    keyword: 'Rebranding Checklist',
    title: 'Rebranding Checklist',
    headings: ['What a rebrand actually involves', 'The checklist, in order', 'What most businesses get wrong', 'How long it should take'],
    body: [
      'A rebrand is not a new logo. It is a change to what the business stands for, how it sounds and how it looks — and every one of those has to land consistently or the rebrand reads as a mistake. The checklist below is the order we work through, because it is the order that stops expensive rework later.',
      'Start with the positioning, not the picture. If the words have not shifted, a new mark will look like decoration on the old promise. Write down who you are for, what you do that they cannot get elsewhere, and what you are no longer doing. That paragraph becomes the filter for every design decision that follows.',
      'Then the name. If the name needs to change, change it first, because the domain, the email and every piece of collateral depend on it. This is also the most expensive decision in the project, which is why it gets its own round of review.',
      'Only then come the identity: logo, colour, typography, imagery, tone. And then the application — every page, every template, every email, every invoice, every social profile. A rebrand that stops at the logo is not finished; it is started.',
    ],
    takeaways: [
      'Positioning first, logo last — never the other way round',
      'Change the name before you change the domain or the email',
      'Audit every place the old identity appears before you launch',
      'Give the new identity a handover document, not a folder of files',
    ],
  },
  {
    slug: 'website-redesign-cost',
    keyword: 'Website Redesign Cost',
    title: 'Website Redesign Cost',
    headings: ['What drives the cost', 'Real price bands', 'What pushes a quote up', 'Where you can save without paying for it'],
    body: [
      'The honest answer is that a redesign costs what the scope requires, and the scope is usually driven by three things: how many distinct page templates exist, how much of the old content survives, and how much of the underlying platform has to change underneath.',
      'For a focused business — a handful of pages, existing content that mostly works, a platform that is still supported — a redesign is a straightforward fixed-price project. For a large catalogue, a multi-region site or a platform that is genuinely end-of-life, you are looking at a rebuild, and the price follows the complexity rather than the page count.',
      'What pushes a quote up is usually not design. It is content migration, integrations that have to survive the move, and the requirement to protect existing rankings, which means building and testing a redirect map rather than hoping redirects work.',
      'Where you can save honestly: consolidate templates, keep the copy you can, supply your own photography, and agree a fixed scope before anyone opens a design file. Where you cannot: a site that must rank, must convert and must survive the move is not a discount project.',
    ],
    takeaways: [
      'Page count is a weak predictor — template count and integration count are the real drivers',
      'Content migration is usually the largest hidden line item',
      'Budget for the redirect map; it is what protects the traffic you already have',
      'A quote with written inclusions can be compared; a quote without one cannot',
    ],
  },
  {
    slug: 'website-redesign-process',
    keyword: 'Website Redesign Process',
    title: 'Website Redesign Process',
    headings: ['The six stages', 'Why the order matters', 'What we need from you', 'The two gates that matter'],
    body: [
      'Every site we redesign moves through the same six stages: audit and strategy, information architecture, design, build, migration, and launch with monitoring. The order is not a preference. It is the cheapest sequence, because each stage locks in decisions the next one depends on.',
      'Audit and strategy establish what the site is actually for and what it currently earns. Information architecture decides the structure before anyone looks at a colour. Design happens against an approved structure. Build follows an approved design. Migration happens against approved templates. Skipping a stage does not save time; it moves the cost to a stage where it is three times more expensive.',
      'From your side we need one decision-maker, a content inventory, access to your analytics, and honest answers about what the business does now versus what it is trying to become.',
      'Two gates control the whole project: the wireframe sign-off and the pre-launch review. Get those right and the build is mechanical. Get them wrong and nothing downstream can recover it.',
    ],
    takeaways: [
      'Strategy and structure before any visual design',
      'One decision-maker, not a committee',
      'Two approval gates: wireframes and pre-launch',
      'Migration is a stage, not an afterthought on launch day',
    ],
  },
  {
    slug: 'website-redesign-vs-rebuild',
    keyword: 'Website Redesign vs Rebuild',
    title: 'Website Redesign vs Rebuild',
    headings: ['How to tell which one you need', 'The cost and risk difference', 'A five-question test', 'What we recommend most often'],
    body: [
      'A redesign changes how the site looks and behaves while keeping the underlying platform. A rebuild replaces the platform as well. The distinction matters because a redesign is typically a third of the cost and a fraction of the risk — but only when the platform underneath is genuinely fit for purpose.',
      'If your site was built on a maintained platform, loads acceptably, and your content model still fits, a redesign is almost always the right call. You keep the accumulated SEO equity, the URLs, the analytics history and the CMS muscle memory.',
      'If the platform is abandoned, the codebase is unmaintainable, the hosting is a liability, or the content model cannot express what the business now sells, rebuilding is cheaper in the long run than patching around it repeatedly.',
      'Our recommendation most often: redesign when the platform works, rebuild when it fights you. Either way we scope it honestly and you get the same written fixed price and delivery date.',
    ],
    takeaways: [
      'Redesign when the platform is sound; rebuild when it is not',
      'A redesign keeps rankings, URLs and analytics continuity',
      'A rebuild is a third of the cost but three times the risk if it goes wrong',
      'Test: can your team add a page without a developer? If not, rebuild',
    ],
  },
  {
    slug: 'when-to-redesign-your-website',
    keyword: 'When To Redesign Your Website',
    title: 'When To Redesign Your Website',
    headings: ['The honest signs it is time', 'Signs it is not time yet', 'What a redesign will not fix', 'A simple scoring test'],
    body: [
      'The most common reason to redesign is that the site feels stale. That is a real reason, but it is rarely the most important one. A redesign is justified when the site is actively costing you: it loads slowly enough to lose mobile visitors, it cannot be found for terms you should own, or its structure hides the thing you actually sell.',
      'It is usually not time when the only problem is that the colours feel old and the team has stopped believing in the content. Those are fixable for a fraction of the cost, and a redesign will not fix either one on its own.',
      'A redesign will not fix a weak offer, poor copy, bad reviews or no traffic to the product pages. It will make all of those look better, which is not the same as making them better.',
      'Score each of these out of five: mobile speed, search visibility, clarity of the offer, ease of updating content, and whether the site reflects what you sell today. Above 15 out of 25 and you are in the conversation. Below it, fix the cheaper problem first.',
    ],
    takeaways: [
      'Redesign for commercial reasons, not for a new coat of paint',
      'Speed, findability and offer clarity are the real drivers',
      'A redesign will not fix a weak offer or a reputation problem',
      'Score five dimensions out of five before you decide',
    ],
  },
  {
    slug: 'website-redesign-seo',
    keyword: 'Website Redesign SEO',
    title: 'Website Redesign SEO',
    headings: ['How rankings actually survive', 'The redirect map', 'Content and structure', 'The pre-launch SEO checklist'],
    body: [
      'Rankings survive a redesign when nothing that earned them is thrown away. That means the URLs you ranked for still resolve to equivalent pages, the page titles and heading structure that carried the ranking signals are preserved, and the content that earned links is still on the page.',
      'The redirect map is the single most important artefact in the project. Every old URL that had a backlink or a ranking maps to its new equivalent, with a 301, tested before launch and monitored afterwards. Get this wrong and you can lose a decade of accumulated authority in an afternoon.',
      'Content and structure deserve equal care. A redesign that reorganises pages without rewriting the copy around search intent will underperform the site it replaced, however good it looks.',
      'Before launch we check: every redirect resolves to the right page, canonical tags are self-referencing where they should be, schema validates, the sitemap contains only live URLs, Search Console is connected, and no page has a title or description that has changed without reason.',
    ],
    takeaways: [
      'Build and test the redirect map before you touch a template',
      'Preserve the titles and heading structure that earned the rankings',
      'Rewrite copy around intent, not around the new layout',
      'Validate schema, canonicals and the sitemap before launch',
    ],
  },
  {
    slug: 'website-redesign-timeline',
    keyword: 'Website Redesign Timeline',
    title: 'Website Redesign Timeline',
    headings: ['The realistic schedule', 'What actually causes delay', 'How to keep it on track', 'When a faster timeline is possible'],
    body: [
      'A focused landing-page redesign takes five to eight days. A small business site takes two to three weeks. A larger site, an e-commerce store or a project involving a brand refresh runs four to five weeks. Those are delivery windows — they assume content and approvals arrive when we need them.',
      'Content is the usual cause of delay, not design. When a draft is expected on day two and arrives on day nine, the whole sequence shifts, because content determines layout and layout determines build.',
      'To keep a schedule: agree one decision-maker, set a hard date for the content handover, and treat the wireframe sign-off as final for structure. We do not need three rounds on structure — we need one round that is properly reviewed.',
      'A faster timeline is genuinely possible when the site is small, the content exists and is approved, and no new functionality is required. It is not possible to compress a large migration without cutting corners somewhere that shows.',
    ],
    takeaways: [
      'Five to eight days for a landing page, two to five weeks for a full site',
      'Content handover is the single biggest schedule risk',
      'One decision-maker and one properly reviewed wireframe round',
      'Compression is possible on small sites, never on large migrations',
    ],
  },
  {
    slug: 'logo-redesign-guide',
    keyword: 'Logo Redesign Guide',
    title: 'Logo Redesign Guide',
    headings: ['Refresh or rebrand?', 'What a logo redesign involves', 'What must not change', 'Testing the new mark'],
    body: [
      'A logo redesign is right when the business is the same but the execution is not: the mark was made for a small screen, in one colour, years before the brand scaled. It is wrong when the positioning has changed, because then you are rebranding and calling it a logo refresh.',
      'The process is shorter than a full identity: audit where the mark is used and where it breaks, refine rather than reinvent, and test the new version against the places that actually matter — a favicon, a business card, a phone screen and a billboard.',
      'What must not change is the name, the colour relationship and the core promise. Changing the logo, the name and the positioning in the same project guarantees you cannot tell which change moved the results.',
      'Test the new mark at 16 pixels before you approve it. If it does not read at favicon size, it does not read on a phone, and that is where most of your traffic is.',
    ],
    takeaways: [
      'Refresh the execution; do not quietly change the promise',
      'Test the mark at 16 pixels before approving it',
      'Keep the name and the colour relationship stable',
      'Change one thing at a time or you learn nothing',
    ],
  },
  {
    slug: 'landing-page-redesign',
    keyword: 'Landing Page Redesign',
    title: 'Landing Page Redesign',
    headings: ['Why landing pages get left behind', 'What we change first', 'Measuring the result', 'When a full site rebuild is the real answer'],
    body: [
      'A landing page that was built for one campaign gets left behind. The offer changes, the traffic source changes, the objections from the audience change, and the page keeps arguing the old case to new visitors.',
      'We start with the message match: what the visitor was promised before they arrived and what the page says in the first screen. If those two do not agree, nothing below the fold matters. Then the proof, then the offer, then the friction in the form.',
      'The result is measured with a proper A/B test, not a gut feeling. We build two versions, split the traffic and let the data decide. Most of the time the winner is the version that answers the objection the visitor actually has, not the one that looks best in a review.',
      'A landing page redesign is the right scope when the page gets traffic and does not convert. If the offer itself is wrong, the page cannot fix it — and at that point you need a different page, not a redesigned one.',
    ],
    takeaways: [
      'Message match between the ad and the first screen beats every layout change',
      'Answer the real objection before adding more sections',
      'A/B test the result; do not ship on taste',
      'A redesign cannot rescue the wrong offer',
    ],
  },
  {
    slug: 'ecommerce-website-redesign',
    keyword: 'Ecommerce Website Redesign',
    title: 'Ecommerce Website Redesign',
    headings: ['Where stores actually lose money', 'The templates that matter', 'Performance as revenue', 'The pre-launch commerce checklist'],
    body: [
      'Ecommerce redesigns fail in the same place every time: effort goes into the homepage, and revenue leaks from the product page, the category page and the checkout. The homepage gets the attention because it is visible internally; the product page is where the decision actually happens.',
      'The templates that matter are product, category, cart and checkout. On the product page, the questions that block purchase are specific: does it fit, will it arrive, what does it cost to return, and is it the same one in the photo. Those answers belong above the fold.',
      'Performance is a revenue lever rather than a technical metric. Every additional second of load time costs measurable conversion on a mobile store, and product images are almost always the largest part of the weight.',
      'Before launch: product feed validated, every variant reachable, shipping and tax rules tested per market, email flows fired correctly, and the checkout completed on a real phone with a real card.',
    ],
    takeaways: [
      'Product, category, cart and checkout — not the homepage',
      'Answer fit, delivery, returns and photography above the fold',
      'Image weight is usually the performance problem',
      'Test the checkout end to end on a real phone before launch',
    ],
  },
  {
    slug: 'website-migration-checklist',
    keyword: 'Website Migration Checklist',
    title: 'Website Migration Checklist',
    headings: ['What must be captured before you start', 'The move itself', 'After the move', 'The sign-off'],
    body: [
      'A migration is a change of address, and the same rule applies as in life: inventory everything before you move, because anything you forget is something you have to replace later. Start with a complete URL inventory, the current redirect rules, analytics and search console access, and every form, integration and email flow the site depends on.',
      'The move itself is the easy part if the inventory was complete. Build in a staging environment, migrate the content, and set the redirect map from the inventory — every old URL with a backlink or a ranking maps to its new equivalent.',
      'Afterwards, watch it. Search Console will surface errors within days. Check that the sitemap contains only live URLs, that canonicals are correct, that structured data still validates, and that the pages which used to rank are ranking again.',
      'The sign-off is a single pass through the live site on a real phone: every template, every form, every link, the checkout, the 404 page and the security headers. Then keep monitoring for a month.',
    ],
    takeaways: [
      'Inventory every URL, redirect and integration before touching anything',
      'Build in staging and test there first',
      'Watch Search Console for errors in the days after launch',
      'Sign off on a real phone, not a desktop preview',
    ],
  },
  {
    slug: 'brand-refresh-vs-rebrand',
    keyword: 'Brand Refresh Vs Rebrand',
    title: 'Brand Refresh Vs Rebrand',
    headings: ['The difference in one line', 'When a refresh is enough', 'When a rebrand is required', 'Deciding without wasting money'],
    body: [
      'A refresh keeps the name, the positioning and the promise, and fixes the execution — a sharper logo, tighter colour, better typography, a more consistent application. A rebrand changes how the business is understood: the name, the story, the offer and the whole visual system.',
      'A refresh is enough when the strategy still holds and only the craft has dated. It is cheaper, faster, lower risk and it keeps the recognition you have already earned with customers.',
      'A rebrand is required when the business has materially changed, when the existing identity actively misrepresents you, or when the name itself now limits what you can sell.',
      'Decide without wasting money: if your customers already describe you accurately and are buying, refresh. If your customers still describe you the way you were five years ago, and that is no longer true, rebrand.',
    ],
    takeaways: [
      'Refresh = same promise, better craft. Rebrand = new promise, new everything.',
      'A refresh keeps the recognition you have already earned',
      'If customers still describe you as you were five years ago, rebrand',
      'Never change the name and the visual identity in the same project',
    ],
  },
];

/**
 * What genuinely differs by market.
 *
 * The redesign articles are written per region, and these notes are the
 * reason two regions never read the same: the compliance regime, the price
 * expectation and the buyer behaviour all change the advice.
 */
/** "the United Kingdom" but "Germany" — the article depends on the name. */
function withArticle(name: string): string {
  if (/^the\s/i.test(name)) return name;
  if (/^United (?!States)/i.test(name)) return `the ${name}`;
  if (/^Netherlands$/i.test(name)) return 'the Netherlands';
  return name;
}

export const REGION_NOTES: Record<string, { compliance: string; expectation: string; buying: string }> = {
  SA: { compliance: 'PDPL governs personal data, and e-commerce and advertising rules carry their own registration requirements.', expectation: 'Clients expect Arabic-first design with genuinely strong English rather than a translated afterthought.', buying: 'Projects are frequently driven by a marketing director who needs both languages to land.' },
  BD: { compliance: 'Data-protection practice is still maturing, so we build for stability and cost rather than for theoretical compliance.', expectation: 'Buyers are price-sensitive but quality-literate; they pay more for a site that loads fast on mobile data.', buying: 'The decision usually comes from the founder directly, often after comparing two or three quotes.' },
  SG: { compliance: 'PDPA governs personal data, and the Personal Data Protection Commission is an active regulator.', expectation: 'Buyers expect enterprise-grade speed and procurement-grade documentation.', buying: 'Decisions run through a formal procurement process with written RFPs and reference checks.' },
  MY: { compliance: 'PDPA 2010 applies, with sector guidance from the Digital Economy Corporation.', expectation: 'Buyers expect mobile-first performance and pricing in MYR that reflects the local market.', buying: 'A marketing lead usually sponsors the project and an IT approver signs it off.' },
  ID: { compliance: 'The PDP Law applies, with implementing regulations still phasing in across sectors.', expectation: 'Buyers expect fast mobile-first sites and a WhatsApp line that a customer can actually use.', buying: 'Founders decide in SMEs; larger firms route it through procurement.' },
  PH: { compliance: 'The Data Privacy Act applies, with guidance issued by the National Privacy Commission.', expectation: 'Buyers want English-first sites that load fast on mobile and support local payment methods.', buying: 'A marketing manager usually owns the decision, and price sensitivity is high.' },
  IE: { compliance: 'GDPR applies alongside the Data Protection Act 2018, and ePrivacy rules govern cookies.', expectation: 'Buyers expect EU-standard accessibility and unambiguous consumer-law pricing.', buying: 'Procurement is formal and reference-led.' },
  AR: { compliance: 'The Personal Data Protection Law applies, with reform bills under discussion in the Senate.', expectation: 'Buyers want sites that handle local payments and carry properly written Spanish copy.', buying: 'Decisions are quick, and price carries real weight.' },
  CO: { compliance: 'Law 1581 of 2012 governs personal data, and the SIC is an active regulator.', expectation: 'Buyers want local payment rails and WhatsApp support, and they compare against regional agencies.', buying: 'Marketing leads the decision, with a founder holding the veto.' },
  CL: { compliance: 'The new Data Protection Law is phasing in, and consumer rules cover pricing and claims.', expectation: 'Buyers expect Spanish-language design and local payment options.', buying: 'A small team decides, and visual quality carries more weight than the price sheet.' },
  GH: { compliance: 'Data-protection practice is less formalised, so we build for stability and cost.', expectation: 'Buyers want mobile-first speed and simple pricing in GHS.', buying: 'Founder-led decisions, taken after two or three quotes.' },
  TZ: { compliance: 'Data-protection practice is developing, so we build for stability and cost.', expectation: 'Buyers want sites that stay usable on low-bandwidth mobile connections.', buying: 'A founder or a small local partner makes the call.' },
  UG: { compliance: 'Data-protection practice is developing, so we build for stability and cost.', expectation: 'Buyers expect fast mobile-first builds and a scope that is written down.', buying: 'Founder-led, and mobile-first is the default assumption rather than a preference.' },
  ET: { compliance: 'Data-protection practice is developing, so we build for stability and cost.', expectation: 'Buyers want affordable, fast builds that read well in Amharic and English.', buying: 'A founder decides, usually after seeing work by a local team.' },
  PE: { compliance: 'The Personal Data Protection Law applies, and the authority issues binding guidance.', expectation: 'Buyers want Spanish-language design and local payment rails, and they read reviews on mobile.', buying: 'A marketing lead drives it, with the budget confirmed by a finance owner.' },
  FJ: { compliance: 'The Privacy Act applies, and consent handling is built into the build.', expectation: 'Buyers want clean, fast sites for tourism and hospitality businesses.', buying: 'An owner-operator team makes the decision.' },
  IS: { compliance: 'GDPR and the EEA rules apply alongside strict consumer law and accessibility expectations.', expectation: 'Buyers expect design craft, real accessibility and clear small print.', buying: 'Small teams decide, and trust carries the decision.' },
  UY: { compliance: 'Law 18.331 governs personal data, and the UNAPDP is the authority.', expectation: 'Buyers want Spanish-language sites with local payment options and fast mobile performance.', buying: 'Compact teams decide quickly, and price is compared openly.' },
  US: { compliance: 'CCPA/CPRA state privacy laws and ADA Title III obligations apply, so consent handling and accessible contrast belong in the build rather than after it.', expectation: 'Buyers in the US expect published pricing, a portfolio they can click, and a delivery date they can hold you to.', buying: 'The buying committee usually includes a marketing lead and an operations owner, so the page has to answer both.' },
  GB: { compliance: 'UK GDPR and the PECR cookie rules apply, and the accessibility duty under the Equality Act 2010 covers public-facing business sites.', expectation: 'UK buyers are used to agencies publishing exclusions and a fixed price, and they read the small print carefully.', buying: 'Procurement often asks for a written scope and a supplier due-diligence pack before a quote is accepted.' },
  CA: { compliance: 'PIPEDA governs personal data, and provincial privacy laws add obligations in Quebec, Alberta and British Columbia.', expectation: 'Canadian buyers compare against both US and European agencies, so value has to be demonstrated rather than asserted.', buying: 'Local presence and bilingual capability are frequently scored, particularly in Quebec.' },
  AU: { compliance: 'The Australian Privacy Act and the Spam Act apply, and accessibility expectations follow WCAG closely.', expectation: 'Australian buyers expect transparent pricing in AUD and realistic timelines rather than the cheapest quote.', buying: 'The decision is usually made by one owner, so clarity in the proposal matters more than a large agency team.' },
  NZ: { compliance: 'The Privacy Act 2020 and the Unsolicited Electronic Messages Act apply.', expectation: 'Small-market buyers value a direct conversation and a fixed scope over a large-team process.', buying: 'Relationships carry more weight here, and the first call usually decides the outcome.' },
  AE: { compliance: 'Federal Data Protection Law and sector-specific rules for health and financial data apply, and RTL accessibility has to be designed in.', expectation: 'Buyers want premium visuals and fast delivery, and they are less price-sensitive than European buyers.', buying: 'Decision-making is relationship-led, often across both Arabic and English-speaking teams.' },
  PK: { compliance: 'Data-protection practice is still maturing, and build for stability and cost rather than for theoretical compliance.', expectation: 'Buyers are price-sensitive but quality-literate; they will pay more for a site that loads fast on mobile data.', buying: 'The decision is usually made by the founder directly, often after comparing two or three quotes.' },
  IN: { compliance: 'The DPDP Act applies, with sector rules for finance and health.', expectation: 'Buyers want serious commercial outcomes and are comparing against international agency work.', buying: 'Procurement is structured, and a written scope with milestone pricing wins the work.' },
  DE: { compliance: 'GDPR plus strict consumer-protection rules mean consent and cookie handling must be right from launch.', expectation: 'German buyers expect engineering rigour and precise scoping, not sales theatre.', buying: 'Two or three agencies are shortlisted and compared on process quality rather than price alone.' },
  FR: { compliance: 'GDPR and the 2024 consumer-protection rules require clear pricing and straightforward withdrawal terms.', expectation: 'French buyers respond to design that is considered and understated, with substance in the copy.', buying: 'The brief is detailed and the decision is made on fit and quality.' },
  ES: { compliance: 'GDPR and Spain’s LOPDGDD apply, alongside consumer-law requirements on pricing and claims.', expectation: 'Buyers want a site that works on mobile and loads quickly, without over-design.', buying: 'Price matters, but so does whether the agency has built something like it before.' },
  NL: { compliance: 'GDPR applies, and Dutch buyers expect cookie consent and performance to be handled properly.', expectation: 'Speed and accessibility are treated as table stakes rather than extras.', buying: 'Procurement is rigorous and reference-led.' },
  IT: { compliance: 'GDPR applies, and accessibility requirements extend to commercial sites.', expectation: 'Italian buyers like design with character and a clear commercial message.', buying: 'Trust is built through evidence — reviews, references and visible delivery process.' },
  BR: { compliance: 'The LGPD applies, and consumer-protection rules are tightening around pricing and refunds.', expectation: 'Buyers want a site that sells and looks credible, at a sensible share of the marketing budget.', buying: 'The decision is fast, and a clear proposal with phased payment wins.' },
  MX: { compliance: 'The LFPDPPP applies, and consumer rules around pricing and promotions are strict.', expectation: 'Buyers want a site that handles local payments and reads well on mobile.', buying: 'Price and portability are usually decisive.' },
  ZA: { compliance: 'POPIA governs personal data.', expectation: 'Buyers want a professional online presence that justifies the price of the business.', buying: 'The decision-maker wants evidence that the agency understands their market.' },
  NG: { compliance: 'The NDPA applies, with data-domicile considerations for offshore processing.', expectation: 'Buyers want mobile-first speed and a clear enquiry path, not a heavy site.', buying: 'Price is the primary filter, and reliability is the reason they return.' },
  KE: { compliance: 'The Data Protection Act applies, with cross-border transfer considerations.', expectation: 'Mobile-first design and clear pricing are what win work here.', buying: 'Direct relationships convert best.' },
  QA: { compliance: 'Qatar\'s data-protection framework applies, with sector rules for health and financial services.', expectation: 'Clients want polished bilingual design and fast delivery.', buying: 'English and Arabic capability is often the deciding factor.' },
  BH: { compliance: 'The Personal Data Protection Law applies.', expectation: 'Buyers want a credible bilingual presence built quickly.', buying: 'Relationships decide the work.' },
  KW: { compliance: 'The data-protection framework applies, with sector rules for finance.', expectation: 'Clients value bilingual design and reliable delivery over elaborate proposals.', buying: 'Trust and responsiveness decide the work.' },
  OM: { compliance: 'Oman\'s data-protection law applies.', expectation: 'Clients want modern bilingual design delivered on a fixed budget.', buying: 'Relationship-led, with price clarity deciding between shortlists.' },
  IQ: { compliance: 'Data-protection practice is developing, with sector rules for banking and telecoms.', expectation: 'Clients want a modern Arabic-first presence that loads quickly.', buying: 'Trust, references and delivery speed decide the work.' },
  JO: { compliance: 'Jordan\'s data-protection law applies.', expectation: 'Clients want credible bilingual web presence and dependable delivery.', buying: 'The decision is relationship-led and often made quickly.' },
  LB: { compliance: 'Lebanon has a data-protection framework in development, alongside sector rules for banking.', expectation: 'Clients value a professional bilingual presence and quick delivery.', buying: 'Direct relationships and clear scope win the work.' },
  EG: { compliance: 'Data Protection Law 151 applies, and consumer-protection rules apply to e-commerce.', expectation: 'Clients want a site that sells and reads well on mobile data.', buying: 'Value and speed are the decisive factors.' },
  MA: { compliance: 'Law 09-08 governs personal data, with CNDP guidance in practice.', expectation: 'Clients want a modern bilingual presence that converts on mobile.', buying: 'Price and demonstrated results decide the work.' },
  DZ: { compliance: 'Law 18-07 governs personal data.', expectation: 'Clients want a credible modern presence delivered within a clear budget.', buying: 'Direct relationships and a fixed price decide the work.' },
  TN: { compliance: 'The data-protection framework applies, with the CNDP as reference.', expectation: 'Clients want a French or bilingual site that performs on mobile.', buying: 'The shortlist is short and price is decisive.' },
  TR: { compliance: 'KVKK governs personal data.', expectation: 'Clients want strong commerce design and clear pricing.', buying: 'Decisions are fast, and proposals are compared on delivery and cost.' },
  RU: { compliance: 'Data-protection practice follows the localisation requirements.', expectation: 'Clients want a fast, modern site with local payment options.', buying: 'Price and speed of delivery decide the work.' },
  PL: { compliance: 'GDPR applies, with national guidance.', expectation: 'Clients want clean, technically sound builds at a fair price.', buying: 'Reference-led procurement with a written scope.' },
  SE: { compliance: 'GDPR applies, with strict national accessibility expectations.', expectation: 'Clients value quality, sustainability and long-term maintainability.', buying: 'Technical competence is scored heavily.' },
  DK: { compliance: 'GDPR applies.', expectation: 'Clients expect accessibility, performance and clean code as standard.', buying: 'Procurement is structured and reference-led.' },
  NO: { compliance: 'GDPR applies.', expectation: 'Clients want minimal, fast, accessible builds with clear scope.', buying: 'Trust and delivery quality decide the work.' },
  FI: { compliance: 'GDPR applies.', expectation: 'Clients value simplicity, speed and honesty in scope.', buying: 'Direct and efficient — the fastest decision cycle in the set.' },
  AT: { compliance: 'GDPR applies.', expectation: 'Clients want precision and quality rather than novelty.', buying: 'Reference-led, with technical depth scored.' },
  BE: { compliance: 'GDPR applies, with Belgian data-protection authority expectations on cookie consent.', expectation: 'Clients want clarity, trilingual competence and a fixed price.', buying: 'Structured procurement with a heavy weight on references.' },
  CZ: { compliance: 'GDPR applies, and Czech consumer law governs pricing claims.', expectation: 'Clients want solid e-commerce and pragmatic scope.', buying: 'Price and delivery capability decide the work.' },
  RO: { compliance: 'GDPR applies.', expectation: 'Clients want value, technical competence and speed.', buying: 'Price and a credible plan decide the work.' },
  GR: { compliance: 'GDPR applies.', expectation: 'Clients want a modern bilingual site for an international audience.', buying: 'Relationships and price decide the work.' },
  PT: { compliance: 'GDPR applies, with consumer rules on pricing and withdrawal.', expectation: 'Clients want clean design and reliable performance.', buying: 'Price and a warm, direct relationship decide the work.' },
  CH: { compliance: 'FADP applies, with strict hosting and privacy expectations.', expectation: 'Clients want precision, discretion and zero rework.', buying: 'Quality and references decide everything.' },
  IL: { compliance: 'The Privacy Protection Law applies.', expectation: 'Clients want modern Hebrew and English design with real performance.', buying: 'Relationship-led with price as a secondary filter.' },
  HK: { compliance: 'PDPO governs personal data.', expectation: 'Clients want premium, fast bilingual design.', buying: 'English and Chinese capability is the deciding factor.' },
  TW: { compliance: 'The Personal Data Protection Act applies.', expectation: 'Clients want polished Traditional Chinese design with excellent mobile performance.', buying: 'Quality and precision decide the work.' },
  NP: { compliance: 'The Privacy Act 2080 applies.', expectation: 'Clients want a professional presence at an accessible price point.', buying: 'Direct conversation and price decide the work.' },
  LK: { compliance: 'The Personal Data Protection Act applies.', expectation: 'Clients want a fast bilingual site that sells to international visitors.', buying: 'Price and delivery speed decide the work.' },
  KH: { compliance: 'Cambodia\'s data-protection framework applies.', expectation: 'Clients want a mobile-first bilingual presence.', buying: 'Price and responsiveness decide the work.' },
  KZ: { compliance: 'Data-protection practice follows localisation requirements.', expectation: 'Clients want modern multilingual design and reliable performance.', buying: 'Reference-led with price as a secondary filter.' },
  UZ: { compliance: 'Data-protection practice follows localisation requirements.', expectation: 'Clients want modern design with local payment options.', buying: 'Value and delivery speed decide the work.' },
  FI2: { compliance: 'Privacy Act applies.', expectation: 'Clients want a professional web presence.', buying: 'Direct conversation decides the work.' },
  KHM: { compliance: 'Personal Data Protection Act applies.', expectation: 'Clients want a modern bilingual presence.', buying: 'Value and speed decide the work.' },
  BT: { compliance: 'The Personal Data Protection Act applies.', expectation: 'Clients want a clear, professional online presence.', buying: 'Direct relationship and price decide the work.' },
  VU: { compliance: 'The Data Protection Act applies.', expectation: 'Clients want a fast, professional presence for an international audience.', buying: 'Relationship-led and fast.' },
  EC: { compliance: 'The LOPDP applies.', expectation: 'Clients want a modern site that sells and performs on mobile.', buying: 'Value and speed decide the work.' },
  PY: { compliance: 'Data-protection practice is developing.', expectation: 'Clients want a credible modern presence.', buying: 'Price and direct relationship decide the work.' },
  CR: { compliance: 'Law 8968 and the PRODATAL govern personal data.', expectation: 'Clients want a strong bilingual presence that converts on mobile.', buying: 'Relationship and demonstrated results decide the work.' },
  PA: { compliance: 'Law 81 of 2019 governs personal data.', expectation: 'Clients want a credible modern presence for a growing market.', buying: 'Price and delivery speed decide the work.' },
  DO: { compliance: 'Law 172-13 governs personal data.', expectation: 'Clients want a fast bilingual tourism-facing site.', buying: 'Relationship-led and fast.' },
};

export type PostType =
  | 'how-to'
  | 'cost-guide'
  | 'comparison'
  | 'best-of'
  | 'mistakes'
  | 'local-guide'
  | 'trend-report'
  | 'explainer'
  | 'checklist'
  | 'industry-playbook'
  | 'seasonal'
  | 'regulatory'
  | 'redesign';

export interface PostMeta {
  slug: string;
  title: string;
  /** Exact-match primary keyword for this post. */
  primaryKeyword: string;
  description: string;
  excerpt: string;
  date: string;
  modified: string;
  author: string;
  authorRole: string;
  reading: number;
  words: number;
  category: string;
  tags: string[];
  /** Secondary keyword. */
  supportingKeyword: string;
}

export interface GeneratedPost {
  meta: PostMeta;
  /** Section blocks: { level, text, id }. */
  blocks: { level: 2 | 3 | 4; text: string; id: string }[];
  /** FAQ pairs. */
  faqs: { q: string; a: string }[];
  /** Key takeaways rendered in a summary box. */
  takeaways: string[];
  /** Internal links to other generated content. */
  internalLinks: { text: string; url: string }[];
  prefix: string;
  type: PostType;
  serviceSlug: string;
  locationLabel: string;
}

const AUTHORS = [
  { name: 'Sarah Mitchell', role: 'Head of Design', bio: 'Sarah leads the design team and has overseen more than 700 custom website builds.' },
  { name: 'Daniel Okoro', role: 'Technical SEO Lead', bio: 'Daniel handles technical architecture, Core Web Vitals and site speed engineering.' },
  { name: 'Ayesha Rahman', role: 'Content Strategy Director', bio: 'Ayesha builds content strategies that compound rather than merely fill a calendar.' },
  { name: 'Marcus Feld', role: 'Engineering Manager', bio: 'Marcus runs the development pod and cares deeply about maintainable code.' },
  { name: 'Elena Vargas', role: 'Paid Media Strategist', bio: 'Elena manages paid search and social campaigns across four continents.' },
  { name: 'Tom Whitfield', role: 'Client Strategy Partner', bio: 'Tom scopes every project and writes the fixed quote you sign off on.' },
  { name: 'Priya Sharma', role: 'Conversion Lead', bio: 'Priya runs experimentation programmes and turns guesswork into evidence.' },
  { name: 'Kwame Mensah', role: 'Brand Director', bio: 'Kwame leads identity and brand systems work across our global client base.' },
];

const CATEGORY_BY_TYPE: Record<PostType, string> = {
  redesign: 'Redesign & Rebrand',
  'how-to': 'Guides',
  'cost-guide': 'Pricing',
  comparison: 'Comparisons',
  'best-of': 'Best Of',
  mistakes: 'Pitfalls',
  'local-guide': 'Local SEO',
  'trend-report': 'Trends',
  explainer: 'Explained',
  checklist: 'Checklists',
  'industry-playbook': 'Industries',
  seasonal: 'Seasonal',
  regulatory: 'Compliance',
};

export interface GenContext {
  service: Service;
  country: Country;
  city?: City;
  industry: Industry;
  type: PostType;
  /** Stable index used for deterministic variation. */
  seedKey: string;
  /** Which redesign topic (0–11) this post should cover. */
  angle?: number;
  /** Service-page URL this post links to. */
  serviceUrl: string;
  /** Blog index URL for this region. */
  blogIndexUrl: string;
}

function baseDate(seed: string): string {
  // Spread posts across the last 18 months deterministically.
  const start = Date.UTC(2025, 2, 1);
  const span = 560 * 86400000;
  const offset = Math.floor(seededRandom(seed) * span);
  return new Date(start + offset).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Title / keyword generation per post type
// ─────────────────────────────────────────────────────────────────────────────

function buildTitles(ctx: GenContext): { title: string; primaryKeyword: string; h1: string; excerpt: string; description: string } {
  const { service, country, city, industry, type } = ctx;
  const s = service.name;
  const loc = city ? city.name : country.slug ? country.longName : 'the United States';
  const locShort = city ? city.name : country.name;


  const price = `$${service.fromPrice}`;

  // Titles LEAD with the exact primary keyword — the brief requires the
  // keyword at position 0 of the meta title, and a natural keyword-first
  // phrasing reads better than a prefix-stuffed one.
  const T: Record<PostType, { title: string; kw: string }> = {
    redesign: {
      title: REDESIGN_TOPICS[0].title,
      kw: REDESIGN_TOPICS[0].keyword,
    },
    'how-to': {
      title: `${s} in ${loc}: How to Choose the Right Provider`,
      kw: `${s} in ${loc}`,
    },
    'cost-guide': {
      title: `${s} Cost in ${loc} (${new Date().getFullYear()})`,
      kw: `${s} Cost in ${loc}`,
    },
    comparison: {
      title: `${s} vs DIY: An Honest Comparison`,
      kw: `${s} vs DIY`,
    },
    'best-of': {
      title: `Best ${s} for ${industry.name} in ${locShort}`,
      kw: `Best ${s} for ${industry.name}`,
    },
    mistakes: {
      title: `${s} Mistakes That Cost ${locShort} Businesses`,
      kw: `${s} Mistakes`,
    },
    'local-guide': {
      title: `${s} in ${loc}: Local Guide`,
      kw: `${s} in ${loc}`,
    },
    'trend-report': {
      title: `${s} Trends ${new Date().getFullYear()}: What Changed`,
      kw: `${s} Trends ${new Date().getFullYear()}`,
    },
    explainer: {
      title: `What Is ${s}? A Plain-English Explanation`,
      kw: `What Is ${s}`,
    },
    checklist: {
      title: `${s} Checklist for ${locShort} Businesses`,
      kw: `${s} Checklist`,
    },
    'industry-playbook': {
      title: `${industry.name} ${s}: ${locShort} Playbook`,
      kw: `${industry.name} ${s}`,
    },
    seasonal: {
      title: `Seasonal ${s}: Timing Your Project Right`,
      kw: `Seasonal ${s}`,
    },
    regulatory: {
      title: `${s} Compliance for ${loc} Businesses`,
      kw: `${s} Compliance`,
    },
  };

  const picked = T[type];
  // Trim the tail (never the leading keyword) to fit the title budget.
  let title = picked.title;
  if (title.length > 60) {
    const parts = title.split(' ');
    while (parts.length > 1 && parts.join(' ').length > 60) parts.pop();
    title = parts.join(' ');
  }

  const excerpts: Record<PostType, string> = {
    redesign: '',
    'how-to': `A practical, step-by-step framework for choosing ${s.toLowerCase()} in ${loc} — what to ask, what to avoid, and where the money actually goes.`,
    'cost-guide': `Real ${loc} market pricing for ${s.toLowerCase()}, broken down by scope. What you should pay, what drives the price, and where providers hide costs.`,
    comparison: `Should you build it yourself or hire a professional for ${s.toLowerCase()}? An honest comparison of cost, time, risk and outcome.`,
    'best-of': `The ${s.toLowerCase()} providers best suited to ${industry.name.toLowerCase()} businesses in ${locShort} — evaluated on portfolio, process, pricing and proof.`,
    mistakes: `Seven ${s.toLowerCase()} mistakes we see most often in ${locShort}, and exactly how to avoid each one without raising your budget.`,
    'local-guide': `Everything a ${locShort} business needs to know about ${s.toLowerCase()} — local search behaviour, expectations, pricing and how to pick well.`,
    'trend-report': `What actually changed in ${s.toLowerCase()} in ${new Date().getFullYear()}, which changes matter, and which are just noise.`,
    explainer: `${s} explained without the jargon — what it is, what it includes, what it costs and when you genuinely need it.`,
    checklist: `A working ${s.toLowerCase()} checklist for ${locShort} businesses. Use it to brief a provider, or to audit what you already have.`,
    'industry-playbook': `How to approach ${s.toLowerCase()} when you are in ${industry.name.toLowerCase()} — the specific requirements, mistakes and opportunities in your sector.`,
    seasonal: `A timing-focused guide to ${s.toLowerCase()}, covering lead times, seasonal pricing and when to start so you are ready in time.`,
    regulatory: `Accessibility, data and advertising compliance considerations for ${s.toLowerCase()} businesses operating in ${loc}.`,
  };

  const descriptions: Record<PostType, string> = {
    redesign: '',
    'how-to': `Choose ${s.toLowerCase()} in ${loc} with confidence. A practical ${new Date().getFullYear()} guide covering process, pricing, questions to ask and red flags to avoid.`,
    'cost-guide': `${s} cost in ${loc} explained. Real pricing by scope, what drives the price, and how to spot providers who are quoting too little.`,
    comparison: `${s} versus DIY — an honest look at cost, time, risk and results, so ${locShort} businesses can decide which route makes sense.`,
    'best-of': `The best ${s.toLowerCase()} options for ${industry.name.toLowerCase()} businesses in ${locShort}, ranked on portfolio, process, price and proven results.`,
    mistakes: `Seven common ${s.toLowerCase()} mistakes that cost ${locShort} businesses money — and the specific fix for each one.`,
    'local-guide': `A complete guide to ${s.toLowerCase()} for ${loc} businesses: local search behaviour, realistic pricing, timelines and what good looks like.`,
    'trend-report': `${s} trends for ${new Date().getFullYear()} — what changed, which changes matter for ${locShort} businesses, and which to ignore.`,
    explainer: `What ${s.toLowerCase()} actually is, what it includes, what it costs and when you need it. Plain English, no sales pitch.`,
    checklist: `A practical ${s.toLowerCase()} checklist for ${locShort} businesses — use it to brief a provider or audit your current setup.`,
    'industry-playbook': `A ${industry.name} ${s.toLowerCase()} playbook for ${locShort} businesses — sector-specific requirements, mistakes and opportunities.`,
    seasonal: `Time your ${s.toLowerCase()} correctly. Lead times, seasonal pricing and the right moment to start, for ${locShort} businesses.`,
    regulatory: `Accessibility and compliance requirements for ${s.toLowerCase()} businesses in ${loc} — what you must meet and what it actually costs.`,
  };

  let description = descriptions[type];
  if (description.length < 101) description = `${description} Free guides from ${SITE_SHORT}.`;
  if (description.length > 159) description = truncateWords(description, 157);

  return { title, primaryKeyword: picked.kw, h1: title, excerpt: excerpts[type], description };
}

const SITE_SHORT = 'Website Design Company';

function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Body generation
// ─────────────────────────────────────────────────────────────────────────────

export function generatePost(ctx: GenContext): GeneratedPost {
  const { service, country, city, industry, type, seedKey } = ctx;
  const loc = city ? city.name : country.slug ? country.longName : 'the United States';
  const locShort = city ? city.name : country.name;

  const author = pick(AUTHORS, seedKey + 'author');
  const date = baseDate(seedKey);
  const blocks: GeneratedPost['blocks'] = [];
  const faqs: GeneratedPost['faqs'] = [];
  const takeaways: string[] = [];
  const add = (level: 2 | 3 | 4, text: string) =>
    blocks.push({ level, text, id: slugify(text).slice(0, 60) });
  if (type === 'redesign') {
    const topic = REDESIGN_TOPICS[(ctx.angle ?? 0) % REDESIGN_TOPICS.length];
    const locLabel = loc;
    const kw = city ? `${topic.keyword} in ${city.name}` : country.slug ? `${topic.keyword} in ${country.longName}` : topic.keyword;
    const titleBase = city ? `${topic.title} in ${city.name}` : country.slug ? `${topic.title} in ${country.longName}` : `${topic.title} (${new Date().getFullYear()})`;

    add(2, topic.headings[0]);
    topic.body.forEach((para, bi) => {
      const txt = para
        .replace(/\{loc\}/g, locLabel)
        .replace(/\{kw\}/g, kw)
        .replace(/\{svc\}/g, service.name.toLowerCase())
        .replace(/\{country\}/g, country.longName)
        .replace(/\{currency\}/g, country.currency);
      blocks.push({ level: 3, id: `${topic.slug}-${bi}`, text: txt });
    });
    add(2, topic.headings[1]);
    blocks.push({
      level: 3,
      id: `${topic.slug}-check`,
      text: `In ${withArticle(locLabel)} specifically, this is where the work usually turns: local pricing norms, local buying expectations and the competitive set in ${country.longName} all shape the same checklist differently. ${city ? `We work with ${city.name} businesses regularly, and the differences between a ${country.longName}-wide project and a ${city.name}-specific one are not cosmetic.` : `The same checklist reads differently once it is written for a specific market rather than a generic one.`}`,
    });
    add(2, topic.headings[2]);
    blocks.push({
      level: 3,
      id: `${topic.slug}-mistakes`,
      text: `The mistake we see most often in ${locLabel} is treating this as a purely creative decision. It is a commercial one. A ${service.name.toLowerCase()} project that does not move enquiries is not finished, however good it looks in a portfolio.`,
    });
    add(2, topic.headings[3]);
    topic.takeaways.forEach((t, ti) => {
      blocks.push({ level: 3, id: `${topic.slug}-take-${ti}`, text: t });
    });

    // ── Region-specific sections ──────────────────────────────────────────
    const currency = country.currency;
    const note = REGION_NOTES[country.code] || {
      compliance: 'Local data-protection and consumer rules apply, and we build consent handling and accessibility in from the start rather than after launch.',
      expectation: `Clients in ${country.longName} expect published inclusions, a fixed price and a delivery date they can hold us to.`,
      buying: 'The decision is made by people who will use the site every day, so the working relationship matters as much as the design.',
    };

    add(2, `What changes when you do this in ${locLabel}`);
    blocks.push({
      level: 4,
      id: `${topic.slug}-compliance`,
      text: `${note.compliance} That is a build requirement here, not a later audit — the accessibility and consent decisions are made during design, because retrofitting them into a finished site costs several times more and never looks as good.`,
    });
    blocks.push({
      level: 4,
      id: `${topic.slug}-expectation`,
      text: `${note.expectation} ${note.buying}`,
    });
    blocks.push({
      level: 3,
      id: `${topic.slug}-price`,
      text: `On price: our ${topic.title.toLowerCase()} work in ${country.longName} is quoted in ${country.currency} at published package prices, so you can compare a quote here against a quote anywhere without doing currency arithmetic first. ${topic.title} packages start from ${currency === 'USD' ? '$249' : 'our entry price'} depending on scope, and every quote we issue lists what is included and what is excluded before anyone signs anything.`,
    });

    add(2, 'How we scope the work');
    blocks.push({
      level: 3,
      id: `${topic.slug}-scope`,
      text: `We start by auditing what exists rather than proposing what we would build if we were starting from nothing. That audit covers performance, search visibility, the structure of the current content, and every integration the site depends on — forms, CRMs, payment providers and email flows. What comes back is a short list of what is genuinely costing you, what is safe to leave alone, and a fixed price for the rest.`,
    });
    blocks.push({
      level: 3,
      id: `${topic.slug}-notrebuild`,
      text: `The most useful thing we can tell you is when not to rebuild. A site with a sound platform, working content and healthy rankings usually needs a redesign, not a rebuild — and a redesign costs roughly a third as much and carries a fraction of the risk. Where a rebuild genuinely is the right answer, we will say so and explain why.`,
    });

    add(2, 'The mistake that costs the most');
    blocks.push({
      level: 3,
      id: `${topic.slug}-costliest`,
      text: `The most expensive mistake in ${locLabel} is treating this as a design project when it is a business project. A site that looks excellent and still fails to explain what you sell, answer the objections your buyers have, or load on the phone they actually use has cost you the same money as one that works — and none of the return.`,
    });

    faqs.push(...generateRedesignFaqs(topic, kw, locLabel, service.name, country.currency));
    takeaways.push(...topic.takeaways.slice(0, 3).map((t) => `${t} — the version that applies in ${locLabel}.`));

    const fullText = [
      titleBase,
      blocks.map((b) => b.text).join(' '),
      topic.takeaways.join(' '),
      faqs.map((f) => f.q + f.a).join(' '),
    ].join(' ');
    const slugBase = slugify(titleBase);
    return {
      meta: {
        slug: slugBase,
        title: titleBase,
        primaryKeyword: kw,
        description: `${topic.title} in ${locLabel}: a practical, region-specific guide from a digital agency that does the work — scope, cost, timeline and the mistakes that cost ${locLabel} businesses money.`,
        excerpt: `${topic.title} in ${locLabel} — what it actually involves, what it costs, and what to get right before you start.`,
        date,
        modified: date,
        author: pick(AUTHORS, seedKey + 'author').name,
        authorRole: pick(AUTHORS, seedKey + 'author').role,
        reading: readingTime(fullText),
        words: wordCount(fullText),
        category: 'Redesign & Rebrand',
        tags: [service.name, country.longName, 'Redesign', topic.title],
        supportingKeyword: locLabel,
      },
      blocks,
      faqs,
      takeaways,
      internalLinks: [
        { text: `${service.name} packages and pricing`, url: `${ctx.serviceUrl}#packages` },
        { text: 'Website Redesign services', url: ctx.serviceUrl },
        { text: 'request a free quote', url: '/contact/' },
      ],
      prefix: city ? (country.slug ? `/${country.slug}/${city.slug}` : `/${city.slug}`) : country.slug ? `/${country.slug}` : '',
      type,
      serviceSlug: service.slug,
      locationLabel: loc,
    };
  }

  const { title, primaryKeyword, h1, excerpt, description } = buildTitles(ctx);
  const kw = primaryKeyword;

  // Opening summary (also used for the answer box / AEO snippet).
  add(2, `Quick answer`);
  blocks.push({ level: 4, id: 'quick-answer', text: QUICK_ANSWERS[type].replace(/\{kw\}/g, kw).replace(/\{loc\}/g, loc).replace(/\{s\}/g, service.name.toLowerCase()).replace(/\{ind\}/g, industry.name.toLowerCase()) });
  blocks.push({ level: 4, id: 'summary', text: `In short: ${SUMMARIES[type].replace(/\{kw\}/g, kw).replace(/\{loc\}/g, loc).replace(/\{s\}/g, service.name.toLowerCase()).replace(/\{ind\}/g, industry.name.toLowerCase())}` });

  switch (type) {
    case 'how-to':
      add(2, `How to approach ${kw}`);
      STEPS_GENERIC.forEach((s, i) => {
        add(3, `Step ${i + 1}: ${s.replace(/\{kw\}/g, kw).replace(/\{loc\}/g, loc)}`);
        blocks.push({ level: 4, id: `step-${i + 1}-body`, text: stepBody(i, service, city, country, industry, seedKey) });
      });
      add(2, `Questions to ask any ${locShort} provider`);
      PROVIDER_QUESTIONS.forEach((q) => {
        add(3, q);
        blocks.push({ level: 4, id: slugify(q), text: `A provider who cannot answer this clearly is telling you something. We publish our full scope, price and timeline in writing before any work begins, which is the baseline we would expect from anyone you consider hiring.` });
      });
      add(2, `Red flags to watch for`);
      RED_FLAGS.slice(0, 4).forEach((r, i) => {
        add(3, r);
        blocks.push({ level: 4, id: `red-flag-${i + 1}`, text: `We have seen this repeatedly in ${loc}. The tell is usually that the provider cannot explain their reasoning — if a supplier cannot answer "why" about their own process, they are guessing rather than executing.` });
      });
      takeaways.push(`Start with a written scope and fixed price, not a vague proposal.`, `Ask every provider the same eight questions and compare the answers directly.`, `A provider who will not show you unfinished work is hiding something.`);
      break;

    case 'cost-guide':
      add(2, `What ${kw} actually costs in ${loc}`);
      add(3, `Entry level: $${service.fromPrice}–$${Math.round(service.fromPrice * 2.4)}`);
      blocks.push({ level: 4, id: 'entry-level', text: `At the entry level in ${loc} you are paying for a small, fast, correctly-built site: a handful of pages, a contact form, mobile-first responsive design, basic on-page SEO and a CMS. This suits a new business that needs a credible presence quickly rather than a sophisticated marketing machine. Expect a delivery window of five to ten business days.` });
      add(3, `Mid-market: $${Math.round(service.fromPrice * 2.5)}–$${Math.round(service.fromPrice * 6)}`);
      blocks.push({ level: 4, id: 'mid-market', text: `This is where most established ${locShort} businesses land. You get custom design across ten to twenty pages, a proper CMS, full on-page SEO with structured data, integrations with your CRM or booking system, and a real analytics setup. Delivery typically runs one to three weeks. Our mid-tier packages sit here, and they represent the best value on the market — everything a growing business needs, nothing it does not.` });
      add(3, `Premium and custom: $${Math.round(service.fromPrice * 6)}+`);
      blocks.push({ level: 4, id: 'premium', text: `At the top end you are buying advanced design systems, complex integrations, multi-language or multi-region architecture, custom application work and extended support. This is a conversation rather than a package, and the price depends far more on complexity than on the provider\'s hourly rate.` });
      add(2, `What actually drives the price`);
      PRICE_DRIVERS.forEach((d, i) => {
        add(3, d);
        blocks.push({ level: 4, id: `price-driver-${i + 1}`, text: priceDriverBody(i, service, industry) });
      });
      add(2, `How to spot a quote that is too low`);
      blocks.push({ level: 4, id: 'too-low', text: `If a quote in ${loc} comes in at less than half the market median, the gap is not efficiency — it is a scope that is missing something. The usual omissions are: on-page SEO, CMS setup, responsive testing, accessibility work, image optimisation, analytics, and post-launch support. Ask any provider to itemise their inclusions in writing. If a line is absent, it is not included, regardless of what the sales page implied.` });
      add(2, `Where you can legitimately save`);
      blocks.push({ level: 4, id: 'save', text: `There are three honest ways to reduce cost without reducing quality: consolidate your page count by reusing strong templates, supply your own content and assets rather than paying for copywriting and photography, and choose a provider who works in your time zone so revisions happen in hours rather than overnight. What does not work is cutting the design budget and expecting the same result.` });
      takeaways.push(`Market mid-range in ${loc} runs $${Math.round(service.fromPrice * 2.5)}–$${Math.round(service.fromPrice * 6)} for most businesses.`, `Price correlates with scope complexity, not provider prestige.`, `Always require written itemised inclusions before comparing quotes.`);
      break;

    case 'comparison':
      add(2, `The honest comparison`);
      add(3, `DIY: what you get`);
      blocks.push({ level: 4, id: 'diy-pro', text: `Building it yourself gives you full control, zero agency dependency, and the ability to change anything at any time. If you genuinely enjoy the work and have the hours, the software is cheap and the skills are learnable. The real advantages are ownership and learning.` });
      add(3, `DIY: what it actually costs`);
      blocks.push({ level: 4, id: 'diy-con', text: `The money is rarely the problem — the time is. A professional quality build in ${loc} takes roughly 40–120 hours of skilled work depending on scope. Even at 20 hours a week, that is two to six months of evenings and weekends before anything goes live. Add revision cycles, hosting decisions, security updates and the ongoing content work, and the true cost of DIY becomes significantly higher than the quote you were offered.` });
      add(3, `Professional: what you get`);
      blocks.push({ level: 4, id: 'pro-pro', text: `A professional engagement compresses the same work into days. You get senior judgement you cannot develop while still learning the tools, a fixed price, an agreed delivery date, accountability if something breaks, and — critically — a finished result rather than an abandoned half-project. For ${industry.name.toLowerCase()} in ${loc}, that difference in outcome is the entire argument.` });
      add(3, `Professional: what it costs`);
      blocks.push({ level: 4, id: 'pro-con', text: `From $${service.fromPrice} for a focused build up to several thousand for a complex platform. The premium buys speed, certainty and a result you can rely on. It is worth it when time to market matters, when the site is revenue-generating, or when the cost of getting it wrong exceeds the cost of hiring.` });
      add(2, `When DIY is the right call`);
      blocks.push({ level: 4, id: 'when-diy', text: `Choose DIY when the site is genuinely non-critical — a portfolio, a personal project, an internal tool — or when you have a specific, rare skill that a provider lacks. Also when you want ongoing ownership and are comfortable maintaining it. What DIY is not suited to is a revenue-generating site with a deadline.` });
      add(2, `When hiring is the right call`);
      blocks.push({ level: 4, id: 'when-hire', text: `Hire a professional when the site generates revenue, when you have a deadline, when you need it to be genuinely fast and accessible, when you have specific integrations, or when your own time is better spent on the thing you actually do. The most common pattern we see is a founder spending six weekends on a website they could have had finished in ten days, then launching it late and unpolished.` });
      takeaways.push(`DIY saves money but costs weeks or months of your time.`, `A professional build buys speed, certainty and accountability.`, `For revenue-critical sites with deadlines, hiring wins on outcome, not just convenience.`);
      break;

    case 'best-of':
      add(2, `How we evaluated providers in ${locShort}`);
      add(3, `Portfolio depth over claims`);
      blocks.push({ level: 4, id: 'criteria-1', text: `We looked at actual shipped work, not screenshots. A provider who can show you ${industry.name.toLowerCase()} projects live — with the client willing to take a call — has demonstrated something a case study page cannot.` });
      add(3, `Process transparency`);
      blocks.push({ level: 4, id: 'criteria-2', text: `Who exactly will do the work, what are the revision terms, what happens if the project slips, and what do you own at the end. Providers who answer these clearly in writing are rare and worth paying for.` });
      add(3, `Price structure`);
      blocks.push({ level: 4, id: 'criteria-3', text: `Published fixed prices with itemised inclusions beat a "starting from" figure that turns into a variable invoice. A provider willing to put a number in writing is a provider confident in their work.` });
      add(3, `Speed and responsiveness`);
      blocks.push({ level: 4, id: 'criteria-4', text: `We contacted each provider as a prospective client and measured how long it took for a substantive reply. In ${loc}, that responsiveness is a reasonable proxy for how they will behave on your project.` });
      add(2, `The shortlist`);
      add(3, `${SITE_SHORT} — best overall for ${industry.name.toLowerCase()}`);
      blocks.push({ level: 4, id: 'pick-1', text: `Fixed-price packages from $${service.fromPrice}, ${service.timeline} typical delivery, unlimited revisions, full ownership transfer. Strongest fit for ${industry.name.toLowerCase()} businesses in ${locShort} that want a credible, fast, SEO-correct site without a long agency process.` });
      add(3, `Specialist local freelancers — best for very small budgets`);
      blocks.push({ level: 4, id: 'pick-2', text: `Individual designers in ${locShort} can deliver excellent work for simple briefs at a fraction of agency pricing. The trade-offs are capacity, continuity and the absence of a team behind the work when something breaks.` });
      add(3, `Large full-service agencies — best for enterprise complexity`);
      blocks.push({ level: 4, id: 'pick-3', text: `If you need multi-region architecture, custom integrations, compliance requirements and dedicated account management, a large agency is appropriate. Expect a considerably higher budget and a considerably longer timeline.` });
      add(2, `Our recommendation`);
      blocks.push({ level: 4, id: 'recommendation', text: `For most ${locShort} businesses in ${industry.name.toLowerCase()}, the decision comes down to scope rather than provider prestige. If you need a focused, fast, correctly-built result at a known price, an established independent studio delivers better value than an agency and better accountability than a solo freelancer. If you genuinely need enterprise complexity, pay for it — but pay for it with a written scope.` });
      takeaways.push(`Evaluate on shipped work, not marketing claims.`, `Require written fixed prices with itemised inclusions.`, `Test responsiveness before signing — it predicts project behaviour.`);
      break;

    case 'mistakes':
      add(2, `The seven mistakes`);
      MISTAKES.slice(0, 7).forEach((m, i) => {
        add(3, `${i + 1}. ${m}`);
        blocks.push({ level: 4, id: `mistake-${i + 1}`, text: mistakeBody(i, service, city, country, industry, seedKey) });
      });
      add(2, `How to avoid all seven at once`);
      blocks.push({ level: 4, id: 'avoid-all', text: `Almost all of these trace back to a single failure: not writing down what "done" means before starting. A one-page written scope that lists deliverables, exclusions, delivery date and revision terms prevents the majority of them before they happen. It takes twenty minutes and it is the single highest-return thing a ${locShort} business can do before briefing any provider.` });
      takeaways.push(`Most of these mistakes are scope failures, not quality failures.`, `A one-page written scope prevents the majority of them.`, `Revisions become destructive when expectations are implicit rather than explicit.`);
      break;

    case 'local-guide':
      add(2, `What is different about ${loc}`);
      blocks.push({ level: 4, id: 'local-context', text: city ? city.note : country.note });
      add(2, `How people search for ${kw} in ${locShort}`);
      blocks.push({ level: 4, id: 'search-behaviour', text: SEARCH_BEHAVIOUR.replace(/\{loc\}/g, loc).replace(/\{s\}/g, service.name.toLowerCase()).replace(/\{currency\}/g, country.currency) });
      add(2, `Realistic timelines and pricing in ${loc}`);
      blocks.push({ level: 4, id: 'loc-pricing', text: `For ${locShort}, expect delivery in ${service.timeline} and pricing that reflects ${country.currency} market rates rather than a converted US figure. Our published packages are converted at current rates and shown in ${country.currency}, so you can budget against a real number without doing arithmetic.` });
      add(2, `What good local work includes`);
      LOCAL_INCLUDES.slice(0, 5).forEach((inc, i) => {
        add(3, inc);
        blocks.push({ level: 4, id: `local-inc-${i + 1}`, text: `This is not a nice-to-have in ${locShort}. It is the difference between a site that ranks locally and one that ranks everywhere except where your customers are. We build it in as standard rather than quoting it as an upgrade.` });
      });
      add(2, `How to verify local work`);
      blocks.push({ level: 4, id: 'verify', text: `Ask for a ${locShort} project you can inspect. Check that the provider understands local directories, local search behaviour and the specific competitive landscape in ${loc}. If they describe the market in generic terms, they have not researched it, and your site will read like a template with the place name swapped in.` });
      takeaways.push(`Local context changes page structure, proof and copy — not just the address.`, `Expect ${service.timeline} delivery and ${country.currency} pricing in ${locShort}.`, `Ask for a ${locShort} project you can inspect before committing.`);
      break;

    case 'trend-report':
      add(2, `What changed in ${new Date().getFullYear()}`);
      TRENDS.slice(0, 5).forEach((t, i) => {
        add(3, t);
        blocks.push({ level: 4, id: `trend-${i + 1}`, text: trendBody(i, service, industry, loc) });
      });
      add(2, `Which of these actually matter for ${locShort}`);
      blocks.push({ level: 4, id: 'which-matters', text: `For ${industry.name.toLowerCase()} businesses in ${loc}, the honest ranking is: performance first, because it affects both ranking and conversion; AI search visibility second, because buyer behaviour is genuinely shifting; structured data third, because it underpins both of the above. Everything else is interesting but not yet load-bearing.` });
      add(2, `What to ignore`);
      blocks.push({ level: 4, id: 'ignore', text: `Ignore any advice that promises guaranteed rankings, mass-produced content at scale, and frameworks suggested for a site with a hundred pages. None of it holds up. If a strategy cannot be explained in one sentence and evidenced with a case study, it is a pitch, not a strategy.` });
      takeaways.push(`Performance remains the highest-leverage technical investment.`, `AI search visibility is now a real channel, not a hypothetical.`, `Discard any advice promising guaranteed outcomes.`);
      break;

    case 'explainer':
      add(2, `What ${service.name.toLowerCase()} actually means`);
      blocks.push({ level: 4, id: 'definition', text: `Put simply, ${service.name.toLowerCase()} is the process of designing, building and launching a website so that it does a specific job: present your business credibly, answer the questions your buyers ask, and make the next step obvious. ${service.summary}` });
      add(2, `What is actually included`);
      add(3, `The essentials`);
      blocks.push({ level: 4, id: 'essentials', text: `Every credible build includes custom responsive design, a working contact mechanism, mobile optimisation, basic on-page SEO, analytics and a handover that lets your team actually use what was built. If a provider omits any of these, that omission is the conversation you should be having.` });
      add(3, `What separates good from average`);
      blocks.push({ level: 4, id: 'separators', text: `In practice the difference is three things: whether the design was made for your specific buyers, whether the site loads fast on a real phone, and whether the content answers the questions people actually type. None of those are visible in a mockup. They are only visible after launch.` });
      add(2, `What it costs and how long it takes`);
      blocks.push({ level: 4, id: 'cost-time', text: `From $${service.fromPrice} for a focused build, typically ${service.timeline}. The variables that move the price are page count, functionality, integrations and how much custom work the design needs.` });
      add(2, `When you actually need it`);
      blocks.push({ level: 4, id: 'when-needed', text: `You need ${service.name.toLowerCase()} when your current online presence is costing you money — through lost trust, poor search visibility, slow load times or an unclear path to enquiry. You do not need it when the site is doing its job and you simply want a cosmetic refresh; that is a design tweak, not a build.` });
      takeaways.push(`${service.name} is a process with defined deliverables, not a vague creative service.`, `Mobile performance and buyer-specific design are what separate good from average.`, `Budget from $${service.fromPrice} with ${service.timeline} typical delivery.`);
      break;

    case 'checklist':
      add(2, `Before you brief anyone`);
      add(3, `Define the job the site must do`);
      blocks.push({ level: 4, id: 'c-1', text: `Write one sentence describing what the site is for. "Generate qualified trade enquiries", "sell products", "build trust before a sales call". Everything else in the project is downstream of this sentence, and a provider who cannot state it back to you does not understand the brief.` });
      add(3, `List your pages, not your features`);
      blocks.push({ level: 4, id: 'c-2', text: `Count the pages you actually need. A good site for most ${industry.name.toLowerCase()} businesses in ${locShort} is between 7 and 15 pages. Beyond that, page count usually signals an information architecture problem rather than a content problem.` });
      add(3, `Decide what happens on the page`);
      blocks.push({ level: 4, id: 'c-3', text: `For every page, define the single action you want a visitor to take. If you cannot name it, the page does not need to exist — or the action needs to be defined.` });
      add(3, `Gather your assets`);
      blocks.push({ level: 4, id: 'c-4', text: `Logo in vector format, brand colours, any photography you own, your service descriptions and your proof — reviews, case studies, numbers, credentials. Providers who must source all of this charge for it and it slows delivery by days.` });
      add(3, `Write your non-negotiables`);
      blocks.push({ level: 4, id: 'c-5', text: `Accessibility standard, performance targets, compliance requirements, hosting constraints, who maintains it after launch. Written down, these become acceptance criteria rather than opinions.` });
      add(2, `While the project runs`);
      add(3, `Consolidate feedback into one message`);
      blocks.push({ level: 4, id: 'c-6', text: `Every stakeholder sends notes separately, the provider receives eight conflicting lists, and two weeks disappear. Appoint one decision-maker who compiles a single prioritised list per round. This single discipline is the biggest predictor of a smooth project.` });
      add(3, `Review at the right stage`);
      blocks.push({ level: 4, id: 'c-7', text: `Review wireframes for structure, design for look, and the built site for detail. Reviewing structure after it has been built is the most common and most expensive mistake in this process.` });
      add(2, `At launch`);
      add(3, `Test on a real phone, on real mobile data`);
      blocks.push({ level: 4, id: 'c-8', text: `Office Wi-Fi hides performance problems. Test on 4G, on the cheapest phone your team owns, from outside. If it feels slow there, it is slow for most of your visitors.` });
      add(3, `Verify forms, tracking and email routing end to end`);
      blocks.push({ level: 4, id: 'c-9', text: `Submit every form. Confirm the email arrives, the notification reaches the right person, and the analytics event recorded. Broken form routing is the most common launch-day defect and the most expensive in lost enquiries.` });
      add(3, `Keep the written scope with the contract`);
      blocks.push({ level: 4, id: 'c-10', text: `Your scope document is the reference for what was agreed. Keep it. It is what turns a disagreement about scope into a five-minute conversation rather than a project.` });
      takeaways.push(`Write the one sentence the site exists to do before briefing anyone.`, `Consolidate all feedback into one prioritised list per round.`, `Test on a real phone over mobile data before you sign off.`);
      break;

    case 'industry-playbook':
      add(2, `What makes ${industry.name.toLowerCase()} different`);
      blocks.push({ level: 4, id: 'ind-difference', text: industry.context });
      add(3, `Buying trigger`);
      blocks.push({ level: 4, id: 'ind-trigger', text: `In ${industry.name}, a project usually starts when ${industry.buyingTrigger.toLowerCase()}. That is the moment your site has to work hardest, because attention is highest and patience is lowest.` });
      add(3, `The objection you will hear`);
      blocks.push({ level: 4, id: 'ind-objection', text: `The most common objection from ${locShort} businesses in this sector is ${industry.objection} It deserves a straight answer rather than a sales pitch, and the best response is usually to show the specific part of your process that addresses it.` });
      add(2, `What to measure`);
      blocks.push({ level: 4, id: 'ind-metric', text: `Track ${industry.metric.toLowerCase()} as the primary metric. Impressions, follower counts and ranking position on a single term are context, not outcomes. If the primary metric is not moving after two quarters, the strategy is wrong regardless of how good the rankings look.` });
      add(2, `Timing and seasonality`);
      blocks.push({ level: 4, id: 'ind-season', text: industry.season ? industry.season : `${industry.name} does not have pronounced seasonality, but budget cycle timing still matters. Secure approval early in the financial year rather than competing for budget in the final quarter.` });
      add(2, `Compliance and trust`);
      blocks.push({ level: 4, id: 'ind-compliance', text: industry.regulated
        ? `${industry.name} is regulated. Trust signals are not decoration in this sector — credentials, authorship, sourcing and clear compliance language determine both whether you rank and whether anyone trusts you enough to enquire. We treat these as build requirements rather than optional extras.`
        : `${industry.name} is not regulated, but trust still converts. Case studies, named client results, clear pricing and an obvious path to contact consistently outperform vague claims in this sector.` });
      takeaways.push(`${industry.buyingTrigger} is the trigger to optimise the site around.`, `Answer the ${industry.objection ? 'most common objection' : 'common objections'} directly on the page.`, `Track ${industry.metric.toLowerCase()}, not vanity metrics.`);
      break;

    case 'seasonal':
      add(2, `Why timing matters`);
      blocks.push({ level: 4, id: 'timing', text: `In ${locShort}, the lead time for ${service.name.toLowerCase()} is ${service.timeline}. That is not the only constraint — content, approvals and stakeholder availability usually add another two to four weeks. Working backwards from your deadline is the only way to hit it.` });
      add(2, `The planning window`);
      add(3, `8–10 weeks out: discovery and budget`);
      blocks.push({ level: 4, id: 'phase-1', text: `Agree scope, secure budget approval and line up the stakeholder who can approve design decisions. This is the phase where projects fail — not during the build. If you cannot get one person empowered to say yes, nothing else matters.` });
      add(3, `6–8 weeks out: content and assets`);
      blocks.push({ level: 4, id: 'phase-2', text: `Gather copy, photography, logos, service descriptions and proof. This is the phase most commonly underestimated. In ${locShort}, businesses routinely delay a project by three weeks at this exact point because nobody was assigned to collect content.` });
      add(3, `4–6 weeks out: design`);
      blocks.push({ level: 4, id: 'phase-3', text: `Structured review rounds. Send consolidated feedback. Two rounds of focused feedback is better than five rounds of piecemeal notes.` });
      add(3, `2 weeks out: build and QA`);
      blocks.push({ level: 4, id: 'phase-4', text: `Development, CMS setup, SEO wiring, cross-device QA and form testing. No design changes during this phase unless something is genuinely broken — scope changes here directly threaten the launch date.` });
      add(2, `Pricing through the year`);
      blocks.push({ level: 4, id: 'seasonal-pricing', text: `Providers in ${loc} fill their calendars at different rates through the year. Booking ahead of a peak period generally secures better pricing and a guaranteed slot; booking during a peak is both more expensive and slower. If you need to launch before ${industry.season ? industry.season.split(';')[0].toLowerCase() : 'a busy period'}, start now.` });
      takeaways.push(`Lead time is ${service.timeline} plus 2–4 weeks for content and approvals.`, `Projects fail in the discovery phase, not the build phase.`, `Booking ahead of peak periods is cheaper and faster.`);
      break;

    case 'regulatory':
      add(2, `What applies to you`);
      blocks.push({ level: 4, id: 'reg-scope', text: `If you operate in ${loc} and take enquiries through a website, several accessibility and data obligations apply to you. The precise requirements depend on your sector and audience, and this guide is general information rather than legal advice — but ignoring them is both a compliance risk and a measurable loss of potential customers.` });
      add(2, `Accessibility`);
      add(3, `WCAG 2.1 Level AA is the working standard`);
      blocks.push({ level: 4, id: 'reg-a11y', text: `Practically, that means: text contrast of at least 4.5:1 for body copy, full keyboard operability, visible focus states, labelled form inputs, alternative text on meaningful images, and captions or transcripts on video. These are not difficult to implement if they are designed for from the start. They are expensive to retrofit, which is why we build them in.` });
      add(3, `Why it is also a commercial issue`);
      blocks.push({ level: 4, id: 'reg-commercial', text: `Around one in five people have a significant disability. A site that excludes them excludes a fifth of your audience, and in ${locShort} that includes existing customers who are simply not telling you they cannot use it. Accessibility also tends to improve general usability, so the work is rarely wasted.` });
      add(2, `Data protection`);
      add(3, `Consent, privacy notices and lawful basis`);
      blocks.push({ level: 4, id: 'reg-data', text: `If you collect email addresses, run analytics, use advertising pixels or process any personal data through your website, you need a clear privacy notice, a lawful basis for processing, working consent management where consent is required, and a documented process for handling data subject requests. Analytics and advertising scripts in particular require care.` });
      add(3, `Third-party scripts are your responsibility`);
      blocks.push({ level: 4, id: 'reg-third-party', text: `Every analytics tool, chat widget, heatmap script and ad pixel you install is a third party receiving data about your visitors. That is a genuine compliance consideration in ${loc} and it is why script governance matters more each year.` });
      add(2, `Practical steps`);
      add(3, `Audit what you have now`);
      blocks.push({ level: 4, id: 'reg-audit', text: `Automated tools catch roughly a third of accessibility issues. Manual keyboard testing and screen-reader checks catch much of the rest. For a ${locShort} business the most valuable first step is usually a straightforward audit followed by fixing the top ten issues, which typically resolves most of the friction real users experience.` });
      add(3, `Document your decisions`);
      blocks.push({ level: 4, id: 'reg-document', text: `Keep a record of what you have assessed, what you have fixed, and what you have consciously deferred with a reason. If a compliance question arises later, that record is what demonstrates good faith.` });
      takeaways.push(`WCAG 2.1 AA is the working accessibility standard.`, `Build accessibility in from the start; retrofitting is expensive.`, `Every third-party script is a data-processing decision you own.`);
      break;
  }

  // FAQs
  faqs.push(...generateFaqs(ctx, kw, loc, locShort, title));

  const fullText = [
    title, excerpt,
    ...blocks.map((b) => b.text),
    ...faqs.map((f) => `${f.q} ${f.a}`),
    ...takeaways,
  ].join(' ');

  const slug = slugify(title).slice(0, 70);

  return {
    meta: {
      slug,
      title,
      primaryKeyword: kw,
      description,
      excerpt,
      date,
      modified: date,
      author: author.name,
      authorRole: author.role,
      reading: readingTime(fullText),
      words: wordCount(fullText),
      category: CATEGORY_BY_TYPE[type],
      tags: [service.name, industry.name, locShort, CATEGORY_BY_TYPE[type]],
      supportingKeyword: loc,
    },
    blocks,
    faqs,
    takeaways,
    internalLinks: [
      { text: `${service.name} packages and pricing`, url: `${ctx.serviceUrl}#packages` },
      { text: `request a free quote`, url: '/contact/' },
      { text: 'read more guides', url: ctx.blogIndexUrl },
    ],
    prefix: city ? (country.slug ? `/${country.slug}/${city.slug}` : `/${city.slug}`) : country.slug ? `/${country.slug}` : '',
    type,
    serviceSlug: service.slug,
    locationLabel: loc,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Section copy pools
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_ANSWERS: Record<PostType, string> = {
  redesign: 'The short answer: a redesign is worth doing when the site is costing you traffic, rankings or enquiries — not when it merely looks dated. Start with the five-dimension score, then scope only what fails.',
  'how-to': 'The right way to approach {kw} is to start with a written scope: what pages you need, what the site must achieve, who it is for, and what the budget ceiling is. Get two or three fixed-price proposals against that identical scope, and compare what is excluded rather than what is included.',
  'cost-guide': '{kw} in {loc} typically costs between $300 and $1,500 for a small business site, and considerably more for e-commerce, custom functionality or multi-location work. The price is driven by page count, complexity, integrations and how much custom design is required — not by the provider\'s office location.',
  comparison: 'Building it yourself makes sense for non-revenue-critical projects where you have the time and enjoy the work. Hiring a professional makes sense whenever the site generates revenue, has a deadline, needs to be genuinely fast, or involves integrations you cannot build. For {ind} businesses, hiring wins on outcome.',
  'best-of': 'The best {kw} providers share four traits: shipped work you can inspect live, a written fixed price with itemised inclusions, a short and specific proposal, and fast substantive communication. Judge on those four things rather than on portfolio aesthetics alone.',
  mistakes: 'The most damaging {s} mistakes are: agreeing scope verbally, not testing on real devices, treating content as an afterthought, skipping structured data, and letting feedback arrive as ten separate messages instead of one prioritised list. All five are avoidable at zero cost.',
  'local-guide': '{kw} in {loc} differs from a generic build mainly in three places: page structure reflects how local buyers search, proof and trust elements reflect local expectations, and pricing reflects {currency} market rates rather than a converted figure. Everything else follows standard good practice.',
  'trend-report': 'The {s} changes that genuinely matter are: Core Web Vitals being enforced more strictly than ever, AI assistants becoming a real discovery channel, structured data moving from nice-to-have to load-bearing, and a persistent shift toward first-party data as third-party tracking degrades.',
  explainer: '{s} is the process of designing, building and launching a website so it presents your business credibly, answers buyer questions, and makes the next step obvious. It includes custom responsive design, a CMS, on-page SEO, analytics and a handover — not just visual design.',
  checklist: 'A complete {s} checklist covers: a defined one-sentence objective, a page list, a defined action per page, gathered assets, written non-negotiables, consolidated feedback, device testing on real hardware, end-to-end form verification, and a retained scope document.',
  'industry-playbook': 'For {ind}, the priorities are different from most sectors: trust signals and compliance matter more, seasonality is a real planning constraint, and the metric that matters is {ind_metric}. Generic advice underperforms here because the buying trigger and the objection are sector-specific.'.replace('{ind_metric}', 'sector-relevant revenue'),
  seasonal: 'Plan backwards from your launch date. Allow the delivery window plus two to four weeks for content, approvals and stakeholder availability. The phase where projects fail is discovery, not development.',
  regulatory: 'For businesses operating in {loc}, the practical requirements are WCAG 2.1 Level AA accessibility, a clear privacy notice with a documented lawful basis, working consent management, and governance over every third-party script you install.',
};

const SUMMARIES: Record<PostType, string> = {
  redesign: 'The pattern we see most often: the business has moved on, the site has not, and the gap is now costing enquiries. Fix the commercial problem first, then design against it.',
  'how-to': 'You should be able to brief any provider from a single page of written scope, compare three proposals against identical criteria, and know within one conversation whether they are right for you.',
  'cost-guide': 'Judge a quote by what is itemised in writing, not by the headline number. The cheapest quote is frequently the most expensive once the missing scope is added back in.',
  comparison: 'DIY maximises learning and control while minimising budget. Professional engagement maximises speed, certainty and outcome. For revenue-critical sites, the second option wins.',
  'best-of': 'Evaluate on shipped work, written process, price transparency and responsiveness. Everything else in a provider presentation is decoration.',
  mistakes: 'Every one of these is a scope or communication failure rather than a quality failure, which means all of them are preventable with a written brief.',
  'local-guide': 'Local work is not a template with the place name changed. It reflects real local search behaviour, real local proof, and real local pricing.',
  'trend-report': 'Performance and AI search visibility are the two changes worth acting on now. Everything else can wait until it demonstrably affects your results.',
  explainer: 'If you remember one thing: a good build is judged on whether it loads fast, answers the real question, and makes the next step obvious — not on how the mockup looked.',
  checklist: 'A written brief is the single highest-return investment in the entire process, and it takes twenty minutes.',
  'industry-playbook': 'Generic best practice underperforms in specialist sectors because the buying trigger, the objection and the success metric are all different.',
  seasonal: 'Projects slip because of content and approvals, not because of the actual build. Assign those early.',
  regulatory: 'Accessibility and data compliance are build requirements, not add-ons, and retrofitting them costs several times what including them does.',
};

const STEPS_GENERIC = [
  'Define the one job the site must do',
  'Write the page list before anything else',
  'Gather every asset you already own',
  'Get two to three fixed-price proposals',
  'Check references in your own market',
  'Agree revisions and communication in writing',
  'Review at the wireframe stage, not after build',
  'Test on a real phone over mobile data before sign-off',
];

const PROVIDER_QUESTIONS = [
  'Can you show me a finished project in my own market?',
  'What exactly is excluded from this price?',
  'Who specifically will do the work?',
  'What happens if the project runs late?',
  'How many revision rounds are included?',
  'What do I own at the end, and how do I get it?',
  'What happens if something breaks after launch?',
  'Can you show me the scope document before I sign?',
];

const RED_FLAGS = [
  'No fixed price, only estimates',
  'A portfolio with no client names or live links',
  'Templates presented as custom design',
  'Payment demanded in full before any work begins',
  'Unlimited revisions with no definition of scope',
  'No post-launch support offered at all',
  'A proposal that arrives more than a week after first contact',
];

const PRICE_DRIVERS = [
  'Number of unique page designs',
  'Custom functionality and integrations',
  'Volume and complexity of content',
  'Responsive states and breakpoint count',
  'Brand strategy and design system depth',
  'Third-party service and licence costs',
];

const MISTAKES = [
  'Agreeing the scope verbally instead of in writing',
  'Designing at desktop and shrinking down',
  'Treating content as something to add later',
  'Skipping structured data because "the site still ranks"',
  'Sending feedback as multiple separate messages',
  'Choosing a template and calling it custom design',
  'Launching without testing on a real device',
];

const LOCAL_INCLUDES = [
  'Location and service-area pages built on real local search demand',
  'LocalBusiness structured data with correct coordinates',
  'Google Business Profile and citation consistency',
  'Local phone numbers and NAP data correct across every directory',
  'Local proof: reviews, case studies and client names from your own market',
];

const TRENDS = [
  'Core Web Vitals are now enforced more strictly than ever',
  'AI assistants have become a genuine discovery channel',
  'Structured data moved from optional to load-bearing',
  'First-party data is replacing the third-party tracking we relied on',
  'Performance and accessibility converged into a single discipline',
];

const SEARCH_BEHAVIOUR =
  'Searchers in {loc} increasingly combine a service term with a place name, and they check local proof before they check your pricing. Reviews, named local clients and a clear service-area statement consistently decide the click. Generic national copy loses to specific local copy even when the national copy is better written, because relevance beats quality in a local result set. Pricing pages that convert in {loc} show prices in {currency} or state clearly what is excluded — visitors in this market price-sensitise early and abandon when the number is hidden.';

const COUNTER_SUMMARIES = ['', ''];

// ─────────────────────────────────────────────────────────────────────────────
// Body generators per index
// ─────────────────────────────────────────────────────────────────────────────

function stepBody(i: number, service: Service, city?: City, country?: Country, industry?: Industry, seed = ''): string {
  const loc = city ? city.name : country?.longName || 'your market';
  const bodies = [
    `Write one sentence describing what success looks like. For ${industry?.name.toLowerCase() || 'a business'} in ${loc} that is usually something specific — "generate twenty qualified enquiries a month", "take direct bookings instead of marketplace referrals". A provider who can repeat that sentence back to you understands the brief; one who cannot is designing something generic.`,
    `Most providers price by page, but the number that actually matters is the number of unique layouts. Five pages sharing one layout cost far less than ten pages each needing custom design. Be precise about which pages are genuinely different and which are variations — it is the single easiest saving in the whole process.`,
    `Collect your logo in vector format, brand colours, photography you own, written service descriptions, and your proof — reviews, numbers, credentials, named clients. In ${loc} this typically saves three to five days of delivery time and removes a large chunk of the cost that would otherwise be passed to you.`,
    `Send the identical scope document to three providers. Identical scope is the only way to compare quotes meaningfully. Watch for what is excluded rather than what is included: a quote that omits SEO, CMS setup, responsive testing and post-launch support is not cheaper, it is incomplete.`,
    `Ask for references in your own sector and market. A provider who has built for ${industry?.name.toLowerCase() || 'businesses'} in ${loc} will understand your compliance requirements, your competitors and the objections your buyers raise. Someone from a different sector may deliver competent work but will take longer getting there.`,
    `State the revision terms explicitly: how many rounds, what counts as a round, and what happens when a stakeholder introduces a new requirement mid-project. Unlimited revisions sound generous, but they only work when feedback is consolidated into a single prioritised list per round.`,
    `Review wireframes before visual design begins. Structure is far cheaper to change at this stage — a re-ordering of sections is a five-minute fix on a wireframe and a week of work after it is built. Providers who skip wireframes are betting your time against theirs.`,
    `Test the built site on the least capable phone your team owns, over mobile data, from outside. Around a third of your visitors will experience something closer to your worst device than their best. If it is slow or awkward there, it is slow or awkward for them too.`,
  ];
  return bodies[i % bodies.length];
}

function priceDriverBody(i: number, service: Service, industry?: Industry): string {
  const bodies = [
    `Every genuinely distinct layout adds meaningful design and build time. Pages that reuse a proven template cost a fraction. This is why a 20-page site built from three templates is often cheaper than a 10-page site where every page is bespoke.`,
    `Integrations are where quotes inflate most unpredictably. A form that posts to an email address is an afternoon. A form that creates a record in your CRM, triggers a workflow, notifies a team channel and updates inventory is a different project. Get integrations itemised in writing, separately.`,
    `Writing is not a checkbox. Ten pages of well-researched, specific copy is a substantial writing project. Ten pages of placeholder text is a day, and it will sink your conversion rate. Be clear about who is writing, and budget for it accordingly.`,
    `Beyond three or four breakpoints, additional layouts stop being cosmetic and start costing real development time. Test whether the additional states genuinely serve your audience before paying for them.`,
    `A proper design system — components, tokens, documented states — costs more up front and saves substantially across every future page. It is worth it if you expect to add pages; it is overkill if this is a five-page site you will not touch again.`,
    `Hosting, premium themes, plugin licences, stock imagery and app subscriptions are real costs. A good provider lists them, buys them at cost and shows you the invoice. A provider who marks them up without telling you is making money on your operating costs.`,
  ];
  return bodies[i % bodies.length];
}

function mistakeBody(i: number, service: Service, city?: City, country?: Country, industry?: Industry, seed = ''): string {
  const loc = city ? city.name : country?.longName || 'the market';
  const bodies = [
    `A verbal agreement is not an agreement. The moment a project gets complicated — and they all do — "I thought that was included" becomes a real dispute. A one-page written scope listing deliverables, exclusions, delivery date and revision terms prevents almost every project conflict we have ever seen.`,
    `Designing at 1440px and hiding elements on mobile is not responsive design. Around ${SITE_STATS_PCT} of traffic is mobile, and it is where the majority of your conversions happen. Design at 360px first and scale up; the result is almost always better.`,
    `Placeholder text makes a design look finished while saying nothing. Visitors — and search engines — can tell. Content written alongside the design, in the same round, is what makes a site persuasive. Budget for it or plan to write it yourself before launch.`,
    `Structured data is how a search engine understands what a page actually is — a product, a service, a local business, a question. Without it you are asking to be interpreted from page copy alone. It is not difficult to add and it materially changes what your pages are eligible to display.`,
    `Five stakeholders sending five separate comment threads is not feedback, it is noise. The provider cannot prioritise contradictory requests from five sources. Appoint one decision-maker who compiles a single ranked list per round. This single discipline is the biggest predictor of a smooth project.`,
    `A purchased theme is a starting point, not a design. It is fine to build on one — it is not fine to present it as custom work, and it is never fine to resell it to multiple clients. You should be able to tell what is bespoke and what is not, and a good provider will show you.`,
    `Launch-day testing on a developer laptop reveals almost nothing. Test on a real phone, on real mobile data, from outside, with a real submission to the form and a real click on every link. Broken form routing is the single most common and most expensive launch-day defect.`,
  ];
  return bodies[i % bodies.length];
}

function trendBody(i: number, service: Service, industry?: Industry, loc = 'your market'): string {
  const bodies = [
    `Core Web Vitals — LCP under 2.5s, INP under 200ms, CLS under 0.1 at the 75th percentile of real users — are enforced continuously. A slow site does not just lose rankings, it loses conversions. For ${industry?.name.toLowerCase() || 'service businesses'} in ${loc} where a visitor is often on mobile data, this is now a baseline requirement rather than an optimisation.`,
    `ChatGPT, Perplexity, Gemini and AI Overviews are now a discovery channel with real volume. Being cited inside an AI answer is driven by entity clarity, structured data and factual density — not by traditional authority alone. The businesses structuring for this early are establishing a channel their competitors do not yet know exists.`,
    `Structured data has moved from being a rich-result tactic to being infrastructure. It is how machines — search engines and AI systems alike — understand your pages. Sites with complete, accurate schema consistently out-perform sites without it on both fronts.`,
    `Third-party tracking degrades every year. Building an audience you actually own — email, first-party data, direct relationships — is now a strategic requirement rather than a nice-to-have. For ${industry?.name.toLowerCase() || 'businesses'}, this typically means treating your email list as infrastructure.`,
    `Performance and accessibility have converged into a single discipline. A site that loads fast, responds immediately and is operable by keyboard tends to be well-built, well-structured and well-written underneath. Optimising one reliably improves the others.`,
  ];
  return bodies[i % bodies.length];
}

const SITE_STATS_PCT = '65%';

export { AUTHORS, CATEGORY_BY_TYPE };

// ─────────────────────────────────────────────────────────────────────────────
// FAQ generation
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_GENERIC: { q: string; a: string }[] = [
  { q: 'How much does this cost?', a: 'Our packages are fixed price and start at $199 for design work, $99 for a one-time SEO foundation and $199 for PPC setup. The published feature list on each package page shows exactly what is included, so you can compare without a sales call.' },
  { q: 'How long will it take?', a: 'Most projects ship in 5 to 21 business days from kickoff. The binding constraint is usually content and approvals rather than the work itself, which is why we agree a written scope and a delivery date before starting.' },
  { q: 'Do I own the result?', a: 'Completely. On final payment the code, design files, content and domain transfer to you. We hand over full access plus a documented training session. There is no hosting or lock-in arrangement.' },
  { q: 'What if I am not happy with it?', a: 'You get unlimited revisions on the chosen design direction. If after three structured rounds you are still not satisfied, you can cancel for a full refund minus work already completed and delivered to you.' },
];

type FaqFn = (kw: string, loc: string, locShort: string, service: string) => { q: string; a: string };
const FAQ_BY_TYPE: Partial<Record<PostType, FaqFn[]>> = {
  'how-to': [
    (kw, loc) => ({ q: `How do I choose a provider for ${kw}?`, a: `Start with a written scope. Send the identical scope to three providers in ${loc} and compare what is excluded, not just what is included. Ask who specifically will do the work, what happens if the project slips, and what you own at the end. The provider who answers all of those clearly in writing is usually the right one.` }),
    (kw, loc) => ({ q: `What should a ${kw} quote include?`, a: 'A written scope listing deliverables, explicit exclusions, a delivery date, the revision terms, a fixed price, and a statement of what you own on final payment. Anything that is not in that document is not agreed, regardless of what a sales conversation implied.' }),
  ],
  'cost-guide': [
    (kw, loc) => ({ q: `What is the going rate for ${kw} in ${loc}?`, a: 'Most small-business projects fall between $400 and $1,500 in a typical Western market. E-commerce, custom functionality and multi-location work cost considerably more. The number that matters is what is itemised, not the headline figure.' }),
    (kw) => ({ q: `Is a much lower quote a bargain or a warning?`, a: `Usually a warning. If a ${kw} quote comes in at less than half the market median, the gap is almost always a missing scope — usually SEO, CMS setup, responsive testing, accessibility, image optimisation or post-launch support. Ask for the itemised inclusions.` }),
  ],
  comparison: [
    (kw, loc) => ({ q: `Is it cheaper to build ${kw} myself?`, a: `The software is cheap; the time is not. A professional-quality build takes roughly 40 to 120 hours of skilled work. At 20 hours a week that is two to six months of evenings before anything goes live. In ${loc}, most businesses find that trade-off is not worth it for a revenue-generating site.` }),
    (kw) => ({ q: `What do I lose by doing it myself?`, a: 'Mostly certainty. You gain ownership and learning. You lose a fixed price, a delivery date, senior judgement, and accountability when something breaks. For a site that generates revenue, that trade is rarely worth taking.' }),
  ],
  'best-of': [
    (kw, loc) => ({ q: `Which ${kw} provider is best in ${loc}?`, a: 'The one that can show you finished, live work in your sector, quote a fixed price with itemised inclusions in writing, and reply substantively within a day. Those four signals predict project behaviour better than any portfolio aesthetic.' }),
    (kw) => ({ q: `How do I compare ${kw} quotes fairly?`, a: 'Send the identical scope to each provider and compare exclusions line by line. A quote that is missing a row is not cheaper — it is incomplete, and you will pay for the gap later.' }),
  ],
  mistakes: [
    (kw, loc) => ({ q: `What is the most common ${kw} mistake in ${loc}?`, a: 'Agreeing scope verbally instead of in writing. Every other mistake on the list is downstream of that one, and it is the only one that is entirely free to fix.' }),
    (kw) => ({ q: `How do I avoid these?`, a: 'Write a one-page scope that defines deliverables, exclusions, delivery date, revision terms and ownership. It takes twenty minutes and prevents the majority of these problems before they occur.' }),
  ],
  'local-guide': [
    (kw, loc) => ({ q: `Does local work really differ from a national build?`, a: `Yes, in three specific places: page structure follows local search demand rather than a generic template, proof elements reflect what a local buyer trusts, and pricing reflects ${loc} market rates. Everything else follows the same good-practice standard.` }),
    (kw, loc) => ({ q: `How do I know a provider understands ${loc}?`, a: 'Ask them to describe the local competitive landscape without researching it first. If the answer is generic, they have not looked. If they name specific competitors, local directories and search behaviour, they have.' }),
  ],
  'trend-report': [
    (kw) => ({ q: `Which ${kw} changes actually matter?`, a: 'Performance and AI search visibility. The rest is interesting but not yet load-bearing. Judge any trend by whether it changes what you should do this quarter, not by how much attention it is getting.' }),
    (kw) => ({ q: `What should I ignore?`, a: 'Anything promising guaranteed rankings, mass-produced content at scale, or a framework recommended for a site with a hundred pages. If a strategy cannot be explained in one sentence and evidenced with a case study, it is a pitch.' }),
  ],
  explainer: [
    (kw) => ({ q: `What does ${kw} include?`, a: 'Custom responsive design, a CMS, on-page SEO setup, structured data, analytics, accessibility to WCAG 2.1 AA, performance optimisation, and a documented handover. If any of those are missing, you are not getting the full service.' }),
    (kw) => ({ q: `Do I need ${kw} or just a refresh?`, a: `If your current site is costing you money through lost trust, poor visibility, slow load or an unclear path to enquiry, you need it rebuilt. If it is doing its job and you simply want a visual refresh, that is a design tweak, not a full build.` }),
  ],
  checklist: [
    (kw) => ({ q: `What should a ${kw} include?`, a: 'A defined one-sentence objective, a page list, a defined action per page, gathered assets, written non-negotiables, consolidated feedback, real-device testing, end-to-end form verification, and a retained scope document.' }),
    (kw) => ({ q: `Who should own the checklist?`, a: 'You should. Use it to brief a provider and to hold them to it. If a provider resists a written scope, that is the answer you need.' }),
  ],
  'industry-playbook': [
    (kw, loc, locShort, service) => ({ q: `What is different about ${service.toLowerCase()} in this sector?`, a: `The buying trigger, the main objection and the success metric are all sector-specific. Generic advice underperforms because it optimises for the average business rather than yours. A ${locShort} provider who understands the sector will optimise against those three things specifically.` }),
  ],
  seasonal: [
    (kw) => ({ q: `How far ahead should I book?`, a: 'Allow the delivery window plus two to four weeks for content collection, reviews and approvals. Booking ahead of a peak period is both cheaper and faster than booking during one.' }),
    (kw) => ({ q: `Why do projects slip?`, a: 'Almost always in the discovery phase, not the build. Content collection and stakeholder availability are where timelines quietly expand. Assign those early and the build itself rarely surprises anyone.' }),
  ],
  regulatory: [
    (kw, loc) => ({ q: `Do these requirements apply to us?`, a: `Generally yes if you take enquiries through a website in ${loc}. The precise obligations depend on your sector and audience, and this is general information rather than legal advice — confirm your position with a qualified local professional.` }),
    (kw) => ({ q: `Is accessibility a commercial issue or just compliance?`, a: 'Both. Around one in five people have a significant disability, so an inaccessible site excludes a fifth of your audience. Accessibility work also tends to improve general usability, so it is rarely wasted effort.' }),
  ],
};

function generateRedesignFaqs(
  topic: RedesignTopic,
  kw: string,
  loc: string,
  serviceName: string,
  currency: string,
): { q: string; a: string }[] {
  const priceMap: Record<string, string> = {
    'rebranding-checklist': `A full rebrand in ${loc} typically runs from ${currency === 'USD' ? '$899' : 'our entry price'} upward, and the checklist above is what keeps it from running twice.`,
    'website-redesign-cost': `Our redesign packages start at ${currency === 'USD' ? '$449' : 'a fixed price set at checkout'} for a focused landing-page rebuild and scale with template count and integration depth. In ${loc} we quote the same scope for every business in the market.`,
    'website-redesign-process': `The six-stage process runs on a fixed schedule once content and approvals land. In ${loc} we front-load the audit and strategy stage so you know the shape of the project before you commit to it.`,
    'website-redesign-vs-rebuild': `A redesign is roughly a third of the cost of a rebuild and carries far less risk. For most ${loc} businesses the platform is still sound, so redesign is the recommendation.`,
    'when-to-redesign-your-website': `Score your current site across five dimensions before you decide. If it is above 15 out of 25, a redesign is worth scoping. We will assess yours honestly.`,
    'website-redesign-seo': `Preserving rankings through a redesign is a build discipline, not a hope. Every ${loc} project we run includes a tested redirect map and a pre-launch SEO check.`,
    'website-redesign-timeline': `Delivery in ${loc} runs 5–8 days for a landing page and 22–35 days for a full site, assuming content arrives on schedule.`,
    'logo-redesign-guide': `A logo refresh in ${loc} starts at ${currency === 'USD' ? '$299' : 'our entry price'} and includes the full application suite and guidelines.`,
    'landing-page-redesign': `A landing page rebuild in ${loc} starts at ${currency === 'USD' ? '$249' : 'our entry price'} and is measured with a proper A/B test rather than an opinion.`,
    'ecommerce-website-redesign': `Ecommerce redesigns in ${loc} start at ${currency === 'USD' ? '$899' : 'our entry price'} and cover product, category, cart and checkout templates.`,
    'website-migration-checklist': `A migration in ${loc} is quoted as a fixed project, and the redirect map is built and tested before launch — not afterwards.`,
    'brand-refresh-vs-rebrand': `If you are still deciding which you need, we will tell you on the call. ${serviceName} clients in ${loc} get that assessment as part of the scoping conversation.`,
  };
  const qMap: Record<string, string> = {
    'rebranding-checklist': `What is the first step in a rebrand?`,
    'website-redesign-cost': `How much does a website redesign cost in ${loc}?`,
    'website-redesign-process': `How long does a website redesign take?`,
    'website-redesign-vs-rebuild': `Should I redesign or rebuild my website?`,
    'when-to-redesign-your-website': `When should a business redesign its website?`,
    'website-redesign-seo': `Will my rankings survive a website redesign?`,
    'website-redesign-timeline': `How long does a redesign take in ${loc}?`,
    'logo-redesign-guide': `Do I need a logo redesign or a full rebrand?`,
    'landing-page-redesign': `Is it worth redesigning a landing page?`,
    'ecommerce-website-redesign': `What does an ecommerce redesign include?`,
    'website-migration-checklist': `What should be in a website migration checklist?`,
    'brand-refresh-vs-rebrand': `What is the difference between a brand refresh and a rebrand?`,
  };
  return [
    { q: qMap[topic.slug], a: priceMap[topic.slug] },
    {
      q: `Do you handle ${topic.keyword.toLowerCase()} for businesses in ${loc}?`,
      a: `Yes. We work with businesses across ${loc} every week, and the advice is the same wherever you are: the site has to earn its keep commercially, not just look good in a portfolio.`,
    },
    {
      q: `Can you help us with ${topic.keyword.toLowerCase()} and the rest of the project?`,
      a: `We do. ${topic.title} is one part of a wider engagement that usually includes design, build, on-page SEO and a CMS your team can actually use. If you only need the one piece, we scope only that piece.`,
    },
  ];
}

function generateFaqs(ctx: GenContext, kw: string, loc: string, locShort: string, title: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  const specialised = (FAQ_BY_TYPE[ctx.type] || []).map((fn) => fn(kw, loc, locShort, ctx.service.name));
  const generic = FAQ_GENERIC.map((f) => ({ ...f, a: f.a }));
  out.push(...specialised.slice(0, 3), ...generic.slice(0, 2));

  // Service-specific question, kept relevant to the post\'s topic.
  out.push({
    q: `Do you offer ${ctx.service.name.toLowerCase()} for businesses in ${locShort}?`,
    a: `Yes. ${ctx.country.note} Packages start at $${ctx.service.fromPrice} and include a fixed price, a written scope, unlimited revisions and a delivery date agreed before work starts.`,
  });

  return out.slice(0, 6);
}
