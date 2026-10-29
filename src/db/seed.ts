/**
 * Database seed.
 *
 * Creates the admin account with the credentials supplied in the brief and
 * populates the content tables from the TypeScript data files so the CMS has
 * real content to edit from the first login.
 *
 *   npm run seed
 */

import bcrypt from 'bcryptjs';
import { db, setSetting, logActivity } from './index.js';
import { SITE } from '../config/site.js';
import { SERVICES } from '../data/services.js';
import { packagesFor, SEO_PACKAGES, PPC_PACKAGES } from '../data/packages.js';
import { TESTIMONIALS } from '../data/clients.js';
import { PORTFOLIO } from '../data/clients.js';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function seedUser() {
  const conn = db();
  const email = SITE.admin.email.toLowerCase();
  const existing = conn.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;
  const hash = bcrypt.hashSync(SITE.admin.password, 12);

  if (existing) {
    conn.prepare('UPDATE users SET password_hash = ?, active = 1 WHERE id = ?').run(hash, existing.id);
    console.log(`✓ Admin user updated: ${email}`);
    return existing.id;
  }
  const info = conn
    .prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(email, 'Site Administrator', hash, 'owner');
  console.log(`✓ Admin user created: ${email}`);
  return Number(info.lastInsertRowid);
}

function seedServices() {
  const conn = db();
  const up = conn.prepare(`
    INSERT INTO services (slug, name, primary_keyword, category, tagline, summary, deliverables, faqs, from_price, timeline, status, featured, sort_order)
    VALUES (@slug, @name, @primary_keyword, @category, @tagline, @summary, @deliverables, @faqs, @from_price, @timeline, 'published', @featured, @sort_order)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name, primary_keyword = excluded.primary_keyword, category = excluded.category,
      tagline = excluded.tagline, summary = excluded.summary, deliverables = excluded.deliverables,
      faqs = excluded.faqs, from_price = excluded.from_price, timeline = excluded.timeline, updated_at = datetime('now')
  `);
  let n = 0;
  SERVICES.forEach((s, i) => {
    up.run({
      slug: s.slug || 'website-design-company',
      name: s.name,
      primary_keyword: s.primaryKeyword,
      category: s.category,
      tagline: s.tagline,
      summary: s.summary,
      deliverables: JSON.stringify(s.deliverables),
      faqs: JSON.stringify(s.faqs),
      from_price: s.fromPrice,
      timeline: s.timeline,
      featured: i < 8 ? 1 : 0,
      sort_order: i,
    });
    n += 1;
  });
  console.log(`✓ ${n} services synced`);
}

function seedPackages() {
  const conn = db();
  const up = conn.prepare(`
    INSERT INTO packages (sku, service_slug, name, price_usd, was_price_usd, period, family, suited, features, units, eta, badge, active, sort_order)
    VALUES (@sku, @service_slug, @name, @price_usd, @was_price_usd, @period, @family, @suited, @features, @units, @eta, @badge, 1, @sort_order)
    ON CONFLICT(sku) DO UPDATE SET
      name = excluded.name, price_usd = excluded.price_usd, was_price_usd = excluded.was_price_usd,
      period = excluded.period, suited = excluded.suited, features = excluded.features,
      units = excluded.units, eta = excluded.eta, badge = excluded.badge, updated_at = datetime('now')
  `);
  let n = 0;
  let i = 0;
  for (const s of SERVICES) {
    for (const p of packagesFor(s.slug, s.packageSet)) {
      const wasMap: Record<string, number> = {
        'seo-booster': 299, 'seo-retainer': 499, 'seo-geo-aeo': 499,
        'seo-local': 599, 'seo-ecommerce': 899, 'ppc-startup': 299, 'ppc-ongoing': 499,
      };
      up.run({
        sku: p.sku, service_slug: s.slug || 'website-design-company', name: p.name,
        price_usd: p.usd, was_price_usd: wasMap[p.id] || null, period: p.period,
        family: s.packageSet, suited: p.suited, features: JSON.stringify(p.features),
        units: p.units || null, eta: p.eta, badge: p.badge || null, sort_order: i,
      });
      i += 1;
      n += 1;
    }
  }
  console.log(`✓ ${n} packages synced`);
}

