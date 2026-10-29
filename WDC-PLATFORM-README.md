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
German buyers rather than competing with the root pa