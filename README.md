# Website Design Company

A complete, launch-ready website for **Website Design Company** (trading as *Marco Marketing Agency*).

A multi-region digital agency platform: static-site generation for speed and SEO, plus a real
backend, database, CMS and client dashboard.

---

## What ships

A multi-region agency platform: **49,799 static pages** plus a live Node API, CMS
and CRM. 82 services × 72 countries × 283 cities, with regional clustering for
every content type.

| Layer | Technology | Notes |
|---|---|---|
| Frontend | TypeScript → minified static HTML | Zero-framework output, ~32 KB gzipped per page |
| Styling | Tailwind CSS + bespoke design system | ~50 KB minified |
| 3D / motion | CSS 3D transforms, GPU-composited | No WebGL on the critical path |
| Backend | Express 4 + TypeScript | REST API, rate limiting, security headers |
| Database | SQLite (WAL) via better-sqlite3 | 22 tables, single file, zero provisioning |
| CMS | Custom admin at `/admin/` | Dual-mode editor: visual blocks **and** raw fields |
| CRM / EMS | `src/server/crm.ts` | Auto client profiles, enquiry inbox, timeline, pipeline |
| Payments | PayPal · card-via-PayPal · US bank · USDT/BTC/ETH | **No Stripe** |
| Free tools | 15 client-side widgets | Nothing uploaded; verified against a real DOM |
| Blog posts | 10,170 | 100 per country + 10 per city, 12 archetypes + 12 redesign topics × 82 services × 20 industries |
| Case studies | 1,734 | Flagships + 20 per country + 3 per city |
| Free tool pages | 5,325 | 15 tools × 356 location scopes |
| Comparison pages | 361 | 5 comparisons + index, per country |
| Build | Custom SSG | Sitemaps, robots.txt, llms.txt ×2, search index, SEO + QA reports |

### Free tools

15 genuinely functional, client-side utilities — no server, no account, nothing
uploaded. Each has a root page, a country page and a city page with localised
copy, currency and examples, so an "invoice generator" in Germany speaks to
German buyers rather than competing with the root page.

`npm run test:tools` renders all 15 against a real DOM and asserts each one
wires up and produces output.

### Signature packages

Eight fixed-price packages lead the web-design family in every one of the 72
markets, priced in USD and converted per country:

| Package | USD |
|---|---|
| Landing Page | **$99** |
| Landing Page Redesign | $249 |
| Logo & Brand Refresh | $299 |
| Website Redesign | $449 |
| Logo & Website Design | $499 |
| Website Redesign — Ecommerce | $899 |
| Rebrand & Website Redesign | $899 |
| Full Website Redesign | $1,299 |

They lead the **web-design, brand and redesign** service pages only. They are
deliberately not attached to, say, an SEO retainer — a $99 landing-page offer
sitting next to a monthly SEO engagement reads as two different businesses.

### CRM & Enquiry Management

The layer the brief describes as "between click and us". Every form submission
and every order creates or updates a **client profile** automatically. Enquiries
attach to that profile, orders link to the enquiry thread, and a single client
record carries the full timeline — submissions, orders, notes and status
changes. The dashboard adds a pipeline view, a client list with lifetime value,
and an enquiry inbox with assignment and next-action tracking.

### Dual-mode CMS editor

Every editable record can be edited two ways: a **visual block editor** for
non-technical users (heading, paragraph, list, quote, callout, FAQ, image,
divider, code — with live preview and one-click HTML copy) and a **technical
field editor** for raw data. Both write to the same column, so nothing is lost
switching between them.

---

```
N / N pages pass on-page checks
✓ 0 broken internal links across every rendered page
```

**Independent QA audit** (`npm run qa`): 0 errors, 0 warnings.

---

## What's in the box

| Layer | Technology | Notes |
|---|---|---|
| Frontend | TypeScript → minified static HTML | Zero-framework output, no hydration cost |
| Styling | Tailwind CSS + a bespoke design system | 35 KB minified |
| 3D / motion | CSS 3D transforms, GPU-composited | No WebGL on the critical path |
| Backend | Express 4 + TypeScript | REST API, rate limiting, security headers |
| Database | SQLite (WAL mode) via better-sqlite3 | Single file, zero provisioning |
| CMS | Custom admin at `/admin/` | Pages, posts, case studies, portfolio, galleries, media, services, packages, testimonials, SEO overrides |
| Payments | PayPal · card (via PayPal) · US bank transfer · USDT/BTC/ETH | **Stripe is not used** and cannot be enabled |
| Build | Custom SSG | Sitemap index, robots.txt, llms.txt, llms-detailed.txt, search index, SEO report, QA report |

