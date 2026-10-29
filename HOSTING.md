# Hosting recommendation

Your site is **49,799 pages / 8.3 GB** of static HTML plus a stateful Node API with
SQLite. Those two facts decide everything, so here is the reasoning and the
recommendation.

---

## The two hard constraints

**1. File count per deployment.** This is the binding constraint, not bandwidth.

| Host | Free-tier file cap | Bandwidth | Commercial use? |
|---|---:|---|---|
| Cloudflare Pages (Free) | **20,000** | Unlimited | ✅ |
| Cloudflare Workers Free (static assets) | **20,000** | Unlimited | ✅ |
| Cloudflare Workers **Paid** ($5/mo) | **100,000** | Unlimited | ✅ |
| Vercel Hobby | 12,500 | 100 GB | ❌ **non-commercial only** |
| Netlify Free | no hard cap | ~15 GB (300 credits) | ✅ |
| GitHub Pages | 1 GB total site | 100 GB | ✅ |
| CloudBase Free | 3,000 resource points, 1 environment | unpublished | ✅ |

At 49,799 files we exceed the free cap on Cloudflare Pages, Workers Free,
Vercel and GitHub Pages.

**2. The database needs a real disk.** Leads, orders, client profiles and the
CMS all live in SQLite. On any serverless or edge runtime the filesystem is
ephemeral — `/tmp` is wiped on every cold start, and Cloudflare `workerd`
cannot load a native module like `better-sqlite3` at all. Running the API
there would **silently lose every lead and every order**. This is the reason
the deployment configs proxy `/api`, `/admin` and `/uploads` to a separate Node
host instead of running the API as a function.

---

## The recommendation

### Static site — Cloudflare

**Cloudflare is the right choice for the site.** It is the only free option
that allows commercial use *and* has genuinely unlimited bandwidth, and it is
the only one where you can attach `websitedesigncompany.site` without a
migration later.

To fit the free tier, use the **CDN tier build**, which is sized to land
under the 20,000-file cap:

```bash
BUILD_TIER=cdn npm run build
```

```
cdn tier  : 19,144 files   (cap: 20,000 — 857 to spare)
  services  9,012
  posts     4,402
  cases       869
  tool pages 1,080
```

The CDN tier keeps **every service in every one of the 72 countries** and the
full 283-city hub set. It trims only the deepest combinations: city-level
pages for the 67 more specialised services, and city-level tool pages. The
12 services that keep a city page are the ones with genuine local search
intent:

> website design · website development · SEO · local SEO · ecommerce design ·
> Google Ads · social media management · Google Business Profile ·
> website maintenance · WordPress · Shopify · logo design

If you later want the complete 49,799 pages, it is **$5/month**: upgrade the
Worker to the Paid plan and the cap becomes 100,000 files. No rebuild needed —
same build, different deploy target.

### The API — a small always-on host

The API needs a persistent disk, so it cannot be serverless. Cheapest options
that actually work:

| Option | Cost | Notes |
|---|---:|---|
| **Oracle Cloud Always Free** | $0 | 4 ARM cores + 200 GB disk, genuinely permanent. Best free option, but fiddly to set up. |
| **Hetzner CX22 / CAX11** | ~€4/mo | 2 vCPU, 4 GB RAM, 40 GB disk in Frankfurt/Helsinki. The best value and the easiest. |
| **Contabo Cloud VPS 10** | ~€5/mo | 4 vCPU, 8 GB RAM, 75 GB NVMe. |
| **Render / Railway / Fly** | $0–$7/mo | Free tiers exist but the disk is ephemeral — your data would vanish. Only use with an external database. |
| **Cloudflare D1** | free tier | SQLite at the edge, 5 M reads/day, 100 K writes/day. Genuinely free and a good fit for this volume — but it means rewriting the data layer from `better-sqlite3` to D1's API. Worth doing if you want to stay 100% serverless and free. |

**My pick: Hetzner at ~€4/month for the API.** It is the smallest amount of
money that gives you a real disk, a stable IP, cron for backups, and
zero surprise bills.

---

## CloudBase — is it suitable?

**Not for this site, and I would not choose it here.** The `@cloudbase`
capability is not currently exposed as a Connector tool in this session, so I
could not test it directly. Judging from Tencent's published pricing:

- **Free tier is 3,000 resource points** shared across database, functions,
  storage *and* traffic. It does not publish per-resource caps, so you cannot
  tell whether 48,000 files and a Node API fit inside it.
- **The free tier forbids pay-as-you-go overage.** If you exceed the quota the
  environment stops working — it does not quietly bill you.
- **The free tier renews once for six months.** It is not a permanent free
  hosting home for a client's production site.
- The $19.9/mo Personal plan is comparable to Hetzner but with an opaque
  points model in front of it.

CloudBase is a reasonable choice for a Chinese-market deployment or an
existing Tencent commitment. For a US-and-Global agency site with a custom
domain, Cloudflare + a $4 VPS is simpler, cheaper to predict, and has no
expiry cliff.

---

## What to ask for

Whichever you choose, I need:

1. **Cloudflare** — an API token with *Workers Scripts: Edit*, *Pages: Edit*
   and *Zone: Include* for `websitedesigncompany.site`.
   *(This single account covers the static site, the Worker proxy, DNS and
   the custom domain.)*
2. **A Node host** — an account on Hetzner, Contabo, Oracle Cloud or
   Render that I can SSH into.
3. **GitHub** — a personal access token with the `repo` scope, so I can push
   the repository and switch on CI.

If you would rather avoid the second account entirely, say so and I will
refactor the data layer onto **Cloudflare D1** — then the whole system is
Cloudflare, and genuinely free at your volume.

---

## Recommended setup

```
websitedesigncompany.site        →  Cloudflare Worker (static assets + proxy)
www.websitedesigncompany.site    →  same
api.websitedesigncompany.site    →  Hetzner VPS (Express + SQLite, persistent disk)
```

DNS:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `@` | the Worker target your dashboard gives you |
| `CNAME` | `www` | the same target |
| `CNAME` | `api` | your Hetzner VPS |

Set the apex to redirect to `www` (or the reverse) and make `SITE_ORIGIN`
match whichever you keep — every canonical tag, schema `@id`, sitemap entry
and `llms.txt` URL is derived from it.
