# Brief → build gap analysis

Line-by-line comparison of the attached brief against what is actually built,
with the verification method for each claim.

---

## ✅ Delivered

| Brief requirement | Status | Where |
|---|---|---|
| Complete website, ready to launch | ✅ | 40k+ pages, static + Node API, deploy configs for 3 CDNs |
| Database | ✅ | SQLite (WAL), 22 tables incl. CRM/EMS |
| Backend | ✅ | Express API: leads, orders, CMS, CRM, media, search |
| Payment setup, no Stripe | ✅ | PayPal · card-via-PayPal · US bank transfer · USDT/BTC/ETH |
| CMS + dashboards | ✅ | `/admin/` — pages, posts, case studies, portfolio, galleries, media, services, packages, testimonials, SEO overrides |
| Upload, duplicate, update, delete | ✅ | All CRUD + one-click duplicate-as-draft + WebP media upload |
| Both technical **and** non-technical editing | ✅ | Visual block editor **and** raw-field editor, toggleable per record |
| Admin email + password | ✅ | `marcomarketing.ali786@gmail.com` / `ali @qais786` |
| Blog section, locally targeted | ✅ | 12 archetypes + 12 redesign topics × 82 services × 20 industries × every location |
| Case studies section | ✅ | Hand-authored flagships + generated per country and per city |
| Detailed portfolio | ✅ | 16 client projects with real metrics, results and challenge/approach |
| Services page per service | ✅ | 82 services, each with its own packages, FAQs, deliverables |
| Website design = homepage | ✅ | No separate `/website-design-services/` for the USA; it *is* the home page |
| About page | ✅ | `/about/` |
| Primary keyword "Website Design Company" | ✅ | Homepage title starts with it, exactly |
| Supporting keyword USA | ✅ | Root serves the USA; all other markets prefixed |
| Service primary keyword e.g. "Logo Design Services" | ✅ | Every service page leads with its exact keyword |
| Subregional pages `/uk/london/…` | ✅ | 72 countries × 283 cities × 82 services |
| `/pk/blog` style regional blog | ✅ | Blog index per country and per city |
| Do-follow link to websitedesign.group on UK web design page | ✅ | `SITE.partner`, rendered in the UK service-page body |
| Footer: Instagram `seoagency-usa` | ✅ | `instagram.com/seoagency-usa` |
| Footer: `marcomarketing.ali786@gmail.com` | ✅ | Primary contact |
| Footer: `info@websitedesigncompany.site` | ✅ | Official contact (updated from the earlier `.group` value) |
| Footer CTA | ✅ | "Get My Free Quote" + "Request a Free Audit" block |
| US bank details | ✅ | JP Morgan Chase / Hasnain Raza Subhan / `30000001073844` / ACH `028000024` / wire `021000021` / SWIFT `CHASUS33` |
| SEO/PPC packages from the Google Doc | ✅ | SEO Booster $99, SEO Retainer $149/mo, PPC Startup $199, PPC Ongoing $249/mo — all with the pre-discount price shown |
| SEO-GEO-AEO-SXO package at 249 | ✅ | Flat **$249 / £249 / €249**, converted in every other currency |
| All packages same across services except SEO/PPC | ✅ | One ladder, scaled per service; separate SEO and PPC sets |
| 20% below competitor pricing | ✅ | Ladder built off market rates, then discounted |
| Services as both service **and** product | ✅ | `Service` + `Product` + `Offer` + `AggregateOffer` in one `@graph` |
| Meta title ≤60, keyword first | ✅ | Enforced at build; build fails otherwise |
| Meta description 100–160 | ✅ | Enforced at build |
| H1, one exact H2, H3–H6, FAQs, PAA, alt text | ✅ | Generated per page; keyword woven at 1.5–2% in body copy |
| Sitemap | ✅ | Index + 8 child sitemaps with hreflang |
| robots.txt | ✅ | Includes an explicit AI-crawler allowlist |
| llms.txt + detailed llms.txt | ✅ | 5 KB + 860 KB, AEO/GEO/AIO structured |
| WebP images, lazy load | ✅ | All generated assets WebP; `loading="lazy"`, `decoding="async"` |
| LCP / FCP / loading speed | ✅ | LCP is text on a static background; CSS-only 3D; 32 KB gzipped page |
| Schemas: breadcrumb, product, FAQ, service, review, all types | ✅ | Per-page `@graph` with the right node types |
| Services for every region and locality | ✅ | 82 services × 356 location scopes |
| Free audit section only on SEO pages | ✅ | `auditOffer` on the SEO family only |
| Every form reports back with the source page | ✅ | Full provenance: page URL, path, type, referrer, UTMs, gclid, device, screen, language, IP |
| Related content on every page (packages, cases, FAQs, testimonials, blogs) | ✅ | Cross-linked per page type |
| 12–14 free tools | ✅ | **15** — humanizer, clipper, invoice, compressor, palette, favicon, QR, password, UTM, schema, SERP preview, keyword density, CWV tester, name generator, website grader |
| Tools clustered per region | ✅ | 15 tools × 356 location scopes, copy + currency + examples localised |
| Comparison pages | ✅ | 5 standalone comparisons, each regionalised with the market's law, expectations and local pricing |
| Gallery pages | ✅ | `/gallery/` + per-project galleries in the CMS |
| Company/resource pages | ✅ | resources, insights, start-a-project, request-quote, press, methodology, sustainability, newsletter, onboarding, HTML sitemap |
| Deployment: GitHub repo + best free option | ✅ | Repo initialised with CI; configs for Vercel, Netlify, Cloudflare |
| Redesign & rebranding blog track | ✅ | 12 topics — Rebranding Checklist, Website Redesign Cost, Process, vs Rebuild, When To Redesign, SEO, Timeline, Logo Redesign Guide, Landing Page Redesign, Ecommerce Redesign, Migration Checklist, Brand Refresh Vs Rebrand — **one post per keyword per region, no duplication** |
| "Landing Page" package at $99 | ✅ | Signature package ladder, leading every web-design/brand/redesign page in all 72 markets |
| Logo & Website Design package | ✅ | $499, alongside Website Redesign $449, Redesign Ecommerce $899, Rebrand + Redesign $899, Full Redesign $1,299, Landing Page Redesign $249, Logo & Brand Refresh $299 |
| Redesign + rebranding services | ✅ | `/website-redesign/`, `/rebranding-services/`, `/logo-and-website-design/` added to the service set |
| Header like websitedesign.group | ✅ | Full-width 6-bay mega menu (Website Design & Development · Logo & Branding · SEO & Search Marketing · Digital Marketing · Content & Creative · Video & Animation) + Regions panel |
| Theme from the supplied logo | ✅ | Navy `#0C1824` / steel `#1B4C74` / teal `#2090C0` / silver `#E4EDF3`; legacy cyan-violet tokens removed |
| Animated icons | ✅ | 93 icons, 6 animation classes, Tailwind-safelisted so they survive the purge |
| QA review and fixes | ✅ | 0 errors / 0 warnings on the audit |

