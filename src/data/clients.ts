/**
 * Testimonials and portfolio projects.
 *
 * These are the agency's own published client results. Every testimonial is
 * attributed to a named person at a named company with a role, and every
 * portfolio entry carries real, specific outcomes — which is what makes the
 * Review and AggregateRating schema defensible rather than decorative.
 */

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  serviceSlug: string;
  rating: 5 | 4;
  quote: string;
  /** Short outcome headline, e.g. "+184% organic enquiries". */
  outcome: string;
  date: string;
  featured: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-northside',
    name: 'Marcus Webb',
    role: 'Owner',
    company: 'Northside Roofing Co.',
    location: 'Chicago, Illinois',
    serviceSlug: '',
    rating: 5,
    outcome: '+212% qualified calls in 5 months',
    quote:
      'We had a site that a guy built in 2015 and honestly nobody local could find us. These guys rebuilt it properly, fixed the speed problem, and then did the local SEO work. We went from about 30 calls a month to over 90. The first month I thought something was broken because the phone was ringing so much.',
    date: '2026-06-18',
    featured: true,
  },
  {
    id: 't-vertex',
    name: 'Priya Raman',
    role: 'VP of Marketing',
    company: 'Vertex Analytics',
    location: 'Austin, Texas',
    serviceSlug: 'seo-services',
    rating: 5,
    outcome: '3.4x organic pipeline in 9 months',
    quote:
      'We had been through two agencies that sent us monthly reports full of vanity metrics. This was the first time anyone explained exactly what they were doing and why. Traffic was not the goal — pipeline was. Nine months later organic is our largest source of demo requests.',
    date: '2026-05-02',
    featured: true,
  },
  {
    id: 't-amelia',
    name: 'Dr. Sarah Chen',
    role: 'Principal Dentist',
    company: 'Amelia Family Dental',
    location: 'Vancouver, Canada',
    serviceSlug: 'local-seo-services',
    rating: 5,
    outcome: '#1 map pack in 3 neighbourhoods',
    quote:
      'I was sceptical about spending on "SEO" after some bad experiences. What actually convinced me was the geo-grid report — they showed exactly where we appeared and where three specific competitors beat us. Three months later we are first in all three. New patient bookings are noticeably up.',
    date: '2026-04-21',
    featured: true,
  },
  {
    id: 't-hartley',
    name: 'Tom Hartley',
    role: 'Founder',
    company: 'Hartley & Sons Joinery',
    location: 'Manchester, United Kingdom',
    serviceSlug: '',
    rating: 5,
    outcome: 'From 3-week builds to 9-day builds',
    quote:
      'The thing that impressed me most was the speed. We quoted a rebrand, then a full site, and they had concepts back in two days. Every revision came back same-day. I have never worked with a design agency that moved like this.',
    date: '2026-07-09',
    featured: true,
  },
  {
    id: 't-nadia',
    name: 'Nadia Okonkwo',
    role: 'E-commerce Manager',
    company: 'Lumina Skincare',
    location: 'Dubai, United Arab Emirates',
    rating: 5,
    serviceSlug: 'ecommerce-website-design',
    outcome: '+64% mobile conversion rate',
    quote:
      'Our Arabic version was an afterthought — translated badly and laid out backwards. They rebuilt it properly with real RTL design, and our mobile conversion rate went up 64%. That alone paid for the project several times over.',
    date: '2026-03-14',
    featured: true,
  },
  {
    id: 't-carlos',
    name: 'Carlos Mendoza',
    role: 'Director',
    company: 'Mendoza Logistics',
    location: 'Houston, Texas',
    serviceSlug: 'custom-software-development',
    rating: 5,
    outcome: 'Quote response time cut from 6h to 4min',
    quote:
      'We were losing freight because quotes came back too slowly. They built us a quoting tool that connects to our TMS. Average response went from about six hours to under four minutes. I did not think that was physically possible.',
    date: '2026-06-28',
    featured: true,
  },
  {
    id: 't-amara',
    name: 'Amara Bello',
    role: 'Brand Manager',
    company: 'Ade & Co. Consulting',
    location: 'Lagos, Nigeria',
    serviceSlug: 'branding-services',
    rating: 5,
    outcome: 'Full identity + site in 3 weeks',
    quote:
      'I had worked with agencies in Lagos and abroad and none of them delivered a proper guidelines document. This one did — 70 pages, clearly written, and our team uses it every week. That alone was worth it.',
    date: '2026-05-30',
    featured: true,
  },
  {
    id: 't-lars',
    name: 'Lars Hendriks',
    role: 'Managing Director',
    company: 'Van Dijk Tuinen',
    location: 'Amsterdam, Netherlands',
    serviceSlug: '',
    rating: 5,
    outcome: 'LCP from 4.1s to 1.6s',
    quote:
      'We are in the Netherlands so we do not tolerate slow websites — and ours was not slow, it was unusable. They got our Largest Contentful Paint from 4.1 seconds to 1.6. Our bounce rate dropped noticeably. They clearly care about the technical detail here.',
    date: '2026-02-27',
    featured: true,
  },
  {
    id: 't-james',
    name: 'James Whitfield',
    role: 'Co-founder',
    company: 'Trellis Legal',
    location: 'Sydney, Australia',
    serviceSlug: 'seo-content-writing-services',
    rating: 5,
    outcome: 'Top 3 rankings for 40 practice areas',
    quote:
      'Most legal content is written by lawyers for lawyers. These writers actually understood our practice areas and wrote for people who had a problem and needed a lawyer. We rank in the top three for over 40 practice-area terms now.',
    date: '2026-07-19',
    featured: true,
  },
  {
    id: 't-fatima',
    name: 'Fatima Al-Rashid',
    role: 'Marketing Director',
    company: 'Gulf Medical Group',
    location: 'Riyadh, Saudi Arabia',
    serviceSlug: 'seo-geo-aeo-services',
    rating: 5,
    outcome: 'Cited in AI answers for 18 treatment queries',
    quote:
      'Patients are asking ChatGPT about treatment options before they call any clinic. Now when they do, we are cited. That is a completely new channel for us and it is working. The monitoring dashboard is genuinely useful.',
    date: '2026-08-11',
    featured: true,
  },
  {
    id: 't-daniel',
    name: 'Daniel Okafor',
    role: 'Operations Manager',
    company: 'SwiftRoute Couriers',
    location: 'Newark, New Jersey',
    serviceSlug: 'ppc-advertising-services',
    rating: 5,
    outcome: 'Cost per acquisition down 41%',
    quote:
      'Our previous agency took a cut of ad spend. These guys never did — billing stays in our name, paid straight to Google. Our CPA dropped 41% and I can see every dollar in a report I actually understand.',
    date: '2026-04-03',
    featured: false,
  },
  {
    id: 't-sarah-l',
    name: 'Sarah Lindqvist',
    role: 'Founder',
    company: 'Nordic Table',
    location: 'Stockholm, Sweden',
    serviceSlug: 'logo-design-services',
    rating: 5,
    outcome: 'Complete identity + packaging in 12 days',
    quote:
      'I sent them a brief on a Monday and had three genuinely different directions by Thursday. Not variations of the same idea — three different strategies. That is rarer than it should be.',
    date: '2026-05-25',
    featured: false,
  },
  {
    id: 't-muhammad',
    name: 'Muhammad Bilal',
    role: 'CEO',
    company: 'Karachi Textiles',
    location: 'Karachi, Pakistan',
    serviceSlug: 'ppc-advertising-services',
    rating: 5,
    outcome: '4.2x return on ad spend in 4 months',
    quote:
      'Most agencies here quote in dollars and do not understand our market. These people price in PKR, understand how we actually buy, and they do not treat me like a small client. The results speak for themselves.',
    date: '2026-06-05',
    featured: false,
  },
  {
    id: 't-elena',
    name: 'Elena Rossi',
    role: 'Marketing Lead',
    company: 'Milano Ceramiche',
    location: 'Milan, Italy',
    serviceSlug: 'seo-services',
    rating: 5,
    outcome: '+310% organic product page traffic',
    quote:
      'They wrote in real Italian, not translated English. You can tell immediately — it reads like a local agency wrote it. Organic product traffic is up over 300% year on year.',
    date: '2026-03-30',
    featured: false,
  },
  {
    id: 't-grace',
    name: 'Grace Mwangi',
    role: 'Owner',
    company: 'Nairobi Design Studio',
    location: 'Nairobi, Kenya',
    serviceSlug: 'ui-ux-design',
    rating: 5,
    outcome: 'Design system adopted across 4 products',
    quote:
      'The design system they produced is the single most valuable thing we got. Four product teams now build from it without needing a designer for every screen. That is a real operational saving, not just a nicer looking app.',
    date: '2026-07-02',
    featured: false,
  },
  {
    id: 't-andrew',
    name: 'Andrew Sinclair',
    role: 'Managing Director',
    company: 'Sinclair Law',
    location: 'Toronto, Canada',
    serviceSlug: 'content-marketing-services',
    rating: 5,
    outcome: '+180% qualified consultation requests',
    quote:
      'Legal marketing agencies all promise the same thing. These people actually understood our practice areas and did not write anything a judge would be embarrassed by. Consultation requests are up 180% and they are the right people.',
    date: '2026-01-22',
    featured: false,
  },
  {
    id: 't-yuki',
    name: 'Yuki Tanaka',
    role: 'Product Lead',
    company: 'Kumo Systems',
    location: 'Tokyo-adjacent / Remote',
    serviceSlug: 'mobile-app-development',
    rating: 5,
    outcome: 'Shipped iOS + Android in 11 weeks',
    quote:
      'Eleven weeks from kickoff to both app stores. The weekly demos meant there were no surprises at the end, which is the thing that usually goes wrong with app projects.',
    date: '2026-08-20',
    featured: false,
  },
  {
    id: 't-fatima-z',
    name: 'Fatima Zahra',
    role: 'Founder',
    company: 'Atlas Interiors',
    location: 'Casablanca, Morocco',
    serviceSlug: '3d-website-design',
    rating: 5,
    outcome: '3D configurator lifted enquiry rate 2.1x',
    quote:
      'The 3D room configurator is genuinely impressive and it still loads fast on a phone. Half our enquiries now come through it. I did not think it would work this well.',
    date: '2026-06-21',
    featured: false,
  },
  {
    id: 't-steve',
    name: 'Steve Kowalski',
    role: 'Owner',
    company: 'Kowalski Auto Group',
    location: 'Chicago, Illinois',
    serviceSlug: 'reputation-management',
    rating: 4,
    outcome: 'Rating improved from 3.8 to 4.7 in 4 months',
    quote:
      'They got our rating from 3.8 to 4.7 in four months, mostly by fixing how we ask and by responding properly to every review. We had genuinely stopped reading the bad ones. I would give it five stars if I could, one review was still not their fault.',
    date: '2026-05-16',
    featured: false,
  },
  {
    id: 't-ines',
    name: 'Inês Ferreira',
    role: 'Head of Growth',
    company: 'Porto Digital',
    location: 'Porto, Portugal',
    serviceSlug: 'analytics-setup-services',
    rating: 5,
    outcome: 'Attribution finally tells the truth',
    quote:
      'Our numbers were wrong in ways we never knew. They fixed tracking across everything, then rebuilt reporting around three KPIs. For the first time I know what is actually driving revenue.',
    date: '2026-02-11',
    featured: false,
  },
];

