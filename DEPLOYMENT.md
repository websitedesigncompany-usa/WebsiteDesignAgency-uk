# Deployment

The site is a **hybrid**: a large static build served from a CDN, plus a small
stateful Node service that owns the database.

```
   Browser
      │
      ▼
 ┌──────────────────────────────────────────┐
 │  Vercel / Netlify / Cloudflare  (CDN)    │   16,266 static pages, served from the edge
 │  dist/  ·  /assets  ·  /sitemap*.xml     │   ~0 TTFB, immutable caching on assets
 └───────────────┬──────────────────────────┘
                 │  proxy /api  /admin  /uploads
                 ▼
 ┌──────────────────────────────────────────┐
 │  Node host  (Render / Railway / Fly / VPS)│   Express + SQLite
 │  data/app.db  ·  data/uploads/           │   leads, orders, CMS, sessions
 └──────────────────────────────────────────┘
```

## Why the API is not a serverless function

The API uses **SQLite** for sessions, leads and orders. Serverless and edge
runtimes have ephemeral filesystems (Vercel/Netlify `/tmp`) or no native
modules at all (Cloudflare `workerd` cannot load `better-sqlite3`). Running the
API there would **silently lose every lead and order on each cold start**.

So the CDN proxies `/api`, `/admin` and `/uploads` to a long-lived Node host
with a persistent disk. The browser still sees a single origin, so session
cookies and CSRF work with no CORS configuration.

---

## 1. GitHub

```bash
cd /path/to/website-design-company
git init
git add -A
git commit -m "Website Design Company"
gh repo create websitedesigncompany --public --source=. --push
```

or on github.com: **New repository** → name `websitedesigncompany` → public →
push the existing branch.

`.github/workflows/build.yml` runs typecheck → build → QA on every push and
fails the job if any page breaks the SEO gate or any internal link is dead.

---

## 2. The stateful API host

Any of these work. You need a **persistent volume** for `data/`.

### Render
1. New → Web Service → connect the repo
2. Build: `npm ci`
3. Start: `npm start`
4. Environment: `NODE_ENV=production`, `SITE_ORIGIN`, `SESSION_SECRET`
5. Add a Disk mounted at `/opt/render/project/src/data`
6. Deploy → note the URL, e.g. `https://wdc-api.onrender.com`

### Railway
```bash
railway init
railway up
railway volume add --mount /data      # then set DB_PATH=/data/app.db
```

### Fly.io
```bash
fly launch --no-deploy
fly volumes create wdc_data --size 10    # mount at /data
fly secrets set SESSION_SECRET=... SITE_ORIGIN=...
fly deploy
```

### Any VPS
```bash
git clone <repo> && cd website-design-company
npm ci
npm run build
npm run seed
NODE_ENV=production SESSION_SECRET=$(openssl rand -hex 32) npm start
```
Behind nginx/Caddy with TLS and a process manager (systemd, pm2).

---

## 3. The CDN

Set `SITE_ORIGIN` and `API` first, then deploy.

```bash
export SITE_ORIGIN="https://www.websitedesigncompany.site"
export API="https://wdc-api.onrender.com"   # or your host
```

### Vercel
```bash
npm i -g vercel
vercel link
npm run build:deploy
vercel --prod
```
`vercel.json` rewrites `/api/*`, `/admin/*` and `/uploads/*` to `$API`.

### Netlify
```bash
npm i -g netlify-cli
netlify link
npm run build:deploy
netlify deploy --prod --dir=dist
```
`netlify.toml` proxies the same three prefixes.

### Cloudflare
```bash
npm i -g wrangler
npx wrangler login
npm run build:deploy
npx wrangler deploy
```
`worker/index.ts` serves the static build and proxies the same prefixes.
Set the domain to `websitedesigncompany.site` and `www.` in the Cloudflare
dashboard, or uncomment the `[[routes]]` block in `wrangler.toml`.

### GitHub Pages (static only)
`dist/` is self-contained for the public site. Enable Pages on the repo with
`/dist` as the source. The API and admin will not be available there — point
those paths at the Node host through a custom domain CNAME or the links in
`wrangler.toml` / `vercel.json` / `netlify.toml`.

---

## 4. Custom domain

`websitedesigncompany.site` — after the CDN deploy succeeds:

- **Cloudflare** — the zone is on Cloudflare, so add a Custom Domain in
  Workers & Pages. DNS updates automatically.
- **Vercel** — Settings → Domains → Add, then point the A/CNAME records.
- **Netlify** — Domain settings → Add a domain.

Then set the apex to redirect to `www` (or vice versa) — pick one canonical
host and match it to `SITE_ORIGIN` exactly, otherwise canonicals and schema
will disagree.

### DNS records

| Type | Name | Value |
|---|---|---|
| `CNAME` | `www` | the CDN target your dashboard gives you |
| `A` / `ALIAS` | `@` | the CDN target |
| `CNAME` | `api` | your Node host |

---

## 5. Before go-live checklist

- [ ] `SITE_ORIGIN` set to the real domain and the site **rebuilt** — every
      canonical, schema `@id`, sitemap entry and hreflang pair derives from it
- [ ] Admin password changed (Dashboard → Settings)
- [ ] `SESSION_SECRET` set to 32+ random bytes
- [ ] PayPal merchant email + PayPal.me link set
- [ ] Bank and crypto wallet details filled in (Settings → Payment rails)
- [ ] `npm run qa` run on a fast disk with `QA_SAMPLE=0` for a full pass
- [ ] `sitemap.xml` submitted to Google Search Console + Bing Webmaster Tools
- [ ] `/llms.txt` and `/llms-detailed.txt` verified live at the root
- [ ] One live form submission received and visible in the dashboard, with
      the correct source page recorded
- [ ] One test order placed end to end and marked paid

---

## Environment variables

See `.env.example` for the full annotated list.

```bash
SITE_ORIGIN=https://www.websitedesigncompany.site
NODE_ENV=production
SESSION_SECRET=<64 random hex chars>
DB_PATH=data/app.db

PAYPAL_MERCHANT_EMAIL=you@domain.com
PAYPAL_PAY_LINK=https://www.paypal.com/paypalme/yourhandle
PAYPAL_IPN_VERIFY=https://ipnpb.paypal.com/cgi-bin/webscr

BANK_NAME=...            BANK_ROUTING=...   BANK_ACCOUNT=...
CRYPTO_NETWORK=USDT (TRC-20)                CRYPTO_WALLET=...
```