---

## Quick start

```bash
npm install
npm run build      # generates dist/ (CSS + all pages + all SEO files)
npm run seed       # creates the admin user and imports content into the CMS
npm start          # serves on http://localhost:3000
```

Open:

- Site → `http://localhost:3000/`
- Dashboard → `http://localhost:3000/admin/`
- LLM map → `http://localhost:3000/llms.txt` and `/llms-detailed.txt`

### Admin credentials

```
Email:    marcomarketing.ali786@gmail.com
Password: ali @qais786
```

> Change this immediately after first login (Dashboard → Settings → Change your password).
> Changing the password invalidates every other session.

---

## npm scripts

| Script | What it does |
|---|---|
| `npm run build` | Full static build (CSS + pages + sitemaps + llms.txt + search index) |
| `npm run build:css` | Tailwind only |
| `npm run qa` | Full audit of `dist/` → `dist/qa-report.json` |
| `npm run test:tools` | Renders all 15 free-tool widgets against a real DOM and asserts they work |
| `npm run verify` | `build` then `qa` |
| `QA_SAMPLE=N npx tsx src/build/qa.ts` | Audit a stratified sample of N pages (fast) |
| `npm run seed` | Create/refresh admin user, sync services/packages, import generated content |
| `npm run db:reset` | Delete the database and re-seed from scratch |
| `npm run dev` | Server with file watching |
| `npm start` | Production server |
| `npm run typecheck` | `tsc --noEmit` |

### Scaling the build

The content volume is controlled by environment variables:

```bash
# Fast dev build — no city-level service pages, minimal content
BUILD_POSTS_PER_LOCATION=1 BUILD_CASES_PER_LOCATION=1 BUILD_CITY_PAGES=0 npm run build

# Production (default) — 100 posts + 20 case studies per country, 10 + 3 per city
npm run build

# Cloudflare Pages / Workers Free — sized to the 20,000-file cap
BUILD_TIER=cdn npm run build          # 19,144 files

# Public review build — a small, self-consistent subset
BUILD_TIER=preview npm run build      # 1,195 files
```

### Build tiers

| Tier | Files | Use |
|---|---:|---|
| `full` (default) | 49,799 | Cloudflare Workers **Paid** ($5/mo, 100k file cap), or a VPS |
| `cdn` | 19,144 | Cloudflare Pages / Workers **Free** (20,000 file cap) |
| `preview` | 1,195 | Public review link — anything outside the subset resolves to the canonical domain, so no 404s |

| Variable | Default | Meaning |
|---|---|---|
| `BUILD_POSTS_PER_COUNTRY` | 100 | Blog posts per country |
| `BUILD_CASES_PER_COUNTRY` | 20 | Case studies per country |
| `BUILD_POSTS_PER_CITY` | 10 | Blog posts per city |
| `BUILD_CASES_PER_CITY` | 3 | Case studies per city |
| `BUILD_POSTS_PER_LOCATION` | 3 | Blog posts for the root (USA) scope |
| `BUILD_CASES_PER_LOCATION` | 1 | Case studies for the root scope |
| `BUILD_CITY_PAGES` | on | Generate service × city pages |
| `SITE_ORIGIN` | `https://www.websitedesigncompany.site` | Canonical origin for absolute URLs, schema and sitemaps |
| `PORT` | 3000 | Server port |
| `DB_PATH` | `data/app.db` | SQLite file location |
| `QA_SAMPLE` | 0 (all) | Audit only a stratified sample of N pages |

> The full production build renders **49,799 pages** and takes roughly **50 minutes**
> on this NAS-backed sandbox (closer to 20 minutes on a local SSD). The registry
> phase — computing every URL and generating every post — is the slowest part at
> 4–8 minutes on its own. `dist/` ends up at roughly **8.6 GB**.

---

## Site structure

The United States is the primary market and lives at the **root** — no `/usa/` prefix.

```
/                                   Homepage — primary keyword "Website Design Company"
/{service}/                         US service pages (e.g. /seo-services/)
/{country}/                         Country hub      (e.g. /uk/)
/{country}/{city}/                  City hub         (e.g. /uk/london/)
/{city}/                            US city hub      (e.g. /houston/)
/{country}/{service}/               Country service  (e.g. /uae/dubai/website-design-services/)
/{city}/{service}/                  US city service  (e.g. /houston/seo-services/)
/blog/ · /{country}/blog/           Blog indexes
/blog/{slug}/                       Blog posts
/case-studies/ · /{country}/case-studies/
/portfolio/ · /{portfolio}/{slug}/
/gallery/ · /industries/ · /industries/{slug}/
/services/ · /packages/ · /about/ · /contact/ · /free-audit/ · /faq/ · /locations/
/privacy-policy/ · /terms-of-service/ · /cookie-policy/
/checkout/{SKU}/                    One page per package (noindex)
/admin/                             CMS dashboard (noindex)
/search/ · /thank-you/ · /404.html
```

