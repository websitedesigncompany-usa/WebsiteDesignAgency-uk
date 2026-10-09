# Working in this repo

## What this is

A single static site (the "HammadifyDigital Tools" storefront): `index.html`,
`app.js`, `styles.css`, `logo.svg` plus SEO/deployment files. No build step, no
package manager, no dependencies, no backend, no external service credentials.

Catalogue and account state live in browser `localStorage`
(`hammadify_products_v1`, `hammadify_resellers_v1`); the admin password is a
constant in `app.js`. This is intentional and documented in the README's
"production hardening" section — the public customer experience is fully static.

## Source of truth

`main` on this repository is empty (README placeholder only). The site content
was seeded into this branch from `origin/arena/01a0e8e3-websitedesignagency-uk`.
The other remote branch, `origin/arena/01a0e8c9-websitedesignagency-uk`, holds
unrelated campaign media/render assets, not a web app.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Serves the repo root on host port 3000 via `python3 -m http.server` from a
`python:3.12-slim` image with the repo bind-mounted at `/app`.

## Verifying

- `curl -sI http://localhost:3000/` should return `200` and HTML.
- `docker compose -f docker-compose.base44.yml ps` should show `site` healthy
  (its healthcheck fetches `/index.html`).
- Seeded demo logins for the partner workspace (footer "Partner login" button
  or `data-open-portal`): reseller `partner` / `partner2026`, admin `admin` /
  `hammad@digitals786`. Admin unlocks the admin workspace inside the same modal.

## Gotchas

- There is no live-reload dev server. After editing files, refresh the preview
  with the `reload_preview` tool; a server restart is not needed since files are
  served from the bind mount.
- The CSP / header files (`netlify.toml`, `vercel.json`) apply only to those
  hosts. The dev server sends no CSP, so preview embedding is unaffected — do
  not strip those headers from the deployment configs.

## Deployment

Static hosting, documented in the README: Netlify (`netlify.toml`, publish `.`)
or Vercel (`vercel.json`). There is no Base44 publishing flow for this app.