function seedTestimonials() {
  const conn = db();
  const up = conn.prepare(`
    INSERT INTO testimonials (name, role, company, location, service_slug, rating, quote, outcome, featured, sort_order)
    VALUES (@name, @role, @company, @location, @service_slug, @rating, @quote, @outcome, @featured, @sort_order)
  `);
  const existing = conn.prepare('SELECT COUNT(*) as c FROM testimonials').get() as { c: number };
  if (existing.c === 0) {
    const tx = conn.transaction(() => {
      TESTIMONIALS.forEach((t, i) => {
        up.run({
          name: t.name, role: t.role, company: t.company, location: t.location,
          service_slug: t.serviceSlug, rating: t.rating, quote: t.quote, outcome: t.outcome,
          featured: t.featured ? 1 : 0, sort_order: i,
        });
      });
    });
    tx();
    console.log(`✓ ${TESTIMONIALS.length} testimonials seeded`);
  } else {
    console.log(`✓ ${existing.c} testimonials already present (skipped)`);
  }
}

function seedPortfolio() {
  const conn = db();
  const existing = conn.prepare('SELECT COUNT(*) as c FROM portfolio').get() as { c: number };
  if (existing.c > 0) {
    console.log(`✓ ${existing.c} portfolio items already present (skipped)`);
    return;
  }
  const up = conn.prepare(`
    INSERT INTO portfolio (slug, title, client, industry, location, year, summary, challenge, approach, results, stack, services, palette, cover_style, status, published_at, featured, sort_order)
    VALUES (@slug, @title, @client, @industry, @location, @year, @summary, @challenge, @approach, @results, @stack, @services, @palette, @cover_style, 'published', @published_at, @featured, @sort_order)
  `);
  const tx = conn.transaction(() => {
    PORTFOLIO.forEach((p, i) => {
      up.run({
        slug: p.slug, title: p.title, client: p.client, industry: p.industry, location: p.location,
        year: p.year, summary: p.summary, challenge: p.challenge, approach: p.approach,
        results: JSON.stringify(p.results), stack: JSON.stringify(p.stack),
        services: JSON.stringify(p.serviceSlugs), palette: JSON.stringify(p.palette),
        cover_style: p.coverStyle, published_at: new Date().toISOString().slice(0, 10),
        featured: p.featured ? 1 : 0, sort_order: i,
      });
    });
  });
  tx();
  console.log(`✓ ${PORTFOLIO.length} portfolio items seeded`);
}

/** Import the generated post/case/page inventory so the CMS can edit it. */
function seedGeneratedContent() {
  const exportPath = path.join(ROOT, 'dist/content-export.json');
  if (!existsSync(exportPath)) {
    console.log('… dist/content-export.json not found — run `npm run build` first to import generated content');
    return;
  }
  const payload = JSON.parse(readFileSync(exportPath, 'utf8'));
  const conn = db();

  const postUp = conn.prepare(`
    INSERT INTO posts (slug, path, title, primary_keyword, meta_title, meta_description, excerpt, category, service_slug, country_code, city_slug, prefix, author, status, published_at, read_minutes, seo_score)
    VALUES (@slug, @path, @title, @primary_keyword, @meta_title, @meta_description, @excerpt, @category, @service_slug, @country_code, @city_slug, @prefix, @author, 'published', @published_at, @read_minutes, @seo_score)
    ON CONFLICT(path) DO UPDATE SET
      title = excluded.title, primary_keyword = excluded.primary_keyword,
      meta_title = excluded.meta_title, meta_description = excluded.meta_description,
      excerpt = excluded.excerpt, category = excluded.category, updated_at = datetime('now')
  `);

  const caseUp = conn.prepare(`
    INSERT INTO case_studies (slug, path, title, primary_keyword, client, industry, location, year, summary, results, services, prefix, country_code, city_slug, status, published_at, featured, seo_score)
    VALUES (@slug, @path, @title, @primary_keyword, @client, @industry, @location, @year, @summary, @results, @services, @prefix, @country_code, @city_slug, 'published', @published_at, 0, @seo_score)
    ON CONFLICT(path) DO UPDATE SET title = excluded.title, summary = excluded.summary, updated_at = datetime('now')
  `);

  let posts = 0;
  let cases = 0;
  const tx = conn.transaction(() => {
    for (const p of payload.pages) {
      if (p.type === 'blog-post' && p.post) {
        const prefix = p.country ? (p.city ? `/${p.country.toLowerCase()}/${p.city}` : p.country === 'US' ? '' : `/${p.country.toLowerCase()}`) : '';
        postUp.run({
          slug: p.post.slug, path: p.path, title: p.title, primary_keyword: p.keyword,
          meta_title: null, meta_description: null, excerpt: p.excerpt,
          category: p.post.category, service_slug: p.serviceSlug || '',
          country_code: p.country, city_slug: p.city, prefix,
          author: p.post.author, published_at: p.post.date,
          read_minutes: Math.max(1, Math.round(p.post.words / 220)),
          seo_score: 100,
        });
        posts += 1;
      }
      if (p.type === 'case-study' && p.caseStudy) {
        const prefix = p.country ? (p.city ? `/${p.country.toLowerCase()}/${p.city}` : p.country === 'US' ? '' : `/${p.country.toLowerCase()}`) : '';
        caseUp.run({
          slug: p.caseStudy.slug, path: p.path, title: p.title, primary_keyword: p.keyword,
          client: null, industry: p.caseStudy.industry, location: null, year: null,
          summary: p.excerpt, results: JSON.stringify(p.caseStudy.results),
          services: JSON.stringify([]), prefix,
          country_code: p.country, city_slug: p.city,
          published_at: p.updated, seo_score: 100,
        });
        cases += 1;
      }
    }
  });
  tx();
  console.log(`✓ Imported ${posts} posts and ${cases} case studies into the CMS`);
}