### Primary keyword rules (enforced at build time)

| Page type | Primary keyword | Supporting keyword |
|---|---|---|
| Homepage | `Website Design Company` | USA |
| Service pages | the service keyword, e.g. `Logo Design Services` | region / city |
| City service pages | `{Service keyword} in {City}` | `{City} {Country}` |
| Blog posts | the generated post keyword | location |
| Industry pages | `{Industry} Website Design Services` | USA |
| Checkout | the service keyword | — |

Every page is validated at build time for:

- meta title ≤ 60 characters, **starting with the exact primary keyword**
- meta description 101–159 characters, containing the primary keyword
- exactly one `<h1>`
- one exact-match `<h2>` carrying the primary keyword
- 1.5–2% primary-keyword density in body paragraphs
- a unique canonical, Open Graph tags and Twitter cards
- valid JSON-LD, breadcrumb, and the right Service/Product/FAQ/Article nodes

Anything that fails is written to `dist/seo-report.json`.

---

## Payments

Stripe is **deliberately not used.** Four settlement rails are implemented:

| Method | How it settles |
|---|---|
| **PayPal** | Hosted PayPal invoice / PayPal.me link issued automatically; optional IPN webhook at `/api/paypal/ipn` |
| **Card** | Completed inside PayPal's secure checkout — card details never touch this server |
| **Bank transfer** | US ACH / wire with a proforma invoice; details editable in the dashboard |
| **Crypto** | USDT / BTC / ETH, or Binance Pay; wallet address and network issued on the order |

Prices are always resolved **server-side from the package catalogue** — a client-supplied price is
never trusted. An order moves `pending → awaiting_payment → paid`, and a human confirms settlement
from the dashboard (or PayPal IPN confirms it automatically when configured).

Configuration lives under **Settings → Payment rails**. Environment variables for PayPal:

```bash
PAYPAL_MERCHANT_EMAIL=you@domain.com
PAYPAL_PAY_LINK=https://www.paypal.com/paypalme/yourhandle
PAYPAL_IPN_VERIFY=https://ipnpb.paypal.com/cgi-bin/webscr   # enables real IPN verification
```

---

## Lead capture

Every form on every page posts to `POST /api/leads`. Each submission is stored with full
provenance so the dashboard can report **exactly which page produced it**:

name, email, phone, company, service, region, budget, timeline, message, page URL, page path,
page title, inferred page type, referrer, `utm_source` / `utm_medium` / `utm_campaign` / `utm_term`
/ `utm_content`, `gclid`, `fbclid`, device, screen size, language, IP and timestamp.

Export everything to CSV at `/api/admin/leads.csv`.

Bot protection: honeypot field, plus per-IP rate limiting (12 submissions / 10 minutes).

---

## SEO deliverables

| File | Purpose |
|---|---|
| `sitemap.xml` | Sitemap **index** pointing at seven grouped child sitemaps (services, locations, blog, case-studies, portfolio, pages) |
| `sitemap-*.xml` | Per-section sitemaps with `hreflang` alternates for every non-US page |
| `robots.txt` | Standard directives plus an explicit **allow** block for GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, Applebot-Extended, Bytespider and others |
| `llms.txt` | Concise LLM-facing map of the organisation, services, packages, regions and contact |
| `llms-detailed.txt` | Full per-service, per-package, per-country, per-city and per-industry reference, with a FAQ corpus and a citing policy |
| `manifest.webmanifest` | PWA manifest |
| `.well-known/security.txt` | Security contact |
| `search-index.json` | Client-side search corpus |
| `content-export.json` | Every URL with its keyword, type and metadata — the CMS seed payload |
| `seo-report.json` | Per-page on-page check results |
| `qa-report.json` | Full audit output |

### Structured data

Services here are **both a Service and a Product**, so each service page emits a single `@graph`
containing:

`Organization` → `WebSite` → `WebPage` → `BreadcrumbList` → `Service` (+`Offer`/`AggregateOffer`)
→ `Product` (+`AggregateRating`, `Review`) → `FAQPage` → `HowTo` → `LocalBusiness` (city pages only).

