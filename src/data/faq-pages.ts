/** Site-level FAQ sets used by the FAQ index and page enrichment. */

export interface FaqItem {
  q: string;
  a: string;
}

export const SITE_FAQ_SETS: FaqItem[] = [
  {
    q: 'How do payments work?',
    a: 'We accept PayPal (including card payment completed inside PayPal\'s secure checkout), US bank transfer, and cryptocurrency (USDT, Bitcoin or Ethereum) on request. We deliberately do not use Stripe. You pay the invoice from your own account, and we never take a cut of your media budget. Project fees under $1,000 are typically paid 100% upfront; larger projects split 50% on approval and 50% on delivery, with interest-free payment plans available above $1,000.',
  },
  {
    q: 'What exactly is included in a website design package?',
    a: 'Every package includes custom responsive design built from a blank file, a CMS so you can update your own content, on-page SEO setup (titles, descriptions, heading structure, internal links, canonicals, Open Graph), the appropriate structured data for the page type, mobile-first layouts, analytics and Search Console setup, SSL, and post-launch support. Nothing on that list is an upsell.',
  },
  {
    q: 'How do unlimited revisions actually work?',
    a: 'You get unlimited revisions on the design direction you choose. We work in structured rounds: you send one consolidated list of feedback, we return the revised design. What we ask in return is that revisions stay within the agreed direction — a materially different concept after approval is a new design, and we will say so and quote it rather than quietly absorbing it. In practice, three focused rounds gets almost every project to approval.',
  },
  {
    q: 'What happens if the project runs late?',
    a: 'We agree a delivery date in the written scope before work begins. If we will miss it by more than five business days for reasons within our control, we tell you before the original date and offer 20% off the project fee. If the delay is caused by late content or approvals from your side, we re-baseline the date in writing rather than pretending it did not move.',
  },
  {
    q: 'Who will actually do the work?',
    a: 'You get a named project manager and a named designer or developer, not a shared inbox. The team is distributed across time zones, which is why we keep hours overlapping by at least four with US Eastern — you get a same-day reply on almost every message. You will know exactly who is on your project and what they are working on.',
  },
  {
    q: 'Do you work with clients outside the United States?',
    a: `Yes. We serve ${38} countries including the UK, Canada, Australia, New Zealand, the UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman, Iraq, Pakistan, India, Bangladesh, Singapore, Malaysia, Indonesia, the Philippines, Egypt, Nigeria, South Africa, Kenya, Germany, France, Spain, Italy, the Netherlands, Switzerland, Sweden, Poland, Ireland, Türkiye, Brazil, Mexico, Argentina, Colombia and Chile. Every package is priced in your local currency and the copy is written in your market\'s language, not exported US content.`,
  },
  {
    q: 'What makes you different from a cheaper agency?',
    a: 'We are not the cheapest and do not try to be. The difference is predictability: a published fixed price, a written scope with explicit exclusions, an agreed delivery date, unlimited revisions on the chosen direction, and full ownership of the code, design and content transferred to you on final payment. Cheaper providers typically hide the scope, change the price mid-project, or retain your site and content. We do none of those things.',
  },
  {
    q: 'Can I edit the website myself after launch?',
    a: 'Yes. Every build includes a CMS with sensible fields, plus a recorded walkthrough and a written guide. Publishing a page, post or product should never require opening a support ticket. If you would rather we handled ongoing updates, we offer monthly care plans covering updates, security patching, uptime monitoring and a small block of monthly changes.',
  },
  {
    q: 'What if I want to change scope mid-project?',
    a: 'Tell us and we will quote the change in writing before doing any work on it, with a revised price and a revised delivery date. We will never add anything to your invoice without your explicit agreement. Most scope changes are small and we handle them without drama — the rule is simply that nothing gets billed silently.',
  },
  {
    q: 'Is my content SEO-friendly too, or only the design?',
    a: 'Both. The build includes on-page SEO at the page level, but content quality is a separate discipline. If you need content written, our content marketing and content writing services cover research, specialist writing, editing and internal linking. If you would rather write it yourself, we will give you briefs and a checklist so the pages are structured correctly for search.',
  },
  {
    q: 'Do you offer a free audit?',
    a: 'Yes, for SEO-related work. Submit your URL and we will deliver a full audit within 48 hours covering technical health, Core Web Vitals, on-page SEO, local visibility, AI search presence and conversion friction, with findings ranked by impact and effort. You can action it yourself if you prefer — roughly half the people who request it do not hire us, which is fine.',
  },
  {
    q: 'What is GEO, AEO and SXO?',
    a: 'GEO (Generative Engine Optimisation) is being cited inside AI answers from ChatGPT, Perplexity, Gemini and AI Overviews. AEO (Answer Engine Optimisation) is winning featured snippets, People Also Ask boxes and voice answers. SXO (Search Experience Optimisation) is making sure the result actually satisfies the user once they land. We run all three alongside classic SEO, because buyer behaviour is genuinely shifting and retrofitting later is more expensive than building for it now.',
  },
  {
    q: 'What is llms.txt and why do you produce one?',
    a: 'llms.txt is a plain-text file at your domain root that tells AI systems what your site is, who it serves and which pages matter most. We produce two: a concise map for fast retrieval and a detailed per-page document covering every service, package, region and city. It is part of our GEO package, and we publish ours at /llms.txt and /llms-detailed.txt as a working reference.',
  },
  {
    q: 'How do you handle accessibility?',
    a: 'Every build is tested against WCAG 2.1 Level AA. That means text contrast of at least 4.5:1, full keyboard operability, visible focus states, labelled form inputs, alternative text on meaningful images, and captions on video. It is far cheaper to design for from the start than to retrofit, which is why it is a build requirement rather than an add-on.',
  },
  {
    q: 'What are your guarantees?',
    a: 'Full refund if work has not started. If you are not satisfied with the design after three structured revision rounds, you can cancel for a full refund minus completed work. If we miss an agreed delivery date by more than five business days for reasons within our control, 20% off the project fee. And on every project, you own the code, design files, content and domain on final payment — there is no hosting hostage situation.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes, happily, and usually before the first substantive conversation. Our standard terms already treat your business information as confidential, but we will sign your NDA if you have one.',
  },
  {
    q: 'Can you work with our existing brand identity?',
    a: 'Yes. If you have brand guidelines we build to them. If you have a logo but no guidelines, we will build a working system from your existing assets. If you have neither, we can pair the website build with our logo design and branding services so the identity and the site are designed together rather than sequentially.',
  },
  {
    q: 'Will my website work in multiple languages?',
    a: 'Yes. We build multilingual architecture with proper hreflang, locale-aware URLs, translated navigation and separately optimisable content per market. For Arabic markets we handle genuine right-to-left layout and typography rather than mirroring a Latin design. For French and Canadian French we write natively rather than machine-translating.',
  },
];

export const CASE_FAQ_SETS: FaqItem[] = [
  {
    q: 'How do you verify the results in your case studies?',
    a: 'Every number published on this site was measured after launch using analytics, Search Console, Google Business Profile data or the client\'s own CRM, and confirmed with the client. We do not publish projections as results, and we do not include figures we cannot evidence.',
  },
  {
    q: 'Will my project look like these case studies?',
    a: 'No, and it should not. Each build is designed from a blank file against your brief, your market and your buyers. These are representative of the quality and process we work to, not templates we resell.',
  },
  {
    q: 'Can I speak to a reference client?',
    a: 'Yes. Ask when you enquire and we will connect you with a client in your sector and market. Roughly three quarters of our clients are happy to take a call, and we will be upfront if a given reference prefers not to.',
  },
];
