/**
 * Free tools.
 *
 * These are lead magnets: genuinely useful, free, client-side utilities that
 * a web-design agency would plausibly offer. They are implemented as
 * self-contained browser-side widgets (no external scripts, no server
 * processing, no data leaves the browser), which is both faster and more
 * private than embedding a third-party tool.
 *
 * Each tool is a page at:
 *   /tools/{slug}/                    — root (USA) page
 *   /{country}/tools/{slug}/          — clustered regional page
 *   /{country}/{city}/tools/{slug}/   — city-level page
 *
 * The regional clustering is the point: an "invoice generator" in Germany
 * should speak to German buyers, use EUR, mention German invoicing rules and
 * link to the German service pages.
 */

export type ToolCategory = 'content' | 'design' | 'developer' | 'business' | 'seo' | 'security';

export interface Tool {
  slug: string;
  name: string;
  /** Exact-match primary keyword for the root page. */
  primaryKeyword: string;
  category: ToolCategory;
  icon: string;
  hue: number;
  tagline: string;
  summary: string;
  /** Longer description used in the meta description and body. */
  description: string;
  /** What the tool actually does — shown as a bullet list. */
  features: string[];
  /** How to use it — numbered steps. */
  howTo: string[];
  /** Realistic use cases for the target buyer. */
  useCases: string[];
  /** Free limits / what the free tier covers. */
  freeTier: string[];
  /** The widget key — maps to an implementation in tools-widgets.ts. */
  widget: string;
  /** The service this tool naturally leads into. */
  primaryService: string;
  /** Supporting service links. */
  relatedServices: string[];
  /** FAQ pairs. */
  faqs: { q: string; a: string }[];
  /** Optional locale-specific note rendered under the widget. */
  localNote: (region: string) => string;
}

export const TOOL_CATEGORIES: { key: ToolCategory; name: string; blurb: string }[] = [
  { key: 'content', name: 'Content Tools', blurb: 'Write, rewrite and check copy without leaving your browser.' },
  { key: 'design', name: 'Design Tools', blurb: 'Colours, icons, images and brand assets generated instantly.' },
  { key: 'developer', name: 'Developer Tools', blurb: 'Schema, sitemaps, tracking and technical SEO essentials.' },
  { key: 'seo', name: 'SEO Tools', blurb: 'Check how your pages look in search and how fast they load.' },
  { key: 'business', name: 'Business Tools', blurb: 'Invoices, links and the admin busywork of running a business.' },
  { key: 'security', name: 'Security Tools', blurb: 'Passwords, hashes and exposure checks.' },
];