Collections emit `CollectionPage` + `ItemList`; posts emit `Article`/`BlogPosting`/`TechArticle` with
`SpeakableSpecification`; case studies emit `Article` + client `Review`.

---

## Regional pricing

All prices are stored in USD and converted at build time per country, then rounded to a
commercially sensible figure for that currency. 25 currencies are supported:

`USD GBP EUR CAD AUD NZD AED SAR QAR BHD KWD OMR IQD PKR INR BDT SGD MYR IDR PHP EGP NGN ZAR KES
SEK PLN TRY BRL MXN ARS COP CLP`

$1,199 Elite → **£950** (UK) · **CA$1,643** (Canada) · **AED 4,400** (UAE) · **PKR 334,000** (Pakistan)

### Redesign content engine

Redesign and rebranding are a distinct content track with their own keyword set,
because "Website Redesign Cost" and "Logo Design Services" are different
searches with different intents.

Twelve topics, one post each, **per keyword per region** — never two posts for
the same keyword in the same market:

| # | Topic | # | Topic |
|---|---|---|---|
| 1 | Rebranding Checklist | 7 | Website Redesign Timeline |
| 2 | Website Redesign Cost | 8 | Logo Redesign Guide |
| 3 | Website Redesign Process | 9 | Landing Page Redesign |
| 4 | Website Redesign vs Rebuild | 10 | Ecommerce Website Redesign |
| 5 | When To Redesign Your Website | 11 | Website Migration Checklist |
| 6 | Website Redesign SEO | 12 | Brand Refresh Vs Rebrand |

Each post runs to roughly 930 words with its own FAQ set. Regional uniqueness
comes from three things, not from a swapped place name:

1. **Regulatory reality** — the privacy regime, consumer rules and
   accessibility duties that apply in that country, written per market.
2. **Buying expectations** — what buyers in that market assume they will get,
   and who actually signs the purchase order.
3. **Local pricing** — costs quoted in the local currency at the local rate.

A market with no hand-written note still gets a deterministic, market-specific
framing, so no two country pages ship the same copy.

### Content volume

The blog and case-study layers are generated from a matrix of **post archetype × service ×
industry × location** and scale with one environment variable:

```bash
# current default — ~3 min of extra build time
BUILD_POSTS_PER_LOCATION=3 BUILD_CASES_PER_LOCATION=1

# deep build — ~10× the content
BUILD_POSTS_PER_LOCATION=12 BUILD_CASES_PER_LOCATION=4

# maximum — close to 100 posts per location scope
BUILD_POSTS_PER_LOCATION=100 BUILD_CASES_PER_LOCATION=20
```

At the default depth the site ships **714 posts and 91 case studies**. Raising the variables
proportionally raises both; the generator, schemas, sitemaps, `llms-detailed.txt` and the CMS
import all follow automatically. The content pool is 12 archetypes × 60 services × 20 industries,
so a deeper build produces genuinely differentiated pages rather than repetitions of one layout.

---

## Design system

Dark, premium, high-contrast — built for a design agency, and built from the
client's own logo rather than a stock palette.

### Palette

The theme is derived from `src/assets/brand-logo.png`, which is the single
source of truth for brand colour. Every token below traces back to it.

| Token | Value | Role |
|---|---|---|
| `--navy-950` | `#050C16` | Page base |
| `--navy-900` | `#0C1824` | Surfaces, cards |
| `--steel-700` | `#1B4C74` | Secondary surfaces, borders |
| `--teal-500` | `#2090C0` | Primary brand accent |
| `--teal-400` | `#2E9CD4` | Interactive accent, hover |
| `--silver-100` | `#E4EDF3` | High-contrast text |

The legacy cyan/violet tokens were removed rather than aliased, so a stale
`--cyan-*` reference fails loudly in QA (`css.legacy-token`) instead of
silently rendering off-brand.

### Motion

- **Animated icons** — 93 hand-drawn SVG icons, six animation classes
  (`ico-spin`, `ico-orbit`, `ico-pulse`, `ico-sweep`, `ico-float`,
  `ico-flicker`). The animation variant is chosen per icon at runtime, so the
  classes are Tailwind-safelisted and never purged from the build.
- **3D** in the hero: CSS-3D `perspective` scene with counter-rotating rings
  and floating glass cards; the header brandmark carries a spinning 3D ring.
- **Motion** is transform/opacity only, so it composites on the GPU and never
  blocks paint.
- **`prefers-reduced-motion`** disables every animation.

### Navigation

