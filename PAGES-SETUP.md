# Putting the site on GitHub Pages

The platform source is already on GitHub at
[`websitedesigncompany-usa/WebsiteDesignAgency-uk`](https://github.com/websitedesigncompany-usa/WebsiteDesignAgency-uk)
(branch `main`).

Two things are worth knowing before you flip anything:

- **GitHub serves a project site from `/<repo>/`**, not from the domain root.
  So the live copy is at
  `https://websitedesigncompany-usa.github.io/WebsiteDesignAgency-uk/`.
  The build handles that with the `SITE_BASE_PATH` setting — every
  navigational link, asset reference, the web manifest and the client-side
  search index carry the prefix, while canonicals, hreflang and the sitemaps
  stay pointed at `https://www.websitedesigncompany.site`. That is deliberate:
  the GitHub copy is a mirror, not the canonical home, and it must not compete
  with the real domain in search results.
- **The API and client dashboard stay on a Node host.** GitHub Pages serves
  static files only. The forms degrade gracefully when the API is not
  reachable, which is what you want on a preview.

---

## Option A — one setting, live in a minute

The `gh-pages` branch is already populated with a complete, working build.

1. Open the repository → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. **Branch**: `gh-pages` · **Folder**: `/ (root)`
4. **Save**

GitHub publishes it within a minute or two at
`https://websitedesigncompany-usa.github.io/WebsiteDesignAgency-uk/`.

This is a snapshot. It does not rebuild itself when the source changes.

---

## Option B — GitHub Actions, rebuilds on every push

Better if you want the GitHub copy to stay current. The workflow is already
written and committed at `ci/pages.yml`; it needs to move to
`.github/workflows/pages.yml`, which is the only path GitHub Actions reads.

**Using the GitHub web interface** — *Add file* → *Create new file* → type the
path `.github/workflows/pages.yml` → paste the contents below → *Commit changes*.

**Using git** — if you have the repository cloned:

```bash
git remote add origin https://github.com/websitedesigncompany-usa/WebsiteDesignAgency-uk.git
git fetch origin
git checkout -b pages-work origin/main
git mv ci/pages.yml .github/workflows/pages.yml
git commit -m "Activate the GitHub Pages deploy workflow"
git push origin pages-work:main
```

Then set **Settings → Pages → Source** to **GitHub Actions**.

Every push to `main` then rebuilds the site and republishes it. The workflow
builds a wider market set than the `gh-pages` snapshot — fourteen countries
and fourteen cities, about 2,800 pages — because GitHub Actions builds the
site on its own runner rather than pushing files one commit at a time.

### The workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    name: Build the site
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      NODE_OPTIONS: '--max-old-space-size=2300'
      SITE_ORIGIN: 'https://www.websitedesigncompany.site'
      SITE_BASE_PATH: '/WebsiteDesignAgency-uk'
      BUILD_TIER: 'preview'
      BUILD_PREVIEW_COUNTRIES: 'uk,uae,de,ksa,india,pk,ca,au,fr,es,it,nl,ie,singapore'
      BUILD_PREVIEW_CITIES: 'london,manchester,dubai,abu-dhabi,berlin,munich,riyadh,jeddah,mumbai,delhi,toronto,sydney,paris,rome'

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Audit
        run: npx tsx src/build/qa.ts
        env:
          QA_SAMPLE: '0'
          NODE_OPTIONS: '--max-old-space-size=1600'

      - name: Disable Jekyll
        run: touch dist/.nojekyll

      - name: Configure Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: Upload the site
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    name: Publish
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
        with:
          enablement: true
```

---

## Where the site is live right now

| Host | URL | Contents |
|---|---|---|
| Platform subdomain | `https://edw7538i4d8ub.space.mcode.io` | 1,019 pages — USA, UK, UAE, Germany and six cities |
| GitHub Pages | `https://websitedesigncompany-usa.github.io/WebsiteDesignAgency-uk/` | the same build, mirrored at the repository sub-path |
| Production (planned) | `https://www.websitedesigncompany.site` | the full 45,555-page build |

The full build is 45,555 pages and 11 GB — far past GitHub Pages' 1 GB site
limit and 10,000 file limit, so GitHub Pages carries a market subset by
design. The complete build belongs on the CDN or the VPS described in
`HOSTING.md`.
