/**
 * SQLite schema + connection.
 *
 * Single-file database — no external service to provision, trivial to back up,
 * and fast enough for the write volume a marketing site produces.
 */

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '../../data');
export const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'app.db');

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  mkdirSync(DATA_DIR, { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma('journal_mode = WAL');
  conn.pragma('foreign_keys = ON');
  conn.pragma('busy_timeout = 5000');
  migrate(conn);
  _db = conn;
  return conn;
}

function migrate(conn: Database.Database) {
  conn.exec(`
  -- ── Users / auth ────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL DEFAULT 'Administrator',
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin',
    avatar        TEXT,
    last_login_at TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    active        INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip         TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

  -- ── Leads (every form submission on the site) ────────────────────────────
  CREATE TABLE IF NOT EXISTS leads (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    company       TEXT,
    service       TEXT,
    service_interest TEXT,
    region        TEXT,
    budget        TEXT,
    timeline      TEXT,
    message       TEXT,
    domain        TEXT,
    -- Provenance: which page produced the lead
    page_url      TEXT,
    page_path     TEXT,
    page_title    TEXT,
    page_type     TEXT,
    referrer      TEXT,
    utm_source    TEXT,
    utm_medium    TEXT,
    utm_campaign  TEXT,
    utm_term      TEXT,
    utm_content   TEXT,
    gclid         TEXT,
    fbclid        TEXT,
    device        TEXT,
    screen        TEXT,
    lang          TEXT,
    form_variant  TEXT,
    ip            TEXT,
    status        TEXT NOT NULL DEFAULT 'new',
    rating        INTEGER,
    notes         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_leads_page ON leads(page_path);
  CREATE INDEX IF NOT EXISTS idx_leads_service ON leads(service);

  -- ── Orders / payments ────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    order_ref      TEXT NOT NULL UNIQUE,
    sku            TEXT NOT NULL,
    package_id     TEXT,
    package_name   TEXT NOT NULL,
    service_slug   TEXT,
    service_name   TEXT,
    amount_usd     REAL NOT NULL,
    amount_local   REAL,
    currency       TEXT NOT NULL DEFAULT 'USD',
    period         TEXT NOT NULL DEFAULT 'one-time',
    -- Stripe is not used. Settlement rails:
    pay_method     TEXT,            -- paypal | card | bank | crypto
    pay_status     TEXT NOT NULL DEFAULT 'pending', -- pending | awaiting_payment | paid | failed | refunded
    pay_ref        TEXT,            -- provider transaction id
    pay_url        TEXT,            -- provider-hosted checkout link
    crypto_address TEXT,
    crypto_network TEXT,
    notes          TEXT,
    internal_notes TEXT,
    -- Customer
    name           TEXT NOT NULL,
    email          TEXT NOT NULL,
    phone          TEXT,
    company        TEXT,
    region         TEXT,
    domain         TEXT,
    customer_notes TEXT,
    page_path      TEXT,
    ip             TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at        TEXT,
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(pay_status);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

  CREATE TABLE IF NOT EXISTS order_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event      TEXT NOT NULL,
    detail     TEXT,
    actor      TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

  -- ── CMS: pages (override or create any URL) ──────────────────────────────
  CREATE TABLE IF NOT EXISTS pages (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    path          TEXT NOT NULL UNIQUE,
    page_type     TEXT NOT NULL DEFAULT 'custom',
    title         TEXT NOT NULL,
    primary_keyword TEXT,
    meta_title    TEXT,
    meta_description TEXT,
    h1            TEXT,
    h2            TEXT,
    body          TEXT,             -- markdown/HTML
    excerpt       TEXT,
    status        TEXT NOT NULL DEFAULT 'draft', -- draft | published | scheduled
    published_at  TEXT,
    scheduled_for TEXT,
    author        TEXT,
    template      TEXT,
    parent_id     INTEGER REFERENCES pages(id) ON DELETE SET NULL,
    seo_score     INTEGER,
    views         INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
  CREATE INDEX IF NOT EXISTS idx_pages_type ON pages(page_type);

  -- ── CMS: posts ───────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS posts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL,
    path          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    primary_keyword TEXT,
    meta_title    TEXT,
    meta_description TEXT,
    excerpt       TEXT,
    body          TEXT,
    category      TEXT,
    tags          TEXT,
    service_slug  TEXT,
    country_code  TEXT,
    city_slug     TEXT,
    prefix        TEXT DEFAULT '',
    author        TEXT,
    status        TEXT NOT NULL DEFAULT 'draft',
    published_at  TEXT,
    scheduled_for TEXT,
    featured      INTEGER NOT NULL DEFAULT 0,
    read_minutes  INTEGER DEFAULT 5,
    seo_score     INTEGER,
    views         INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
  CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

  -- ── CMS: case studies ────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS case_studies (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL,
    path          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    primary_keyword TEXT,
    meta_title    TEXT,
    meta_description TEXT,
    client        TEXT,
    industry      TEXT,
    location      TEXT,
    year          INTEGER,
    summary       TEXT,
    challenge     TEXT,
    approach      TEXT,
    results       TEXT,          -- JSON
    stack         TEXT,          -- JSON
    services      TEXT,          -- JSON
    palette       TEXT,          -- JSON
    cover_style   TEXT,
    prefix        TEXT DEFAULT '',
    country_code  TEXT,
    city_slug     TEXT,
    status        TEXT NOT NULL DEFAULT 'draft',
    published_at  TEXT,
    featured      INTEGER NOT NULL DEFAULT 0,
    seo_score     INTEGER,
    views         INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- ── CMS: portfolio ───────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS portfolio (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    client        TEXT,
    industry      TEXT,
    location      TEXT,
    year          INTEGER,
    summary       TEXT,
    challenge     TEXT,
    approach      TEXT,
    results       TEXT,
    stack         TEXT,
    services      TEXT,
    palette       TEXT,
    cover_style   TEXT,
    cover_image   TEXT,
    gallery       TEXT,          -- JSON array of media ids
    prefix        TEXT DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'draft',
    published_at  TEXT,
    featured      INTEGER NOT NULL DEFAULT 0,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    seo_score     INTEGER,
    views         INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- ── CMS: galleries ───────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS galleries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    description   TEXT,
    prefix        TEXT DEFAULT '',
    cover         TEXT,
    status        TEXT NOT NULL DEFAULT 'draft',
    published_at  TEXT,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    gallery_id  INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    media_id    INTEGER,
    title       TEXT,
    alt         TEXT,
    caption     TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0
  );

  -- ── Media library ────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS media (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    original_name TEXT,
    path          TEXT NOT NULL,
    mime          TEXT NOT NULL,
    width         INTEGER,
    height        INTEGER,
    size_bytes    INTEGER,
    alt           TEXT,
    title         TEXT,
    folder        TEXT DEFAULT 'general',
    uploaded_by   INTEGER,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);

  -- ── Services / packages (editable from the admin) ────────────────────────
  CREATE TABLE IF NOT EXISTS services (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    primary_keyword TEXT,
    category      TEXT,
    tagline       TEXT,
    summary       TEXT,
    deliverables  TEXT,
    faqs          TEXT,
    from_price    REAL,
    timeline      TEXT,
    status        TEXT NOT NULL DEFAULT 'published',
    featured      INTEGER NOT NULL DEFAULT 0,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS packages (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sku           TEXT NOT NULL UNIQUE,
    service_slug  TEXT NOT NULL,
    name          TEXT NOT NULL,
    price_usd     REAL NOT NULL,
    was_price_usd REAL,
    period        TEXT NOT NULL DEFAULT 'one-time',
    family        TEXT NOT NULL DEFAULT 'standard',
    suited        TEXT,
    features      TEXT,
    units         TEXT,
    eta           TEXT,
    badge         TEXT,
    active        INTEGER NOT NULL DEFAULT 1,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_packages_service ON packages(service_slug);

  -- ── Testimonials ─────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS testimonials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    role        TEXT,
    company     TEXT,
    location    TEXT,
    service_slug TEXT,
    rating      INTEGER NOT NULL DEFAULT 5,
    quote       TEXT NOT NULL,
    outcome     TEXT,
    featured    INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- ── CRM: client profiles (auto-created from every lead and order) ────────
  CREATE TABLE IF NOT EXISTS clients (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT,
    company       TEXT,
    domain        TEXT,
    country       TEXT,
    city          TEXT,
    service       TEXT,
    status        TEXT NOT NULL DEFAULT 'lead',
    source_page   TEXT,
    source_campaign TEXT,
    first_seen    TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen     TEXT NOT NULL DEFAULT (datetime('now')),
    total_leads   INTEGER NOT NULL DEFAULT 0,
    total_orders  INTEGER NOT NULL DEFAULT 0,
    lifetime_value REAL NOT NULL DEFAULT 0,
    notes         TEXT,
    tags          TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
  CREATE INDEX IF NOT EXISTS idx_clients_lastseen ON clients(last_seen DESC);
  CREATE INDEX IF NOT EXISTS idx_clients_value ON clients(lifetime_value DESC);

  -- ── EMS: enquiries attached to a client profile ───────────────────────────
  CREATE TABLE IF NOT EXISTS enquiries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id     INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    channel       TEXT NOT NULL DEFAULT 'form',
    subject       TEXT NOT NULL,
    message       TEXT,
    status        TEXT NOT NULL DEFAULT 'new',
    order_id      INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    assigned_to   TEXT,
    next_action   TEXT,
    next_action_at TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_enquiries_client ON enquiries(client_id);
  CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
  CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

  -- ── CRM: activity timeline per client ─────────────────────────────────────
  CREATE TABLE IF NOT EXISTS client_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    detail      TEXT,
    order_id    INTEGER,
    lead_id     INTEGER,
    actor       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_client_events_client ON client_events(client_id);
  CREATE INDEX IF NOT EXISTS idx_client_events_created ON client_events(created_at DESC);

  -- ── Settings ─────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- ── Activity log ─────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS activity (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    action      TEXT NOT NULL,
    entity      TEXT,
    entity_id   TEXT,
    detail      TEXT,
    ip          TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at DESC);

  -- ── SEO overrides for any URL ────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS seo_overrides (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    path          TEXT NOT NULL UNIQUE,
    meta_title    TEXT,
    meta_description TEXT,
    primary_keyword TEXT,
    h1            TEXT,
    h2            TEXT,
    canonical     TEXT,
    robots        TEXT,
    og_image      TEXT,
    schema_extra  TEXT,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `);
}

/** Convenience: read a setting with a fallback. */
export function getSetting(key: string, fallback = ''): string {
  const row = db().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string): void {
  db().prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
  ).run(key, value);
}

export function logActivity(userId: number | null, action: string, entity?: string, entityId?: string | number, detail?: string, ip?: string) {
  db().prepare(
    'INSERT INTO activity (user_id, action, entity, entity_id, detail, ip) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(userId, action, entity || null, entityId != null ? String(entityId) : null, detail || null, ip || null);
}