A full-width **mega menu** with six bays — Website Design & Development, Logo &
Branding, SEO & Search Marketing, Digital Marketing, Content & Creative, Video &
Animation — plus a Regions panel. It opens on hover with a 90 ms intent delay
(so a diagonal mouse path does not fire it), on click, and on keyboard
`focusin` / `ArrowDown`. `Escape` and a viewport resize both close it.

### Performance contract

- **No JavaScript is required** for content to render — the reveal script only enhances
- **LCP** is text on a static background, not a canvas; fonts use `preload` + `swap`

---

## Project layout

```
src/
  config/site.ts          Brand, contact, admin, social, partner config
  data/                   regions, services, packages, industries, clients, faq-pages
  lib/                    html helpers, SEO primitives, schema builders, routing
  content/                keyword weaver, service copy composer, post + case generators
  render/                 icons, components, hero, layout shell
    templates/            home, service, content, pages, misc
  build/                  registry, orchestrator, images, minifier, qa
  server/                 express app, auth, payments
  db/                     schema + seed
public/
  admin/                  dashboard (index.html + admin.js)
  assets/css/app.css      built Tailwind
dist/                     build output (generated)
data/app.db               SQLite (generated)
data/uploads/             uploaded media (generated)
```

---

## Deployment

The build produces a static `dist/` plus a small Node API, so it runs anywhere.

**Static-only host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront)**
Deploy `dist/` and point `/api/*` and `/admin/*` at the Node app. Configure the host to serve
`404.html` for unknown paths and to rewrite `/*/ → /*/index.html`.

**Single Node host (Render, Railway, Fly.io, a VPS)**
```bash
git clone <repo> && cd website-design-company
npm ci
npm run build
npm run seed
NODE_ENV=production SITE_ORIGIN=https://your-domain.com npm start
```

Set these environment variables in production:

```
SITE_ORIGIN=https://your-domain.com
NODE_ENV=production
PAYPAL_MERCHANT_EMAIL=you@domain.com
PAYPAL_PAY_LINK=https://www.paypal.com/paypalme/yourhandle
PAYPAL_IPN_VERIFY=https://ipnpb.paypal.com/cgi-bin/webscr
SESSION_SECRET=<64 random hex chars>
```

Then fill in the real bank and crypto details under **Settings → Payment rails** and change the
admin password.

**Before going live**

1. Set `SITE_ORIGIN` to the real domain and rebuild — every canonical, sitemap entry and schema URL
   is derived from it.
2. Change the admin password.
3. Fill in the bank, crypto wallet and PayPal details in Settings.
4. Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
5. Verify `llms.txt` and `llms-detailed.txt` are live at the root.
6. Point the `do follow` partner link to `websitedesign.group` (already present on UK web design pages).

---

## Security

- bcrypt (cost 12) password hashing, never stored or logged in plain text
- Opaque 32-byte server-side sessions in SQLite; `httpOnly`, `SameSite=Lax`, `Secure` in production
- HMAC double-submit CSRF token on every mutating admin request
- Role separation: `owner` (full), `admin` (content + settings), `editor` (content only)
- CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- Rate limiting on all public write endpoints and on login
- Honeypot + size caps on uploads; everything converted to WebP and re-encoded
- Path traversal is not reachable — all file paths are resolved under `dist/` or `data/uploads/`

---

## Quality assurance

`npm run qa` audits every built page for:

- meta title/description length and keyword placement
- canonical, robots, viewport, Open Graph, `lang`
- exactly one `<h1>`; duplicate IDs
- JSON-LD validity, required node types, breadcrumb/FAQ/Product coverage
- every internal link resolves to a real file
- every image exists, has alt text, has `width`/`height` (CLS) and is WebP
- labelled form inputs, skip link, landmarks, accessible button names
- sitemap ↔ `dist/` consistency, `robots.txt` sanity, `llms.txt` presence
- **balanced HTML** — every generated document is checked for unclosed tags
- **duplicate content** — an 8-word shingle Jaccard comparison across pages
  that share a URL shape, so a country page cannot ship as a copy of another
  country's page with the place name swapped
- **heading hierarchy** — no skipped levels anywhere in the document
- **class coverage** — every class a page references must exist in the built
  stylesheet, catching Tailwind purging of runtime-composed class names
- **icon wrapping** — every SVG sits inside an element that can take the
  animated-icon classes
- **title ↔ registry keyword** — the page title must actually contain the
  keyword the registry assigned to that route

Results land in `dist/qa-report.json` with per-rule counts. The command exits
non-zero on any error.

**Current status on the production build: 0 errors, 0 warnings.**

---

## Licence

Proprietary — built for the client. All content, copy and design are the client's.