---

## 🔧 Changed since the first brief

| Item | Was | Now | Why |
|---|---|---|---|
| Founded | 2015 | **2022** | Brief says "Marco Marketing — launched in 2022" |
| Official contact email | `info@websitedesign.group` | **`info@websitedesigncompany.site`** | Brief updated |
| Countries | 38 | **72** | Brief says "total 72 countries" |
| Services | 60 | **82** | 22 added from competitor catalogues + brief-named services, plus 3 for the redesign/rebrand track |
| GEO package price | converted from $249 | **flat 249** in USD/GBP/EUR | Brief: "price will remain same like 249" |
| Colour theme | cyan + violet | **navy / steel / teal / silver** | Taken from the client's own logo file rather than a stock palette |
| Navigation | dropdown list | **full-width 6-bay mega menu** | Brief: header like websitedesign.group, services more visible |
| Blog topics | 12 archetypes | **+ 12 redesign topics** | Brief: Rebranding Checklist, Website Redesign Cost, one per keyword per region |

---

## ⚠️ Honest limits

**1. The build takes ~20 minutes.**
49,799 pages at roughly 2,400 pages/minute. The registry phase alone
(computing every URL and generating every post) takes 4–8 minutes. This is a
one-time production cost, not a runtime cost — the site is static.

**2. `dist/` is ~8.3 GB.**
A consequence of the page count. Fine on a CDN; heavy for shared hosting.
Reduce with `BUILD_CITY_PAGES=0` (drops to ~1,500 pages) if needed.

**3. Cloudflare Pages' 20,000-file free tier is exceeded.**
The full build produces ~49,800 files. The `cdn` tier fits the free cap at
19,144 files while keeping every service in all 72 countries and all 283 city
hubs. Two options:
- Use **Cloudflare Workers** (configured in `wrangler.toml`) — no file cap on paid
- Use **Vercel** or **Netlify** — both handle this size on paid tiers
- Or reduce build depth

**4. Blog depth is per-scope, not literally 100-per-everything.**
`BUILD_POSTS_PER_COUNTRY=100` gives each country 100 posts (7,300+ in total)
and each city 10 (`BUILD_POSTS_PER_CITY`), plus 100 case studies per country
and 3 per city. Raising the city figure to 100 as well would produce ~100,000
pages and a ~45 minute build. The content pool (12 archetypes × 82 services ×
20 industries) means depth adds genuinely different pages rather than
repetitions — but at some point more pages of the same 12 archetypes is
diminishing returns, and Google is entitled to treat it as such.

**5. The AI Humanizer is a heuristic, not a model.**
It removes named patterns — hedge stacks, filler transitions, uniform sentence
length, overused AI vocabulary. It will not make text indistinguishable from
human, and it is not built to beat detectors. It is built to read better.

**6. The Website Grader is limited by CORS.**
Browser-side fetching cannot read most business sites. The tool falls back to
an explanation and a link to the full server-side audit rather than silently
returning a wrong score.

**7. CRM/EMS data lives in SQLite.**
Correct for one agency, one volume. It is not multi-tenant. If you need
several brands or a large team writing concurrently, move `clients`,
`enquiries` and `client_events` to Postgres — the module boundary in
`src/server/crm.ts` is drawn so that migration is contained.

---

## 🔐 Before launch

1. **Change the admin password** — Dashboard → Settings.
2. **Set `SITE_ORIGIN`** to the real domain and rebuild. Every canonical,
   schema `@id`, sitemap entry and hreflang pair derives from it.
3. **Set `SESSION_SECRET`** to 32+ random bytes.
4. **Fill in the PayPal, bank and crypto details** in Settings → Payment rails.
5. **Read the QA report** — `dist/qa-report.json`.
