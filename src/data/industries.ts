/**
 * Industry verticals used for:
 *   - /{industry}/ landing pages
 *   - industry-specific blog and case-study generation
 *   - service-page industry references
 */

export interface Industry {
  slug: string;
  name: string;
  /** Plural form used in lists. */
  plural: string;
  /** 1-2 sentence market context — genuinely specific, not filler. */
  context: string;
  /** What actually drives revenue for this sector online. */
  buyingTrigger: string;
  /** Typical objection we hear. */
  objection: string;
  /** Proof point shape — e.g. "lead volume", "average order value". */
  metric: string;
  /** Industries lean on specific services. */
  services: string[];
  /** Seasonality note (or empty). */
  season: string;
  /** Regulated? affects trust/E-E-A-T emphasis. */
  regulated: boolean;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'home-services',
    name: 'Home Services',
    plural: 'Home Services',
    context:
      'Roofing, HVAC, plumbing, electrical and landscaping businesses compete almost entirely on local search visibility and speed to lead. A generic template and a slow site cost them calls every single day.',
    buyingTrigger: 'A full inbox and a calendar that is booked out two weeks out',
    objection: '"A local guy already gave me a website for less."',
    metric: 'Calls and booked jobs per month',
    services: ['', 'local-seo-services', 'ppc-advertising-services', 'google-ads-management'],
    season: 'Spring and summer are peak; builds should launch 6–8 weeks before',
    regulated: false,
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    plural: 'Healthcare Practices',
    context:
      'Medical, dental, veterinary and therapy practices must satisfy Google\'s YMYL quality bar. Author credentials, accurate information and clear trust signals decide whether you rank at all — and whether anyone books.',
    buyingTrigger: 'New patient enquiries that actually convert to booked appointments',
    objection: '"Will you guarantee we stay compliant with our professional regulator?"',
    metric: 'Booked appointments from organic search',
    services: ['', 'seo-services', 'local-seo-services', 'content-marketing-services'],
    season: 'January and September are the biggest demand spikes',
    regulated: true,
  },
  {
    slug: 'legal-services',
    name: 'Legal Services',
    plural: 'Law Firms',
    context:
      'Legal marketing is competitive, high-ticket and heavily regulated. Trust, credentials and clear practice-area structure decide everything. Bad SEO here is expensive in both fees and reputation.',
    buyingTrigger: 'Qualified consultations from people who can actually afford the case',
    objection: '"I am worried about advertising rules in my jurisdiction."',
    metric: 'Consultation requests and cost per lead',
    services: ['', 'seo-services', 'ppc-advertising-services', 'content-marketing-services'],
    season: 'Q1 and Q4 spike after new year and year-end tax planning',
    regulated: true,
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    plural: 'Real Estate Professionals',
    context:
      'Agents, brokers and property developers live and die by lead quality. Listings need to be found, syndicated and converted fast — and the site is often the first filter on whether a buyer takes the call.',
    buyingTrigger: 'Qualified buyer and seller leads, not raw traffic',
    objection: '"The MLS already sends me leads — do I need a website?"',
    metric: 'Lead quality and listing-page views',
    services: ['', 'seo-services', 'ppc-advertising-services', 'landing-page-design'],
    season: 'Spring and summer are overwhelmingly strongest',
    regulated: false,
  },
  {
    slug: 'ecommerce',
    name: 'E-commerce',
    plural: 'E-commerce Brands',
    context:
      'Every percentage point of conversion and every millisecond of load time moves directly to revenue. E-commerce is the most measurable environment for design and SEO work — and the most unforgiving.',
    buyingTrigger: 'Higher average order value and lower acquisition cost',
    objection: '"We are on Shopify — can you actually make it faster?"',
    metric: 'Conversion rate, AOV and LCP',
    services: ['ecommerce-website-design', 'ecommerce-seo-services', 'shopify-website-design', 'conversion-rate-optimization'],
    season: 'Q4 is critical; planning must start in August',
    regulated: false,
  },
  {
    slug: 'saas',
    name: 'SaaS & Technology',
    plural: 'SaaS Companies',
    context:
      'Technical buyers read your site like a spec sheet. Performance, documentation clarity, technical accuracy and speed all signal company quality before anyone speaks to sales.',
    buyingTrigger: 'Qualified demos and trials from the right segment',
    objection: '"Our engineers could build this themselves."',
    metric: 'Demo requests and trial-to-paid conversion',
    services: ['', 'ui-ux-design', 'seo-content-writing-services', 'ai-integration-services'],
    season: 'Q1 budgets renew; Q4 slows',
    regulated: false,
  },
  {
    slug: 'hospitality-tourism',
    name: 'Hospitality & Tourism',
    plural: 'Hospitality & Tourism Businesses',
    context:
      'Hotels, restaurants, tour operators and travel brands compete on visual appeal and direct bookings. Taking commission out of every booking is the entire financial argument for a strong direct channel.',
    buyingTrigger: 'Direct bookings instead of paying OTA commission',
    objection: '"Our guests mostly find us through OTAs anyway."',
    metric: 'Direct bookings and revenue per available room',
    services: ['', 'video-production-services', 'seo-services', 'reputation-management'],
    season: 'Bookings spike 3–5 months before the actual trip',
    regulated: false,
  },
  {
    slug: 'restaurant-food',
    name: 'Restaurants & Food',
    plural: 'Restaurants & Food Businesses',
    context:
      'Restaurants need to win the map pack, look excellent on mobile, and make ordering effortless. The site has three jobs: get found, look appetising, take the order.',
    buyingTrigger: 'Covers, direct orders and catering enquiries',
    objection: '"Our customers are mostly repeat walk-ins."',
    metric: 'Reservations and direct orders',
    services: ['', 'local-seo-services', 'social-media-management', 'graphic-design-services'],
    season: 'Peak is November–December and May–September in most markets',
    regulated: false,
  },
  {
    slug: 'construction-trades',
    name: 'Construction & Trades',
    plural: 'Construction & Trades',
    context:
      'Contractors win or lose on project photos, credibility signals and a frictionless quote request. Most contractor websites look like 2012 and cost them work daily.',
    buyingTrigger: 'Qualified quote requests in their service area',
    objection: '"I get most of my work from word of mouth."',
    metric: 'Quote requests by service area',
    services: ['', 'website-maintenance', 'local-seo-services', 'video-production-services'],
    season: 'Spring through autumn; winter is slow',
    regulated: false,
  },
  {
    slug: 'financial-services',
    name: 'Financial Services',
    plural: 'Financial Services Firms',
    context:
      'Banks, lenders, accountants and insurance brokers are held to strict advertising and data-handling standards. Trust, security and clarity are non-negotiable, and mistakes are heavily penalised.',
    buyingTrigger: 'Qualified consultations from people ready to convert',
    objection: '"Compliance review takes months — can we move faster?"',
    metric: 'Consultation requests and cost per qualified lead',
    services: ['', 'seo-services', 'web-security-services', 'crm-integration-services'],
    season: 'Tax season (Jan–Apr) is the biggest driver',
    regulated: true,
  },
  {
    slug: 'education',
    name: 'Education & Training',
    plural: 'Education & Training Organisations',
    context:
      'Schools, universities, training providers and course creators compete for enrolment. Content depth, course clarity and enrolment friction determine whether interest converts.',
    buyingTrigger: 'Enrolments and course registrations',
    objection: '"Can you integrate with our existing LMS?"',
    metric: 'Enrolment conversion rate',
    services: ['', 'seo-services', 'video-production-services', 'custom-software-development'],
    season: 'August–September and January',
    regulated: false,
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing & Industrial',
    plural: 'Manufacturers',
    context:
      'B2B industrial buyers are engineers and procurement specialists. They need specifications, certifications, capability evidence and a contact who answers — not lifestyle photography.',
    buyingTrigger: 'Qualified RFQs from buyers in your capability area',
    objection: '"Our team is bad at updating the website."',
    metric: 'RFQ volume and quality',
    services: ['', 'website-development', 'seo-services', 'video-production-services'],
    season: 'Q3 and Q4 are strongest for capital expenditure',
    regulated: false,
  },
  {
    slug: 'nonprofits',
    name: 'Nonprofits & NGOs',
    plural: 'Nonprofit Organisations',
    context:
      'Nonprofits compete for attention against vastly better-funded organisations. Story, clarity and a frictionless donate path matter more than visual sophistication.',
    buyingTrigger: 'Donations, volunteers and grant visibility',
    objection: '"We have almost no budget."',
    metric: 'Donation conversion and volunteer signups',
    services: ['', 'content-marketing-services', 'graphic-design-services', 'donation-page-optimization'],
    season: 'Year-end giving season is December',
    regulated: false,
  },
  {
    slug: 'fitness-wellness',
    name: 'Fitness & Wellness',
    plural: 'Fitness & Wellness Brands',
    context:
      'Gyms, studios, wellness brands and supplement companies sell on aspiration and proof. Visual quality, transformation content and community signals drive decisions.',
    buyingTrigger: 'Trial bookings and membership sign-ups',
    objection: '"Our current agency just posts on Instagram."',
    metric: 'Trial-to-member conversion rate',
    services: ['', 'social-media-marketing', 'influencer-marketing-services', 'video-production-services'],
    season: 'January is the biggest joining month of the year',
    regulated: false,
  },
  {
    slug: 'automotive',
    name: 'Automotive',
    plural: 'Automotive Businesses',
    context:
      'Dealerships, repair shops and auto detailers live on local search and reputation. A slow site with bad reviews loses the customer before they ever call.',
    buyingTrigger: 'Service bookings and test drive requests',
    objection: '"Our manufacturer already provides a website."',
    metric: 'Service bookings and calls',
    services: ['', 'local-seo-services', 'reputation-management', 'ppc-advertising-services'],
    season: 'Spring and autumn (tax refund and pre-winter service)',
    regulated: false,
  },
  {
    slug: 'beauty-cosmetics',
    name: 'Beauty & Cosmetics',
    plural: 'Beauty & Cosmetics Brands',
    context:
      'Visual-first brands where the product photography, creator content and social proof do the selling. Discovery happens on Instagram and TikTok, and the site has to convert it.',
    buyingTrigger: 'Direct-to-consumer revenue and repeat purchase rate',
    objection: '"We get most of our sales from Instagram."',
    metric: 'Direct revenue share and AOV',
    services: ['', 'influencer-marketing-services', 'ecommerce-website-design', 'social-media-marketing'],
    season: 'November–December for gifting',
    regulated: false,
  },
  {
    slug: 'logistics-shipping',
    name: 'Logistics & Shipping',
    plural: 'Logistics & Shipping Companies',
    context:
      'Freight, courier and 3PL businesses need quote requests that route correctly, tracking that customers can find, and trust signals that survive a compliance audit.',
    buyingTrigger: 'Quote requests routed to the right depot',
    objection: '"Our TMS already generates quotes."',
    metric: 'Quote request volume and routing accuracy',
    services: ['', 'custom-software-development', 'website-development', 'crm-integration-services'],
    season: 'Q4 peak for retail shipping',
    regulated: false,
  },
  {
    slug: 'insurance',
    name: 'Insurance',
    plural: 'Insurance Providers',
    context:
      'Brokers and carriers compete on quote speed and trust. A slow quote form is a lost lead, and uninsured content is a compliance problem.',
    buyingTrigger: 'Quote requests completed without abandonment',
    objection: '"Can your site pass our compliance review?"',
    metric: 'Quote completion rate',
    services: ['', 'conversion-rate-optimization', 'seo-services', 'crm-integration-services'],
    season: 'Open enrolment periods vary by state',
    regulated: true,
  },
  {
    slug: 'architecture-interior',
    name: 'Architecture & Interior Design',
    plural: 'Architecture & Interior Design Studios',
    context:
      'Design studios sell on visuals above all else. A portfolio that loads fast and presents work beautifully is the primary sales asset they have.',
    buyingTrigger: 'Project enquiries from the right client type',
    objection: '"We already have a beautiful portfolio on Behance."',
    metric: 'Project enquiry volume',
    services: ['3d-website-design', '', 'video-production-services', 'ui-ux-design'],
    season: 'Q1 is strongest for residential projects',
    regulated: false,
  },
  {
    slug: 'accounting-tax',
    name: 'Accounting & Tax',
    plural: 'Accounting & Tax Firms',
    context:
      'Accountants and tax advisers sell on trust and deadline urgency. Their busiest weeks are the ones where the website has to work perfectly without them.',
    buyingTrigger: 'New client consultations ahead of tax deadlines',
    objection: '"My website is fine, I just need it found."',
    metric: 'Consultation bookings',
    services: ['', 'local-seo-services', 'seo-services', 'content-marketing-services'],
    season: 'January–April is the dominant period',
    regulated: true,
  },
];

export const INDUSTRY_BY_SLUG: Record<string, Industry> = Object.fromEntries(
  INDUSTRIES.map((i) => [i.slug, i]),
);