function seedSettings() {
  setSetting('site_name', SITE.name);
  setSetting('site_alt_name', SITE.altName);
  setSetting('site_origin', SITE.origin);
  setSetting('contact_email', SITE.contact.email);
  setSetting('contact_official_email', SITE.contact.officialEmail);
  setSetting('contact_phone', SITE.contact.phone);
  setSetting('contact_phone_e164', SITE.contact.phoneE164);
  setSetting('social_instagram', SITE.social.instagram);
  setSetting('admin_email', SITE.admin.email);
  setSetting('payments', JSON.stringify({
    stripe: false,
    paypal: { enabled: true, client_id: process.env.PAYPAL_CLIENT_ID || '', currency: 'USD' },
    crypto: { enabled: true, network: process.env.CRYPTO_NETWORK || 'USDT (TRC-20 / ERC-20)', wallet: process.env.CRYPTO_WALLET || '' },
    bank: {
      enabled: true,
      bank_name: process.env.BANK_NAME || SITE.bank.bankName,
      account_name: process.env.BANK_ACCOUNT_NAME || SITE.bank.accountHolder,
      routing: process.env.BANK_ROUTING || SITE.bank.achRouting,
      account: process.env.BANK_ACCOUNT || SITE.bank.accountNumber,
      swift: process.env.BANK_SWIFT || SITE.bank.swift,
      wire_routing: SITE.bank.wireRouting,
      address: SITE.bank.bankAddress,
    },
    terms: 'Project fees under $1,000 are paid in full upfront. Larger projects are split 50% on approval and 50% on delivery. Retainers are billed monthly in advance and require 30 days notice to cancel. Ad spend is never marked up.',
  }));
  console.log('✓ Settings written');
}

function main() {
  const conn = db();
  console.log('▸ Seeding database…');
  const userId = seedUser();
  seedServices();
  seedPackages();
  seedTestimonials();
  seedPortfolio();
  seedGeneratedContent();
  seedSettings();
  logActivity(userId, 'seed', 'system', 0, 'Database seeded');
  const counts = conn
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM users) users,
        (SELECT COUNT(*) FROM services) services,
        (SELECT COUNT(*) FROM packages) packages,
        (SELECT COUNT(*) FROM posts) posts,
        (SELECT COUNT(*) FROM case_studies) cases,
        (SELECT COUNT(*) FROM portfolio) portfolio,
        (SELECT COUNT(*) FROM testimonials) testimonials`,
    )
    .get();
  console.log('');
  console.log('  Done:', counts);
  console.log(`  Admin login: ${SITE.admin.email} / ${SITE.admin.password}`);
  console.log('  ⚠ Change this password immediately after first login.');
}

main();
