# HammadifyDigital Tools

Launch-ready static storefront and partner workspace for `hammadifydigitaltools.com`.

## Included

- Responsive catalogue inspired by modern digital-tool storefronts
- Search and category filtering across the supplied tool list
- Product detail modal with delivery and warranty notes
- WhatsApp CTAs with the selected product pre-filled
- Admin workspace for product add, edit, delete and visibility management
- Reseller workspace with credential management and partner catalogue view
- Generated SVG logo, favicon and installable web manifest
- SEO metadata, sitemap, robots file and deployment headers for Netlify/Vercel

## Run locally

No build step or dependency install is needed. Serve the folder over HTTP so browser dialogs and storage behave consistently:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

### Preview credentials

The seeded demo reseller is:

- Username: `partner`
- Password: `partner2026`

The admin login is:

- Username: `admin`
- Password: `hammad@digitals786`

Change these before sharing a public deployment.

## Deploy

### Netlify

Import the repository in Netlify. The included `netlify.toml` sets the publish directory to the repository root.

### Vercel

Import the repository in Vercel. The included `vercel.json` enables clean URLs and security headers. No framework preset is needed.

## Important production hardening

The included admin and reseller workspace is deliberately dependency-free and uses browser `localStorage`, which makes it ideal for previewing the complete flow and deploying the public catalogue immediately. Browser storage is not a secure multi-user database: before using this with live credentials or sharing admin access across devices, move authentication and catalogue writes behind server-side routes and a private database (for example, Supabase, Neon or a protected Netlify/Vercel function), hash passwords, rotate the admin secret, and remove the demo reseller.

The public customer experience is fully static and does not expose any product account credentials.