export const TOOLS: Tool[] = [
  {
    slug: 'ai-humanizer',
    name: 'AI Humanizer',
    primaryKeyword: 'Free AI Humanizer Tool',
    category: 'content',
    icon: 'sparkle',
    hue: 280,
    tagline: 'Make AI-written copy read like a person wrote it.',
    summary:
      'A free AI humanizer that rewrites robotic-sounding text into natural, human prose — and tells you exactly which patterns gave the writing away.',
    description:
      'Our free AI humanizer rewrites stiff, machine-sounding copy into natural prose. It is built for agencies, founders and marketers who use AI as a drafting tool but need the final read to sound genuinely human.',
    features: [
      'Rewrites stiff or repetitive passages into varied, natural prose',
      'Flags the AI tells — hedging, filler transitions, sentence-length uniformity',
      'Adjustable formality so you can match your own brand voice',
      'Reads and rewrites in the browser — your text is never uploaded',
      'Works with English and the Latin-script languages we support',
    ],
    howTo: [
      'Paste your draft into the editor',
      'Choose a tone — natural, professional, or conversational',
      'Set the strength of rewrite you want',
      'Copy the result back into your draft and read it once for sense',
    ],
    useCases: [
      'Turning an AI first draft into client-ready copy',
      'Removing the tells before publishing a blog post',
      'Matching an existing brand voice across a batch of pages',
      'Cleaning up product descriptions written with AI assistance',
    ],
    freeTier: [
      'Unlimited rewrites',
      'No account required',
      'Runs entirely in your browser — nothing is uploaded',
      'No watermark on the output',
    ],
    widget: 'humanizer',
    primaryService: 'content-marketing-services',
    relatedServices: ['seo-content-writing-services', 'content-writing-services', 'copywriting-services'],
    faqs: [
      {
        q: 'Is this AI humanizer free?',
        a: 'Yes, completely free, with no account and no watermark. It runs entirely in your browser, so nothing you paste is ever sent to a server.',
      },
      {
        q: 'Will it get my content past AI detectors?',
        a: 'That is not what it is for, and we would not promise it if it were — detectors are unreliable and optimising against them is a bad strategy. What it does is remove the writing patterns that make text feel machine-generated, so the copy reads better to actual humans.',
      },
      {
        q: 'How is it different from asking a chatbot to rewrite it?',
        a: 'A chatbot rewrite is a second draft from a general-purpose model. This tool targets specific, named patterns — sentence-length uniformity, hedge stacks, empty transitions, rule-of-three overuse — and shows you which ones it found.',
      },
      {
        q: 'Can I use it on client work?',
        a: 'Yes. There is no restriction on commercial use, and the tool does not store or transmit your text.',
      },
    ],
    localNote: (region) =>
      `Works with English and Latin-script copy, so it is equally usable for teams writing in ${region}. If you need it in Arabic, Hindi or Thai, ask us — we can help with a native-language editorial pass instead.`,
  },
  {
    slug: 'text-clipper',
    name: 'Text Clipper',
    primaryKeyword: 'Free Online Text Clipper Tool',
    category: 'content',
    icon: 'scissors',
    hue: 355,
    tagline: 'Extract, clean and reformat the exact text you need.',
    summary:
      'Paste a wall of text and pull out only what you want — sentences, paragraphs, links, headings, email addresses or any pattern you choose.',
    description:
      'A free text clipper that extracts exactly the part of a page you need. Paste any block of text, choose what to pull out, and get clean, formatted output instantly.',
    features: [
      'Extract emails, phone numbers, URLs and hashtags automatically',
      'Pull out headings, list items, sentences or paragraphs',
      'Split long text into clean paragraphs by sentence length',
      'Remove duplicates, extra whitespace and empty lines',
      'Convert between plain text, Markdown and HTML',
      'Character and word counter for any extracted block',
    ],
    howTo: [
      'Paste your text into the left panel',
      'Pick an extraction rule or write your own pattern',
      'Review the extracted result in the right panel',
      'Copy it or download it',
    ],
    useCases: [
      'Pulling a competitor page structure for analysis',
      'Extracting contact details from a directory listing',
      'Cleaning scraped copy before it goes into a content brief',
      'Splitting a long transcript into publishable sections',
    ],
    freeTier: [
      'Unlimited extractions',
      'Custom pattern matching with regular expressions',
      'Runs in the browser — nothing is uploaded',
      'Markdown and HTML export included',
    ],
    widget: 'clipper',
    primaryService: 'content-marketing-services',
    relatedServices: ['seo-content-writing-services', 'copywriting-services', 'web-scraping-tools'],
    faqs: [
      {
        q: 'Is there a limit on how much text I can clip?',
        a: 'There is no hard limit. The tool handles very large documents in the browser, and we have tested it well past what you would normally paste.',
      },
      {
        q: 'Can I use regular expressions?',
        a: 'Yes. Switch to custom pattern mode and write a regular expression, and the tool will pull every match with its surrounding context.',
      },
      {
        q: 'Does my text get sent anywhere?',
        a: 'No. The entire tool runs client-side, so your pasted content never leaves the device.',
      },
      {
        q: 'Can I use this to scrape competitor content?',
        a: 'You can analyse competitor copy for structure and messaging — that is legitimate competitive research. What you cannot do is republish it, and copying competitor text is both a legal and an SEO liability.',
      },
    ],
    localNote: (region) =>
      `Useful for teams in ${region} who need to standardise copy across many local landing pages — a common need once a business branches out beyond its home city.`,
  },
  {
    slug: 'invoice-generator',
    name: 'Invoice Generator',
    primaryKeyword: 'Free Invoice Generator',
    category: 'business',
    icon: 'receipt',
    hue: 45,
    tagline: 'Create a professional PDF invoice in seconds.',
    summary:
      'A free invoice generator that produces a clean, professional PDF invoice you can download and send — no account, no sign-up, no watermark.',
    description:
      'Create and download a professional invoice as a PDF. Add your business details, the client, the line items and the tax — then export. Free, with no account required and nothing uploaded.',
    features: [
      'Professional PDF layout with your logo and brand colours',
      'Automatic line-item totals, discounts and tax calculation',
      'Payment terms, due dates and a note section',
      'Your currency and your local tax rules',
      'Numbering, sequential invoice references and a client ledger',
      'Download as PDF or print straight to paper',
    ],
    howTo: [
      'Enter your business details once — we remember them for next time',
      'Add the client and the line items',
      'Set the tax rate and payment terms for your jurisdiction',
      'Download the PDF and send it',
    ],
    useCases: [
      'Invoicing clients for web design or development work',
      'Bills for freelance or contract work',
      'Retainer invoices for ongoing marketing retainers',
      'Any small business that needs a professional invoice today',
    ],
    freeTier: [
      'Unlimited invoices',
      'No watermark and no account required',
      'PDF download and print',
      'Client ledger that remembers every invoice you issued',
    ],
    widget: 'invoice',
    primaryService: 'website-design-services',
    relatedServices: ['crm-integration-services', 'website-development', 'ecommerce-website-design'],
    faqs: [
      {
        q: 'Do you store my invoices?',
        a: 'The invoice ledger is held in your browser only, so it is private to you and clears when you clear browser data. Download a PDF for a permanent copy.',
      },
      {
        q: 'Is it really free with no limits?',
        a: 'Yes. There is no account, no watermark and no invoice cap. The tool is funded by the agency services rather than by a paywall.',
      },
      {
        q: 'Does it handle my local tax rules?',
        a: 'You enter the tax rate that applies to your transaction, and the tool applies it and itemises it on the invoice. For anything more specific, speak to a local accountant.',
      },
      {
        q: 'Can I add my logo and brand colours?',
        a: 'Yes — upload a logo and pick your brand colours, and the invoice renders with them.',
      },
    ],
    localNote: (region) =>
      `Set your currency and tax rate for ${region} and the invoice handles the rest — so a business in ${region} can send a compliant-looking bill without touching a template.`,
  },
  {
    slug: 'image-compressor',
    name: 'Image Compressor & WebP Converter',
    primaryKeyword: 'Free Image Compressor to WebP',
    category: 'design',
    icon: 'image',
    hue: 200,
    tagline: 'Shrink images, convert to WebP, check the saving.',
    summary:
      'Compress images and convert them to WebP right in your browser, with a live before-and-after size comparison. Nothing is uploaded to a server.',
    description:
      'A free image compressor and WebP converter. Compress JPG, PNG or WebP files, convert between formats, and see exactly how many kilobytes you saved.',
    features: [
      'Lossy and lossless compression with a quality slider',
      'Convert between JPG, PNG and WebP',
      'Batch processing of multiple files',
      'Live before-and-after file size and quality comparison',
      'Optional resizing and aspect-ratio locking',
      'Everything happens locally in your browser',
    ],
    howTo: [
      'Drop your images in, or browse for them',
      'Set the quality and target format',
      'Compare the original and compressed sizes',
      'Download the optimised files',
    ],
    useCases: [
      'Getting a slow site under a Core Web Vitals threshold',
      'Preparing product images for a Shopify store',
      'Compressing blog illustrations before upload',
      'Reducing email newsletter image weight',
    ],
    freeTier: [
      'Unlimited files and unlimited size',
      'No upload — files never leave your device',
      'Batch mode included',
      'No account and no watermark',
    ],
    widget: 'compressor',
    primaryService: 'core-web-vitals-optimization',
    relatedServices: ['website-development', 'image-optimization-services', 'ecommerce-website-design'],
    faqs: [
      {
        q: 'Is it safe to compress confidential images?',
        a: 'Yes, because the images never leave your browser. The compression happens with WebAssembly locally, so nothing is transmitted anywhere.',
      },
      {
        q: 'How much can I actually save?',
        a: 'For photographs, 60–80% by converting to WebP at a sensible quality. For screenshots and flat graphics, PNG to WebP often saves 90% or more.',
      },
      {
        q: 'Will my images look worse?',
        a: 'Not visibly at the quality we default to. The slider lets you compare, and the visual difference below roughly 75% quality is usually invisible on a normal display.',
      },
      {
        q: 'Should I use WebP or AVIF?',
        a: 'WebP is the safe default — universal support and excellent compression. AVIF compresses further but is slower to decode, so it is better used with a WebP fallback.',
      },
    ],
    localNote: (region) =>
      `Particularly valuable where customers browse on mobile data rather than office Wi-Fi — which is the normal case for most consumer traffic in ${region}.`,
  },
  {
    slug: 'color-palette-generator',
    name: 'Color Palette Generator',
    primaryKeyword: 'Free Color Palette Generator',
    category: 'design',
    icon: 'palette',
    hue: 320,
    tagline: 'Build a palette that passes contrast checks.',
    summary:
      'Generate colour palettes from a seed colour, and check every pairing against WCAG contrast requirements before you commit to it.',
    description:
      'A free colour palette generator that understands accessibility. Pick a seed colour, get a balanced palette, and see the contrast ratio of every pairing you need for a real design.',
    features: [
      'Palettes generated from a seed colour or an uploaded image',
      'WCAG 2.1 AA and AAA contrast checks on every pairing',
      'Tints, shades and neutral ramps for each colour',
      'One-click copy as HEX, RGB, HSL or CSS variables',
      'Export a ready-to-use CSS custom property block',
    ],
    howTo: [
      'Enter a seed colour or upload an image',
      'Adjust the number of shades per colour',
      'Check the contrast ratios of the pairings you plan to use',
      'Export the palette in the format you need',
    ],
    useCases: [
      'Building a brand colour system from scratch',
      'Checking a design meets accessibility before you ship it',
      'Extracting a palette from a client photo or logo',
      'Producing a token set for a design system',
    ],
    freeTier: [
      'Unlimited palettes',
      'Full WCAG contrast validation',
      'CSS variable export',
      'No account required',
    ],
    widget: 'palette',
    primaryService: 'branding-services',
    relatedServices: ['ui-ux-design', 'website-design-services', 'print-design-services'],
    faqs: [
      {
        q: 'What contrast ratio do I need?',
        a: 'WCAG 2.1 AA requires 4.5:1 for normal body text and 3:1 for large text (18pt or bold). AAA is 7:1 and 4.5:1. The tool labels every pair against both levels.',
      },
      {
        q: 'How many colours should a brand have?',
        a: 'Fewer than people expect. One primary, one or two supporting, a set of neutrals and one accent works for almost every interface. The generator defaults to that structure.',
      },
      {
        q: 'Can I upload a logo and get its colours?',
        a: 'Yes, upload any image and the tool extracts the dominant colours from it.',
      },
    ],
    localNote: (region) =>
      `Useful for teams in ${region} that need a palette that satisfies both WCAG and the local advertising or accessibility expectations their buyers assume.`,
  },
  {
    slug: 'favicon-generator',
    name: 'Favicon Generator',
    primaryKeyword: 'Free Favicon Generator',
    category: 'design',
    icon: 'star',
    hue: 190,
    tagline: 'Every icon size browsers actually request.',
    summary:
      'Generate a complete favicon set from a single image — ICO, PNG, SVG and Apple touch icons — with a live preview of how it looks in a browser tab.',
    description:
      'A free favicon generator. Upload one image and get the complete set of icons modern browsers request, in every format and size, with a preview of the result in a browser tab.',
    features: [
      'ICO, PNG, SVG and Apple touch icon output',
      'All the sizes browsers and platforms actually request',
      'Live preview in a simulated browser tab and mobile home screen',
      'Dark mode and light mode variants',
      'One-click zip download of the full set',
    ],
    howTo: [
      'Upload a square source image, or start from a letter mark',
      'Adjust the padding and background',
      'Preview it on a light and a dark tab',
      'Download the set and drop it into your site',
    ],
    useCases: [
      'Adding a proper icon set during a website build',
      'Updating an old site that still has a favicon from 2011',
      'Producing icons for a PWA manifest',
      'White-labelling a template for a client',
    ],
    freeTier: [
      'Full icon set included',
      'No account required',
      'Dark and light variants',
      'Free download, no watermark',
    ],
    widget: 'favicon',
    primaryService: 'website-design-services',
    relatedServices: ['website-development', 'branding-services', 'logo-design-services'],
    faqs: [
      {
        q: 'Which sizes do I actually need?',
        a: '16, 32 and 48px PNG, a 180px Apple touch icon, a 512px PWA icon, an ICO for legacy Windows, and an SVG for modern browsers. The tool produces all of them.',
      },
      {
        q: 'Does my favicon affect SEO?',
        a: 'Not directly, but it affects click-through rate in search results, and a missing or broken icon reads as an unmaintained site to a sceptical buyer.',
      },
      {
        q: 'What about the Apple home screen icon?',
        a: 'That is the 180px Apple touch icon, and it is the one most often missing. A site without it shows a screenshot of the page in the home screen, which looks broken.',
      },
    ],
    localNote: (region) =>
      `A small but real conversion detail for businesses in ${region} competing on mobile, where the tab icon is often the only brand cue a visitor sees.`,
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    primaryKeyword: 'Free QR Code Generator',
    category: 'business',
    icon: 'filter',
    hue: 150,
    tagline: 'Print-ready QR codes with your colours and logo.',
    summary:
      'Generate a QR code for a URL, text, vCard, Wi-Fi, email or event — branded with your colours and logo, and exported as SVG or PNG.',
    description:
      'A free QR code generator for URLs, contact details, Wi-Fi, events and product packaging. Customise colours, add a logo, and export as a print-ready SVG or PNG.',
    features: [
      'URL, plain text, vCard, Wi-Fi, email, SMS and event formats',
      'Custom colours and an optional centre logo',
      'Error-correction level control',
      'Vector SVG export for print and PNG for web',
      'Instant preview at realistic sizes',
    ],
    howTo: [
      'Choose what the code should point to',
      'Enter the content and pick your colours',
      'Set the size you need to print at',
      'Export as SVG for print or PNG for web',
    ],
    useCases: [
      'Packaging and labels for a product range',
      'Table tents and counter cards in a shop',
      'Posters and print advertising',
      'Event badges and packaging inserts',
    ],
    freeTier: [
      'Unlimited codes',
      'Print-ready SVG export',
      'No branding on the code itself',
      'No account required',
    ],
    widget: 'qr',
    primaryService: 'print-design-services',
    relatedServices: ['graphic-design-services', 'ebook-design-services', 'branding-services'],
    faqs: [
      {
        q: 'Do the QR codes expire?',
        a: 'No. The code is generated entirely in your browser, so it encodes the destination permanently. It only stops working if the URL it points to stops working.',
      },
      {
        q: 'Can I put my logo in the middle?',
        a: 'Yes. We raise the error-correction level to compensate for the logo area, so the code still scans reliably.',
      },
      {
        q: 'What size should I print it at?',
        a: 'At least 2cm by 2cm for print, larger for distance. The preview shows how it reads at a few realistic sizes.',
      },
    ],
    localNote: (region) =>
      `Popular with retail and hospitality businesses across ${region} that want packaging and counter materials produced without a design agency retainer.`,
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    primaryKeyword: 'Free Strong Password Generator',
    category: 'security',
    icon: 'lock',
    hue: 150,
    tagline: 'Strong passwords, generated locally, never transmitted.',
    summary:
      'Generate genuinely strong passwords and passphrases with a live entropy estimate, plus a local check that tells you how long a leaked password would take to crack.',
    description:
      'A free password generator that runs entirely in your browser. Cryptographically strong passwords and passphrases, with a real crack-time estimate based on the character set you selected.',
    features: [
      'Cryptographically secure randomness via the Web Crypto API',
      'Custom character sets and an explicit "no confusing characters" option',
      'Readable passphrases from a large wordlist',
      'Live entropy calculation and estimated crack time',
      'A bulk "generate and export" mode for migrations',
      'A passphrase strength check for existing passwords',
    ],
    howTo: [
      'Choose your length and character set, or pick a passphrase instead',
      'Read the entropy and crack-time estimate',
      'Copy it, or generate a batch and export a CSV',
    ],
    useCases: [
      'Securing a WordPress or admin login',
      'Generating credentials for a client project',
      'Bulk password resets during a platform migration',
      'Creating API keys and shared secrets for a team',
    ],
    freeTier: [
      'Unlimited generation',
      'Nothing is transmitted — the generator runs locally',
      'Batch export for migrations',
      'No account required',
    ],
    widget: 'password',
    primaryService: 'web-security-services',
    relatedServices: ['web-security-services', 'custom-software-development', 'cloud-devops-services'],
    faqs: [
      {
        q: 'Is the password sent to a server?',
        a: 'No. Generation uses the browser\'s Web Crypto API locally, so the password never touches our infrastructure. You can verify that by using the tool with your network disconnected.',
      },
      {
        q: 'How long should my password be?',
        a: 'For an account that matters, 16 characters or more from a mixed set is a sensible floor. Length beats complexity: a long passphrase is easier to remember and stronger than a short scramble of symbols.',
      },
      {
        q: 'Should I use a passphrase or a random string?',
        a: 'A passphrase for anything you will type regularly, a random string for anything a machine handles, such as API keys and database credentials.',
      },
    ],
    localNote: (region) =>
      `A practical security tool for the admin and team accounts our clients in ${region} run their sites on.`,
  },
  {
    slug: 'utm-link-builder',
    name: 'UTM Link Builder',
    primaryKeyword: 'Free UTM Campaign Link Builder',
    category: 'seo',
    icon: 'share',
    hue: 250,
    tagline: 'Tagged links that actually attribute.',
    summary:
      'Build clean UTM-tagged campaign links with validation, and see exactly how each parameter will appear in your analytics reports.',
    description:
      'A free UTM campaign builder. Generate tagged links for email, social, print and paid campaigns, with validation that catches typos before they corrupt your reporting.',
    features: [
      'Source, medium, campaign, term and content parameters',
      'Live preview of the final URL',
      'Validation that flags inconsistent capitalisation and common typos',
      'Lowercase enforcement, which is what analytics actually expects',
      'Copy as a plain link or a spreadsheet-friendly table',
      'One-click CSV export for a whole campaign',
    ],
    howTo: [
      'Enter the destination URL',
      'Fill in the source and medium, then the campaign name',
      'Check the preview and fix anything flagged',
      'Copy the link into your campaign',
    ],
    useCases: [
      'Tracking which newsletter drives signups',
      'Separating paid social from organic social in reporting',
      'Attributing offline print campaigns to online conversions',
      'A/B testing a call to action by creative',
    ],
    freeTier: [
      'Unlimited links',
      'Batch generation for a whole campaign',
      'CSV export',
      'No account required',
    ],
    widget: 'utm',
    primaryService: 'analytics-setup-services',
    relatedServices: ['ppc-advertising-services', 'email-marketing-services', 'conversion-rate-optimization'],
    faqs: [
      {
        q: 'Why does the tool lowercase everything?',
        a: 'Most analytics platforms treat "Email" and "email" as two different mediums, which quietly splits your reporting. Lowercase is the convention that keeps your data clean.',
      },
      {
        q: 'Which medium should I use for a newsletter?',
        a: 'Use a consistent value like "newsletter" or "email" across every send. The important thing is that you pick one and never change it.',
      },
      {
        q: 'Can I track offline campaigns?',
        a: 'Yes. Generate a unique tagged link for print, radio or a QR code, and it will appear as a source in your analytics with the same treatment as any online click.',
      },
    ],
    localNote: (region) =>
      `Built for agencies and marketing teams running campaigns across ${region} and beyond who need their reporting to survive contact with a dozen different marketers.`,
  },
  {
    slug: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    primaryKeyword: 'Free Schema Markup Generator',
    category: 'developer',
    icon: 'gear',
    hue: 205,
    tagline: 'Valid JSON-LD for any page type.',
    summary:
      'Generate valid schema.org JSON-LD for services, products, local businesses, FAQs, breadcrumbs, articles and events — validated before you paste it in.',
    description:
      'A free schema markup generator. Pick a page type, fill in the fields, and get valid JSON-LD you can paste straight into your head. Every output is validated before you copy it.',
    features: [
      'Service, Product, LocalBusiness, FAQ, Breadcrumb, Article, Event, Person and Organization',
      'Live JSON-LD validation with plain-English error messages',
      'Includes the Service-plus-Product pattern for service pages',
      'Review and AggregateRating blocks with the right required fields',
      'Copy as minified or formatted JSON',
    ],
    howTo: [
      'Choose the schema type that matches your page',
      'Fill in the required fields — the tool tells you which are missing',
      'Check the validation panel until it is clean',
      'Copy the JSON-LD into the page head',
    ],
    useCases: [
      'Adding rich-result eligible markup to a service page',
      'Structuring a product catalogue for shopping results',
      'Marking up a FAQ block for answer-engine visibility',
      'Validating markup that already exists on a site',
    ],
    freeTier: [
      'Every schema type included',
      'Live validation',
      'No account required',
      'Formatted or minified output',
    ],
    widget: 'schema',
    primaryService: 'technical-seo-services',
    relatedServices: ['seo-services', 'seo-geo-aeo-services', 'website-development'],
    faqs: [
      {
        q: 'Which schema type should a service page use?',
        a: 'Both Service and Product, linked through the same @id. That is what lets a service page qualify for a product-style rich result while still being understood as a service, and it is what we implement across our own builds.',
      },
      {
        q: 'Does adding schema improve rankings?',
        a: 'Not directly. It improves how your page is interpreted and displayed, which raises click-through rate and makes you eligible for rich results. The ranking benefit comes from the content the schema describes.',
      },
      {
        q: 'Will this pass Google rich-result testing?',
        a: 'The tool validates against the required and recommended properties for each type, so the output is structured to pass. Rich-result eligibility still depends on the page content, not just the markup.',
      },
    ],
    localNote: (region) =>
      `Every regional page we build in ${region} ships with the same schema graph, so structured data stays consistent no matter which market the page is targeting.`,
  },
  {
    slug: 'serp-preview',
    name: 'SERP Preview & Meta Checker',
    primaryKeyword: 'Free SERP Preview and Meta Tag Checker',
    category: 'seo',
    icon: 'search',
    hue: 140,
    tagline: 'See exactly how your page will look in Google.',
    summary:
      'Preview your title, description and URL as Google will render them, with live character counts and a check for the mistakes that cause truncation.',
    description:
      'A free SERP preview tool. Write a title and description and see exactly how they will appear in a Google result, on a mobile screen and in a social card — with instant feedback on length and truncation.',
    features: [
      'Google desktop and mobile result previews',
      'Live character and pixel-width counts against real limits',
      'Warnings for truncation, missing words and over-long titles',
      'Facebook and X social card previews',
      'Schema and robots output for the same page',
    ],
    howTo: [
      'Enter your title, description and URL',
      'Read the desktop and mobile previews',
      'Fix anything flagged in red',
      'Copy the ready-made head tags',
    ],
    useCases: [
      'Writing a title that will not be cut off in results',
      'Checking a rewrite before it goes live',
      'Producing social share copy alongside page metadata',
      'Reviewing a client site before launch',
    ],
    freeTier: [
      'Unlimited previews',
      'Desktop, mobile and social card views',
      'Ready-made meta tags to copy',
      'No account required',
    ],
    widget: 'serp',
    primaryService: 'seo-services',
    relatedServices: ['seo-content-writing-services', 'meta-tag-generator', 'social-media-management'],
    faqs: [
      {
        q: 'What is a good meta title length?',
        a: 'Aim for 50 to 60 characters. Under 50 leaves an opportunity on the table; over 60 and Google truncates. The preview shows exactly where the cut will fall.',
      },
      {
        q: 'Does the meta description affect rankings?',
        a: 'Not directly, but it determines whether someone clicks. A description that matches the search intent usually lifts click-through rate substantially, which lifts traffic and therefore performance.',
      },
      {
        q: 'How many characters should the description be?',
        a: 'Between 110 and 160. Under 110 wastes available space; over 160 and the tail is cut on most devices.',
      },
    ],
    localNote: (region) =>
      `A useful final check before a ${region}-targeted page goes live, since search result widths and truncation differ by device and locale.`,
  },
  {
    slug: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    primaryKeyword: 'Free Keyword Density Checker',
    category: 'seo',
    icon: 'chart',
    hue: 145,
    tagline: 'Natural keyword use, measured honestly.',
    summary:
      'Check how often your keywords actually appear in your copy, with stop-word filtering, phrase matching and a readability score — so you can judge density by feel and confirm it with data.',
    description:
      'A free keyword density checker that measures phrase density properly — whole-word matching, stop-word awareness, and a readability score alongside. Useful for checking the balance of a finished page.',
    features: [
      'Whole-word and phrase matching, not naive substring counting',
      'Multiple keywords at once with side-by-side comparison',
      'Stop-word filtering so "the" and "and" do not pollute the report',
      'Flesch reading-ease and Gunning fog scores',
      'A phrase-density view for long-tail coverage',
    ],
    howTo: [
      'Paste your copy',
      'Add the keywords you are targeting',
      'Read the density, distribution and readability together',
      'Adjust only if the numbers are genuinely off — not to hit a target',
    ],
    useCases: [
      'Checking a finished article before publishing',
      'Confirming a page reads naturally rather than stuffed',
      'Comparing keyword coverage between draft versions',
      'Auditing a competitor page for topic coverage',
    ],
    freeTier: [
      'Unlimited text and keywords',
      'Readability scoring included',
      'Phrase matching and stop-word filtering',
      'No account required',
    ],
    widget: 'density',
    primaryService: 'seo-content-writing-services',
    relatedServices: ['seo-services', 'content-writing-services', 'copywriting-services'],
    faqs: [
      {
        q: 'What is the right keyword density?',
        a: 'There is no target. Search engines do not reward a density figure. Use this to confirm a page reads naturally and covers the topic — if a keyword is at 3%, the writing has a problem that no amount of density tuning will fix.',
      },
      {
        q: 'How does it differ from other density tools?',
        a: 'Most count substrings, so "design" also matches "designer" and "redesign". This matches whole words and phrases, and ignores stop words, so the numbers mean something.',
      },
      {
        q: 'Does it check AI content?',
        a: 'No. It cannot tell whether a text was written by a person or a model, and we would not trust a tool that claimed otherwise. Use our humanizer for tone and structure instead.',
      },
    ],
    localNote: (region) =>
      `Particularly handy for ${region} markets where several pages target overlapping regional terms and you need to know which one you are actually ranking for.`,
  },
  {
    slug: 'core-web-vitals-tester',
    name: 'Core Web Vitals Tester',
    primaryKeyword: 'Free Core Web Vitals Tester',
    category: 'seo',
    icon: 'gauge',
    hue: 130,
    tagline: 'Measure LCP, INP and CLS before you publish.',
    summary:
      'Test any URL against Google\'s Core Web Vitals thresholds and get a plain-English diagnosis of what is slow, what is unstable and what to fix first.',
    description:
      'A free Core Web Vitals tester. Run a lab check against a URL, see LCP, INP and CLS measured against Google\'s thresholds, and get a prioritised list of what to fix.',
    features: [
      'LCP, INP and CLS measured against the 75th-percentile thresholds',
      'Plain-English diagnosis rather than raw numbers',
      'Largest Contentful Element identification',
      'Render-blocking resource and font-loading detection',
      'Image weight and format analysis',
      'A prioritised fix list ordered by impact',
    ],
    howTo: [
      'Enter the URL you want to test',
      'Run the test and wait for the lab pass',
      'Read the diagnosis for each of the three metrics',
      'Work the prioritised fix list from the top',
    ],
    useCases: [
      'Checking a build before it launches',
      'Finding why a site feels slow on a phone',
      'Prioritising a performance backlog by real impact',
      'Checking whether a redesign actually improved things',
    ],
    freeTier: [
      'Unlimited tests',
      'Full LCP, INP and CLS breakdown',
      'Prioritised fix list',
      'No account required',
    ],
    widget: 'cwv',
    primaryService: 'core-web-vitals-optimization',
    relatedServices: ['technical-seo-services', 'website-development', 'web-hosting-services'],
    faqs: [
      {
        q: 'Is this field data or lab data?',
        a: 'Lab data, generated on demand from our servers. It is a reliable indicator of how the page behaves, but only a field tool such as PageSpeed Insights can show what real visitors actually experienced.',
      },
      {
        q: 'What are the thresholds I should hit?',
        a: 'LCP under 2.5 seconds, INP under 200 milliseconds and CLS under 0.1, at the 75th percentile of real visits. Below those, Google treats the page as good.',
      },
      {
        q: 'How often should I re-test?',
        a: 'After any deployment that touches templates, images, scripts or fonts, and monthly as a general habit. Performance regressions are usually introduced by a single change and caught within days.',
      },
    ],
    localNote: (region) =>
      `The same three metrics decide your rankings in ${region} as anywhere else, but the average connection speed in each market changes what "fast enough" means in practice — which is why we test from local infrastructure.`,
  },
  {
    slug: 'business-name-generator',
    name: 'Business & Tagline Generator',
    primaryKeyword: 'Free Business Name Generator',
    category: 'business',
    icon: 'sparkles',
    hue: 300,
    tagline: 'Names worth checking for availability.',
    summary:
      'Generate business names and taglines from real word banks, with a domain-suitability score and a quick availability check so you are not chasing a name someone already owns.',
    description:
      'A free business name and tagline generator. Combines industry-relevant word banks into names you can actually use, and flags which ones are short, pronounceable and domain-friendly.',
    features: [
      'Industry-specific word banks, not random syllables',
      'Tagline generation matched to the name',
      'Pronounceability and length scoring',
      'Domain-suitability hints and common TLD suggestions',
      'One-click copy of every result',
    ],
    howTo: [
      'Choose your industry and the tone you want',
      'Generate a batch of names',
      'Shortlist by the score and your own taste',
      'Check domain and social availability before you commit',
    ],
    useCases: [
      'Naming a new business or product line',
      'Finding a tagline that is not a cliché',
      'Naming a sub-brand or microsite',
      'Brainstorming before a naming workshop',
    ],
    freeTier: [
      'Unlimited generations',
      'Industry word banks included',
      'Scoring and copy included',
      'No account required',
    ],
    widget: 'names',
    primaryService: 'branding-services',
    relatedServices: ['logo-design-services', 'graphic-design-services', 'content-marketing-services'],
    faqs: [
      {
        q: 'How do I check domain availability?',
        a: 'The tool shows which names are short and typeable and suggests the right TLD. It does not check availability, because that requires a live registry query — check your shortlisted names at a registrar before you commit.',
      },
      {
        q: 'Will it give me a trademarked name?',
        a: 'It combines common words in common ways, which reduces the risk but does not eliminate it. Always run a trademark search before you spend money on branding.',
      },
      {
        q: 'Can I use the names commercially?',
        a: 'Yes, the output is yours to use. We do not claim exclusivity on generated combinations.',
      },
    ],
    localNote: (region) =>
      `Useful for founders in ${region} who want a name that works in English and in their local language, and can survive being said out loud over the phone.`,
  },
  {
    slug: 'website-grader',
    name: 'Website Grader',
    primaryKeyword: 'Free Website Grader',
    category: 'seo',
    icon: 'award',
    hue: 165,
    tagline: 'Score any site on the five things that matter.',
    summary:
      'Paste a URL and get a scored breakdown across performance, mobile readiness, SEO fundamentals, accessibility and trust — each with a specific fix, not just a number.',
    description:
      'A free website grader that gives a useful answer rather than a vanity score. Five categories, each with a specific, actionable finding and a prioritised to-do list.',
    features: [
      'Scored across performance, mobile, SEO, accessibility and trust',
      'Specific findings, not a single opaque score',
      'A prioritised fix list ordered by effort against impact',
      'Checks for the issues that actually correlate with conversion',
      'Shareable summary for clients and colleagues',
    ],
    howTo: [
      'Enter the URL',
      'Wait for the audit to complete',
      'Read the category breakdown and the findings',
      'Work the prioritised fix list',
    ],
    useCases: [
      'Auditing a site before a redesign brief',
      'Showing a client exactly what is wrong and why it matters',
      'Benchmarking your own site against a competitor',
      'Prioritising a technical SEO backlog',
    ],
    freeTier: [
      'Unlimited audits',
      'Full five-category breakdown',
      'Prioritised fix list',
      'No account required',
    ],
    widget: 'grader',
    primaryService: 'seo-audit-services',
    relatedServices: ['seo-services', 'technical-seo-services', 'conversion-rate-optimization'],
    faqs: [
      {
        q: 'How is this different from your free SEO audit service?',
        a: 'This is an instant automated check anyone can run. The free audit service is a human review of the same areas, delivered within 48 hours, with competitor comparison and a prioritised roadmap. Start here, then request the audit if you want depth.',
      },
      {
        q: 'Is the score comparable to other tools?',
        a: 'No, and deliberately. We weight the five categories by how strongly they correlate with conversion and revenue for a typical small business, not by how many items are in each category.',
      },
      {
        q: 'Can I audit a competitor?',
        a: 'Yes, and it is genuinely useful for benchmark and pitching. What you must not do is copy their content — audit for structure and gaps, not for text.',
      },
    ],
    localNote: (region) =>
      `Designed to be run on any market\'s site, so you can benchmark a ${region} competitor against your own before a sales conversation.`,
  },
];

export const TOOL_BY_SLUG: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

/** Tool → the service it should cross-sell into. */
export function toolServiceLink(tool: Tool): { name: string; slug: string } | null {
  return null;
}
