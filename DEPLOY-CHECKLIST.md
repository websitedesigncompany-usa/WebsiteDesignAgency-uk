# Launch checklist — Website Design Company

Print this. Tick every line before you point your domain at it.

## A. One-time setup (I need these from you)

| # | What | Why | Where to get it |
|---|---|---|---|
| 1 | **Cloudflare API token** | Deploy the CDN + attach `websitedesigncompany.site` | dash.cloudflare.com → My Profile → API Tokens → Create → *Edit Cloudflare Workers* + *Zone:Include* |
| 2 | **Vercel token** | Second CDN target / preview | vercel.com → Settings → Account → Tokens |
| 3 | **Netlify auth token** | Third CDN target | app.netlify.com/user/tokens → New Personal Access Token |
| 4 | **GitHub PAT** (`repo` scope) | I create + push the repo | github.com/settings/tokens → Generate → classic → `repo` |
| 5 | **Stateful host account** | Runs the API + SQLite | Render / Railway / Fly — free tier is fine to start |

## B. Set these environment variables on the API host

```bash
NODE_ENV=production
SITE_ORIGIN=https://www.websitedesigncompany.site     # your real domain
SESSION_SECRET=<64 random hex>                       # openssl rand -hex 32
DB_PATH=data/app.db

PAYPAL_MERCHANT_EMAIL=marcomarketing.ali786@gmail.com
PAYPAL_PAY_LINK=https://www.paypal.com/paypalme/<your-handle>
PAYPAL_IPN_VERIFY=https://ipnpb.paypal.com/cgi-bin/webscr   # auto-confirm payments

CRYPTO_NETWORK=USDT (TRC-20)
CRYPTO_WALLET=<your wallet>
```

Bank details are edited in the dashboard (Settings → Payment rails), not in env.

## C. Deploy order

1. `npm run build` on a machine with `SITE_ORIGIN` set — **then** everything else.
   Every canonical, schema `@id`, sitemap URL and hreflang pair is derived from it.
2. Start the API host. Confirm `https://<api-host>/admin/` loads and you can sign in.
3. Deploy `dist/` to the CDN. Set `API=https://<api-host>` in the config first.
4. Smoke-test: submit a form, place a test order, check both appear in the dashboard
   with the correct source page.
5. Attach `websitedesigncompany.site` + `www` on the CDN.
6. Redirect one to the other and make it match `SITE_ORIGIN` exactly.

## D. Change the admin password

Dashboard → Settings → Change your password. The shipped default is:

```
marcomarketing.ali786@gmail.com / ali @qais786
```

Changing it signs out every other session. Do this before anything else.

## E. Post-launch

- [ ] Submit `https://www.websitedesigncompany.site/sitemap.xml` to Google Search Console
- [ ] Same in Bing Webmaster Tools
- [ ] Confirm `https://www.websitedesigncompany.site/llms.txt` and `/llms-detailed.txt` are live
- [ ] Google Analytics + Search Console on the dashboard only (not in `connect-src`)
- [ ] `QA_SAMPLE=0 npm run qa` on a fast disk for a full 16k-page audit
- [ ] Full-depth rebuild: `BUILD_POSTS_PER_LOCATION=12 BUILD_CASES_PER_LOCATION=4 npm run build`

## F. Known limits

- **Cloudflare Pages free tier caps a deployment at 20,000 files.** The current build
  is ~16,300. Raising `BUILD_POSTS_PER_LOCATION` will exceed it — switch to
  Cloudflare **Workers** (as configured in `wrangler.toml`, no file cap on paid) or
  trim the build.
- **The API cannot run on serverless.** SQLite needs a persistent disk. That is why
  `vercel.json` / `netlify.toml` / `wrangler.toml` proxy to a Node host instead of
  running the API as a function — otherwise every lead and order would vanish on
  each cold start.
- **Blog depth.** Ships with 714 posts / 91 case studies. Raise
  `BUILD_POSTS_PER_LOCATION` to go deeper.