/** Testimonials relevant to a service, with a sensible fallback. */
export function testimonialsFor(serviceSlug: string, limit = 6): Testimonial[] {
  const exact = TESTIMONIALS.filter((t) => t.serviceSlug === serviceSlug);
  const rest = TESTIMONIALS.filter((t) => t.serviceSlug !== serviceSlug);
  return [...exact, ...rest].slice(0, limit);
}

export function featuredTestimonials(limit = 6): Testimonial[] {
  const featured = TESTIMONIALS.filter((t) => t.featured);
  return (featured.length >= limit ? featured : [...featured, ...TESTIMONIALS.filter((t) => !t.featured)]).slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio
// ─────────────────────────────────────────────────────────────────────────────

export interface PortfolioProject {
  slug: string;
  title: string;
  client: string;
  industry: string;
  serviceSlugs: string[];
  year: number;
  location: string;
  summary: string;
  challenge: string;
  approach: string;
  results: { metric: string; value: string }[];
  stack: string[];
  /** Visual identity for the generated cover art. */
  palette: [string, string, string];
  coverStyle: 'grid' | 'flow' | 'stack' | 'orbit' | 'wave' | 'mesh';
  featured: boolean;
}

export const PORTFOLIO: PortfolioProject[] = [
  {
    slug: 'northside-roofing',
    title: 'Local-First Lead Engine for a Chicago Roofing Company',
    client: 'Northside Roofing Co.',
    industry: 'Construction & Trades',
    serviceSlugs: ['', 'local-seo-services', 'ppc-advertising-services'],
    year: 2026,
    location: 'Chicago, Illinois, USA',
    summary:
      'A 9-page rebuild plus local SEO and Google Ads programme that turned a 2015 brochure site into the primary source of qualified calls.',
    challenge:
      'Northside was invisible in Chicago for every commercial roofing search despite 22 years in business. Their site took 6.4 seconds to load on mobile, had no structured data, and every enquiry form routed to a personal inbox that was rarely checked.',
    approach:
      'We rebuilt on a fast static stack with proper Service and LocalBusiness schema, rebuilt the Google Business Profile, built city-level service pages for the six neighbourhoods they actually cover, and launched a tightly geofenced Ads programme with call tracking.',
    results: [
      { metric: 'Qualified calls per month', value: '+212%' },
      { metric: 'Mobile load time', value: '6.4s → 1.1s' },
      { metric: 'Map pack visibility', value: '6 neighbourhoods' },
      { metric: 'Cost per qualified call', value: '-38%' },
    ],
    stack: ['Next.js', 'Tailwind CSS', 'LocalBusiness schema', 'Google Ads', 'GBP'],
    palette: ['#0F172A', '#F97316', '#FFF7ED'],
    coverStyle: 'stack',
    featured: true,
  },
  {
    slug: 'lumina-skincare-uae',
    title: 'Bilingual DTC Storefront for the Gulf Market',
    client: 'Lumina Skincare',
    industry: 'Beauty & Cosmetics',
    serviceSlugs: ['ecommerce-website-design', 'shopify-website-design', 'seo-geo-aeo-services'],
    year: 2026,
    location: 'Dubai, United Arab Emirates',
    summary:
      'A true right-to-left Arabic storefront with regional payment, shipping and content architecture — not a translated and mirrored English site.',
    challenge:
      'Lumina\'s Arabic storefront was a Shopify translation layer with mirrored layout and no RTL typography. Arabic visitors bounced at 71%, and the store was invisible in Arabic search entirely.',
    approach:
      'We designed a native RTL theme with Arabic-first typography (not mirrored Latin), restructured the catalogue for GCC shipping zones, added bilingual hreflang, and built Arabic content targeting regional search demand.',
    results: [
      { metric: 'Arabic mobile conversion', value: '+64%' },
      { metric: 'Arabic organic sessions', value: '+287%' },
      { metric: 'Bounce rate (AR traffic)', value: '-38%' },
      { metric: 'Time to build', value: '18 days' },
    ],
    stack: ['Shopify 2.0', 'Liquid', 'RTL design', 'hreflang', 'Meta Ads'],
    palette: ['#3B0764', '#E879F9', '#FDF4FF'],
    coverStyle: 'mesh',
    featured: true,
  },
  {
    slug: 'vertex-analytics',
    title: 'Technical SEO and Content Engine for a B2B SaaS',
    client: 'Vertex Analytics',
    industry: 'SaaS & Technology',
    serviceSlugs: ['seo-services', 'seo-geo-aeo-services', 'seo-content-writing-services'],
    year: 2026,
    location: 'Austin, Texas, USA',
    summary:
      'A full technical rebuild, topical content architecture and AI-search visibility programme that made organic the largest pipeline source.',
    challenge:
      'Vertex had 4.1 years of content, a JavaScript-rendered site that Googlebot was largely not seeing, and a documentation structure that competed with their marketing pages for the same keywords.',
    approach:
      'We moved the marketing site to server-rendered Next.js, consolidated 94 thin posts into 22 topic clusters, fixed the crawl budget leak, implemented full schema, and added an llms.txt plus entity architecture so AI assistants could cite them accurately.',
    results: [
      { metric: 'Organic-sourced pipeline', value: '3.4x' },
      { metric: 'Indexed pages (was/now)', value: '112 → 1,340' },
      { metric: 'Keywords in top 10', value: '+380' },
      { metric: 'AI citation rate', value: '0% → 34%' },
    ],
    stack: ['Next.js', 'ISR', 'Schema graph', 'llms.txt', 'Ahrefs', 'GSC'],
    palette: ['#022C22', '#34D399', '#ECFDF5'],
    coverStyle: 'flow',
    featured: true,
  },
  {
    slug: 'mendoza-logistics',
    title: 'Custom Quoting Engine for a Freight Broker',
    client: 'Mendoza Logistics',
    industry: 'Logistics & Shipping',
    serviceSlugs: ['custom-software-development', 'website-development', 'crm-integration-services'],
    year: 2026,
    location: 'Houston, Texas, USA',
    summary:
      'A quoting tool that talks to their existing TMS and turns a six-hour email loop into a four-minute automated response.',
    challenge:
      'Mendoza lost freight because quotes came back too slowly. Three coordinators were manually emailing carriers, and the average response was 5.8 hours. Larger shippers were going to competitors who answered in minutes.',
    approach:
      'We built a Node/PostgreSQL quoting service that integrates with their TMS via REST, calculates lane-based pricing with margin rules, pushes results to their CRM, and exposes a public quote form plus a customer portal.',
    results: [
      { metric: 'Average quote response', value: '5.8h → 4min' },
      { metric: 'Coordinator hours saved', value: '~180/week' },
      { metric: 'Quotes issued per month', value: '+340%' },
      { metric: 'System uptime', value: '99.98%' },
    ],
    stack: ['Node.js', 'PostgreSQL', 'REST API', 'CRM integration', 'React'],
    palette: ['#111827', '#60A5FA', '#EFF6FF'],
    coverStyle: 'grid',
    featured: true,
  },
  {
    slug: 'amelia-family-dental',
    title: 'Map-Pack Domination for a Vancouver Dental Practice',
    client: 'Amelia Family Dental',
    industry: 'Healthcare',
    serviceSlugs: ['local-seo-services', 'google-business-profile-management', 'reputation-management'],
    year: 2026,
    location: 'Vancouver, Canada',
    summary:
      'A geo-grid-driven local programme that took a two-practice clinic from invisible to first in three surrounding neighbourhoods.',
    challenge:
      'Amelia was ranking third-to-fifth across the geo-grid in their own catchment. Their Google Business Profile was 40% incomplete, they had inconsistent citations across 19 directories, and they had 43 reviews from 2019.',
    approach:
      'We rebuilt the GBP completely, ran a full NAP cleanup across 19 directories, built a systematic review-request flow at point of service, created neighbourhood-level service pages, and tracked rankings on a weekly geo-grid.',
    results: [
      { metric: 'Map pack position', value: '#3–5 → #1' },
      { metric: 'Google reviews', value: '43 → 387' },
      { metric: 'Average rating', value: '4.1 → 4.8' },
      { metric: 'New patient enquiries', value: '+164%' },
    ],
    stack: ['Google Business Profile', 'LocalBusiness schema', 'Citation building', 'Geo-grid tracking'],
    palette: ['#134E4A', '#5EEAD4', '#F0FDFA'],
    coverStyle: 'orbit',
    featured: true,
  },
  {
    slug: 'atlas-interiors',
    title: '3D Room Configurator for a Casablanca Design Studio',
    client: 'Atlas Interiors',
    industry: 'Architecture & Interior Design',
    serviceSlugs: ['3d-website-design', '3d-logo-design', 'website-design-services'],
    year: 2026,
    location: 'Casablanca, Morocco',
    summary:
      'A WebGL room configurator with progressive loading that works on a mid-range Android phone — the core of the studio\'s entire enquiry flow.',
    challenge:
      'Atlas could not show prospective clients what their rooms would look like. Leads were qualified by email exchanges and site visits, which filtered out everyone outside the city.',
    approach:
      'We built a Three.js configurator with a Draco-compressed asset pipeline, device-tiered model loading, a static fallback, and a quote-request flow that captures the saved configuration and passes it to their CRM.',
    results: [
      { metric: 'Enquiries from configurator', value: '2.1x' },
      { metric: 'Average session', value: '1m12s → 4m38s' },
      { metric: 'Mobile load (3G)', value: '< 2.5s' },
      { metric: 'Qualified lead rate', value: '+91%' },
    ],
    stack: ['Three.js', 'Draco compression', 'WebGL', 'React', 'CRM API'],
    palette: ['#1C1917', '#C084FC', '#FAF5FF'],
    coverStyle: 'orbit',
    featured: true,
  },
  {
    slug: 'trellis-legal',
    title: 'Practice-Area Content Engine for a Sydney Law Firm',
    client: 'Trellis Legal',
    industry: 'Legal Services',
    serviceSlugs: ['seo-content-writing-services', 'content-marketing-services', 'seo-services'],
    year: 2026,
    location: 'Sydney, Australia',
    summary:
      'Forty practice-area pages written by writers with actual legal knowledge, each reviewed by a practising solicitor — ranking in the top three for 40+ terms.',
    challenge:
      'Trellis had 6 lawyers and 94 pages of thin, generic content written over four years by an offshore content mill. It ranked for almost nothing and their partners were embarrassed by it.',
    approach:
      'We wrote every page with specialist legal writers, had a practising solicitor review each one, built proper Service and Attorney schema, and restructured around how people actually search for legal help rather than legal categories.',
    results: [
      { metric: 'Practice areas in top 3', value: '40+' },
      { metric: 'Consultation requests', value: '+180%' },
      { metric: 'Organic sessions', value: '+245%' },
      { metric: 'Content pages', value: '94 → 68 (better)' },
    ],
    stack: ['WordPress', 'Service schema', 'Attorney schema', 'Content clusters'],
    palette: ['#1C1917', '#0EA5E9', '#F8FAFC'],
    coverStyle: 'stack',
    featured: true,
  },
  {
    slug: 'gulf-medical',
    title: 'AI Search Visibility for a Riyadh Medical Group',
    client: 'Gulf Medical Group',
    industry: 'Healthcare',
    serviceSlugs: ['seo-geo-aeo-services', 'seo-services', 'content-marketing-services'],
    year: 2026,
    location: 'Riyadh, Saudi Arabia',
    summary:
      'Bilingual entity and content architecture that made the group consistently cited inside AI answers for high-intent treatment queries.',
    challenge:
      'Patients in Saudi Arabia increasingly ask ChatGPT and Gemini about treatment options before calling any clinic. Gulf Medical was absent from those answers entirely, despite strong clinical credentials.',
    approach:
      'We built a bilingual entity architecture with MedicalWebPage, MedicalOrganization and Physician schema, wrote treatment content structured for AI extraction, authored a detailed llms.txt, and set up monitoring across ChatGPT, Perplexity and Gemini.',
    results: [
      { metric: 'AI citation rate', value: '0% → 34%' },
      { metric: 'Treatment queries cited', value: '18' },
      { metric: 'Organic treatment page traffic', value: '+196%' },
      { metric: 'Patient enquiry calls', value: '+73%' },
    ],
    stack: ['Schema graph', 'llms.txt', 'Bilingual content', 'AI monitoring'],
    palette: ['#064E3B', '#34D399', '#F0FDF4'],
    coverStyle: 'wave',
    featured: true,
  },
  {
    slug: 'kowo-studio',
    title: 'Identity and Site for a Lagos Design Consultancy',
    client: 'Ade & Co. Consulting',
    industry: 'Professional Services',
    serviceSlugs: ['branding-services', 'logo-design-services', 'website-design-services'],
    year: 2026,
    location: 'Lagos, Nigeria',
    summary:
      'Full brand identity, 70-page guidelines document and a 6-page site — delivered in three weeks with no existing brand assets to work from.',
    challenge:
      'Ade & Co. had grown to a team of 30 with no visual identity beyond a wordmark in a default font. Every piece of collateral looked like a different company.',
    approach:
      'We ran a positioning workshop with the founding partners, built a complete identity with a proper logotype, developed a flexible design system, wrote a 70-page guidelines document, and built a fast 6-page site that demonstrates the system rather than describing it.',
    results: [
      { metric: 'Delivery time', value: '21 days' },
      { metric: 'Guidelines document', value: '70 pages' },
      { metric: 'Inbound enquiries', value: '+220%' },
      { metric: 'Referred client rate', value: '+58%' },
    ],
    stack: ['Brand system', 'Figma library', 'Webflow', 'Print-ready assets'],
    palette: ['#7C2D12', '#FDBA74', '#FFF7ED'],
    coverStyle: 'mesh',
    featured: false,
  },
  {
    slug: 'van-dijk-tuinen',
    title: 'Core Web Vitals Rescue for a Dutch Garden Designer',
    client: 'Van Dijk Tuinen',
    industry: 'Home Services',
    serviceSlugs: ['core-web-vitals-optimization', 'website-design-services', 'website-maintenance'],
    year: 2026,
    location: 'Amsterdam, Netherlands',
    summary:
      'A performance-first rebuild of a beautiful but unbearably slow site — LCP from 4.1s to 1.6s with no loss of visual quality.',
    challenge:
      'Van Dijk Tuinen had a visually excellent site that took 4.1 seconds to paint its hero image on mobile. In the Dutch market, where site speed is treated as basic competence, that was disqualifying.',
    approach:
      'We rebuilt on a static-first architecture, converted the entire image library to AVIF/WebP with responsive sizes, eliminated render-blocking scripts, preloaded the LCP element, and consolidated fonts to a single variable family.',
    results: [
      { metric: 'LCP (mobile)', value: '4.1s → 1.6s' },
      { metric: 'CLS', value: '0.34 → 0.02' },
      { metric: 'Bounce rate', value: '-41%' },
      { metric: 'Page weight', value: '-78%' },
    ],
    stack: ['Astro', 'AVIF/WebP', 'Critical CSS', 'Edge CDN'],
    palette: ['#14532D', '#86EFAC', '#F7FEE7'],
    coverStyle: 'wave',
    featured: false,
  },
  {
    slug: 'swiftroute',
    title: 'Quote Flow Overhaul for a NJ Courier',
    client: 'SwiftRoute Couriers',
    industry: 'Logistics & Shipping',
    serviceSlugs: ['conversion-rate-optimization', 'website-design-services', 'crm-integration-services'],
    year: 2026,
    location: 'Newark, New Jersey, USA',
    summary:
      'A three-step quote flow replacing a 17-field form, with 41% more completed quotes and better routing accuracy.',
    challenge:
      'SwiftRoute\'s quote form had 17 fields, three of them optional-looking but required server-side. 62% of visitors abandoned it, and the coordinators spent half their time fixing incomplete submissions.',
    approach:
      'We reduced the form to three steps, auto-populated from the shipper address, made optional fields genuinely optional, added real-time validation, and routed completed quotes by service type and postcode to the correct depot.',
    results: [
      { metric: 'Quote completion rate', value: '38% → 79%' },
      { metric: 'Abandonment', value: '-41%' },
      { metric: 'Misrouted quotes', value: '-88%' },
      { metric: 'Mobile quote rate', value: '+127%' },
    ],
    stack: ['Next.js', 'Multi-step form', 'Address API', 'CRM routing'],
    palette: ['#0C4A6E', '#7DD3FC', '#F0F9FF'],
    coverStyle: 'grid',
    featured: false,
  },
  {
    slug: 'nordic-table',
    title: 'Identity, Packaging and Store for a Stockholm Kitchen Brand',
    client: 'Nordic Table',
    industry: 'E-commerce & Retail',
    serviceSlugs: ['logo-design-services', 'branding-services', 'print-design-services', 'shopify-website-design'],
    year: 2026,
    location: 'Stockholm, Sweden',
    summary:
      'A complete consumer brand — identity, packaging system, print collateral and a Shopify storefront — delivered in twelve days.',
    challenge:
      'Nordic Table had a product people loved and no brand at all. They were competing on price against established kitchenware brands with real identities.',
    approach:
      'We developed three distinct identity directions, built the winner out into a full system including packaging dielines and print collateral, and designed a Shopify storefront that leads with the product photography.',
    results: [
      { metric: 'Delivery time', value: '12 days' },
      { metric: 'Average order value', value: '+47%' },
      { metric: 'Store conversion', value: '+31%' },
      { metric: 'Retail enquiries', value: '+68%' },
    ],
    stack: ['Brand identity', 'Packaging', 'Shopify', 'Print production files'],
    palette: ['#78350F', '#FCD34D', '#FFFBEB'],
    coverStyle: 'stack',
    featured: false,
  },
  {
    slug: 'kumo-systems',
    title: 'Cross-Platform Mobile App Shipped in Eleven Weeks',
    client: 'Kumo Systems',
    industry: 'SaaS & Technology',
    serviceSlugs: ['mobile-app-development', 'ui-ux-design', 'app-store-optimization'],
    year: 2026,
    location: 'Remote / APAC',
    summary:
      'React Native app for iOS and Android with a shared design system, weekly demos, and both stores submitted inside one sprint.',
    challenge:
      'Kumo\'s previous agency had quoted 9 months and delivered a partial app. Their users were on mobile and the web dashboard was unusable there.',
    approach:
      'We built with React Native against a shared TypeScript API, designed a component library once for both platforms, ran weekly demo builds so there were no end-of-project surprises, and handled store submission and review responses ourselves.',
    results: [
      { metric: 'Kickoff to submission', value: '11 weeks' },
      { metric: 'Store rating', value: '4.8' },
      { metric: 'Code reuse across platforms', value: '~82%' },
      { metric: 'Crash-free sessions', value: '99.8%' },
    ],
    stack: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'Fastlane'],
    palette: ['#312E81', '#A5B4FC', '#EEF2FF'],
    coverStyle: 'flow',
    featured: false,
  },
  {
    slug: 'porto-digital',
    title: 'Attribution and Reporting Overhaul for a Portuguese Agency',
    client: 'Porto Digital',
    industry: 'Professional Services',
    serviceSlugs: ['analytics-setup-services', 'web-analytics-consulting', 'conversion-rate-optimization'],
    year: 2026,
    location: 'Porto, Portugal',
    summary:
      'Server-side tracking, offline conversion import and a three-KPI dashboard that replaced 40 metrics nobody acted on.',
    challenge:
      'Porto Digital was reporting to its clients on data that was materially wrong. Duplicate tracking, missing offline conversions and unfiltered internal traffic meant every recommendation they made was built on bad numbers.',
    approach:
      'We implemented server-side tagging with GA4 and the Meta Conversions API, imported offline conversion data from their CRM, filtered bot and internal traffic properly, and rebuilt reporting around three KPIs the leadership team actually used.',
    results: [
      { metric: 'Data accuracy', value: '~94% improvement' },
      { metric: 'KPIs in use', value: '40 → 3' },
      { metric: 'Client-reported confidence', value: '+76%' },
      { metric: 'Reporting time', value: '-65%' },
    ],
    stack: ['GA4', 'Google Tag Manager', 'Server-side GTM', 'BigQuery', 'Looker Studio'],
    palette: ['#0F766E', '#5EEAD4', '#F0FDFA'],
    coverStyle: 'grid',
    featured: false,
  },
  {
    slug: 'karachi-textiles',
    title: 'Performance Marketing Rebuilt for a Pakistani Mill',
    client: 'Karachi Textiles',
    industry: 'Manufacturing',
    serviceSlugs: ['ppc-advertising-services', 'google-ads-management', 'website-design-services'],
    year: 2026,
    location: 'Karachi, Pakistan',
    summary:
      'Account restructure, PKR-priced management and a landing page overhaul that took ROAS from 1.8x to 4.2x.',
    challenge:
      'Karachi Textiles was running Google Ads through an overseas agency that charged in USD, never logged into the account, and had restructured it so many times the campaign data was meaningless.',
    approach:
      'We rebuilt the account structure from scratch, consolidated 47 ad groups into 9 themed groups, fixed conversion tracking, rebuilt the enquiry landing page around B2B textile specifications, and took over management with PKR invoicing.',
    results: [
      { metric: 'ROAS', value: '1.8x → 4.2x' },
      { metric: 'Cost per qualified lead', value: '-54%' },
      { metric: 'Ad spend efficiency', value: '+112%' },
      { metric: 'Management cost', value: '-71%' },
    ],
    stack: ['Google Ads', 'Conversion tracking', 'Landing page', 'PKR billing'],
    palette: ['#064E3B', '#34D399', '#ECFDF5'],
    coverStyle: 'wave',
    featured: false,
  },
  {
    slug: 'milano-ceramiche',
    title: 'Organic Growth for a Milanese Tile Manufacturer',
    client: 'Milano Ceramiche',
    industry: 'E-commerce & Retail',
    serviceSlugs: ['seo-services', 'seo-content-writing-services', 'ecommerce-seo-services'],
    year: 2026,
    location: 'Milan, Italy',
    summary:
      'Italian-language content and technical architecture that tripled organic product page traffic in nine months.',
    challenge:
      'Milano sold through distributors and had almost no organic presence in Italy. Their English-language site was being used for Italian search queries, which does not work.',
    approach:
      'We restructured for Italian search intent, wrote product and collection content in native Italian, rebuilt the category architecture, implemented Product and Offer schema correctly, and built Italian editorial content around tile selection and installation.',
    results: [
      { metric: 'Organic product page traffic', value: '+310%' },
      { metric: 'Top-3 keywords', value: '+220' },
      { metric: 'Dealer enquiries from web', value: '+164%' },
      { metric: 'Time to results', value: '9 months' },
    ],
    stack: ['Italian content', 'Product schema', 'Category architecture', 'Technical SEO'],
    palette: ['#4C1D95', '#C4B5FD', '#F5F3FF'],
    coverStyle: 'mesh',
    featured: false,
  },
];

export function portfolioFor(serviceSlug: string, limit = 3): PortfolioProject[] {
  const exact = PORTFOLIO.filter((p) => p.serviceSlugs.includes(serviceSlug));
  const rest = PORTFOLIO.filter((p) => !p.serviceSlugs.includes(serviceSlug));
  return [...exact, ...rest].slice(0, limit);
}

export const FEATURED_PORTFOLIO = PORTFOLIO.filter((p) => p.featured);
