/**
 * Express server.
 *
 *   npm run dev     — development
 *   npm start       — production
 *
 * Serves the built static site from dist/ and exposes:
 *   POST /api/leads        — every form on the site
 *   POST /api/orders       — checkout
 *   GET  /api/search       — client-side search
 *   /api/admin/*           — CMS (session + CSRF protected)
 *   /admin/*               — dashboard UI
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import crypto from 'node:crypto';

import { db, getSetting, setSetting, logActivity } from '../db/index.js';
import { SITE } from '../config/site.js';
import { packagesFor, formatPrice, priceForSchema } from '../data/packages.js';
import { SERVICE_BY_SLUG, SERVICES } from '../data/services.js';
import { COUNTRY_BY_CODE, COUNTRIES, HOME_COUNTRY } from '../data/regions.js';
import {
  attachUser, requireAuth, requireOwner, requireCsrf, setSessionCookie, clearSessionCookie,
  createSession, destroySession, verifyPassword, csrfToken, SESSION_COOKIE, type AuthedRequest,
} from './auth.js';
import bcrypt from 'bcryptjs';

const bcryptCompare = (plain: string, hash: string) => {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
};
import { createOrder, markOrderPaid, paymentConfig, verifyPaypalIpn, handlePaypalPayment, type PayMethod } from './payments.js';
import { upsertClient, createEnquiry, logClientEvent, crmReport, clientDetail } from './crm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'dist');
const UPLOAD_DIR = path.join(ROOT, 'data/uploads');
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ── Security headers ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  );
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// ── Rate limits ──────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});
const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again in a few minutes or call us directly.' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use('/api', apiLimiter);
app.use('/api/leads', formLimiter);
app.use('/api/orders', formLimiter);
app.use('/api/admin/login', loginLimiter);

// ── Helpers ──────────────────────────────────────────────────────────────────

function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || '';
}

/** Map a URL path to a page type for lead provenance. */
const COUNTRY_SLUGS = new Set(COUNTRIES.filter((c) => c.slug).map((c) => c.slug));
const CITY_SLUGS = new Set(COUNTRIES.flatMap((c) => c.cities.map((city) => city.slug)));

function inferPageType(pathname: string): string {
  const p = pathname.replace(/\/+$/, '');
  const segs = p.split('/').filter(Boolean);
  const last = segs[segs.length - 1] || '';

  if (p === '/') return 'home';
  if (last === 'blog' || segs[0] === 'blog') return p === '/blog' || (segs.length === 2 && segs[1] === 'blog') ? 'blog-index' : 'blog-post';
  if (last === 'case-studies') return 'case-index';
  if (segs.includes('case-studies')) return 'case-study';
  if (last === 'portfolio') return 'portfolio-index';
  if (segs.includes('portfolio')) return 'portfolio-item';
  if (segs.includes('industries')) return 'industry';
  if (last === 'checkout') return 'checkout';
  if (last === 'contact') return 'contact';
  if (last === 'packages') return 'packages';
  if (last === 'free-audit') return 'free-audit';
  if (last === 'gallery') return 'gallery';
  if (last === 'faq') return 'faq';

  // Service pages: /{service}/, /{country}/{service}/, /{city}/{service}/,
  // /{country}/{city}/{service}/ — anything whose final segment is a service.
  const SERVICE_SLUGS = new Set(SERVICES.map((x) => x.slug).filter(Boolean));
  if (SERVICE_SLUGS.has(last)) {
    if (segs.length >= 2 && COUNTRY_SLUGS.has(segs[0])) return 'country-service';
    // /{city}/{service}/ (US cities have no country prefix)
    if (segs.length >= 2 && CITY_SLUGS.has(segs[0])) return 'city-service';
    if (segs.length >= 3) return 'city-service';
    return 'service';
  }
  // Location hubs: /{country}/ or /{country}/{city}/
  if (segs.length === 1 && COUNTRY_SLUGS.has(segs[0])) return 'country';
  if (segs.length === 1 || (segs.length === 2 && COUNTRY_SLUGS.has(segs[0]))) return 'city';

  return 'other';
}

const str = (v: unknown, max = 500): string => (typeof v === 'string' ? v.slice(0, max).trim() : '');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lead capture. Every form on every page posts here.
 * The originating page and campaign data are stored so the dashboard can
 * report exactly which page produced each enquiry.
 */
app.post('/api/leads', (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    // Honeypot — bots fill every input.
    if (str(b.company_website, 200)) {
      return res.json({ ok: true, message: 'Thank you — we have your details.' });
    }
    const name = str(b.name, 120);
    const email = str(b.email, 200);
    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a name and a valid email address.' });
    }

    const pagePath = str(b.page_path, 500) || '/';
    const info = db()
      .prepare(
        `INSERT INTO leads
          (name, email, phone, company, service, service_interest, region, budget, timeline, message, domain,
           page_url, page_path, page_title, page_type, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
           gclid, fbclid, device, screen, lang, form_variant, ip, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      )
      .run(
        name, email, str(b.phone, 60), str(b.company, 160), str(b.service, 120), str(b.service_interest, 120),
        str(b.region, 120), str(b.budget, 60), str(b.timeline, 60), str(b.message, 4000), str(b.domain, 200),
        str(b.page_url, 800), pagePath, str(b.page_title, 300), inferPageType(pagePath),
        str(b.referrer, 800), str(b.utm_source, 120), str(b.utm_medium, 120), str(b.utm_campaign, 200),
        str(b.utm_term, 200), str(b.utm_content, 200), str(b.gclid, 200), str(b.fbclid, 200),
        str(b.device, 30), str(b.screen, 30), str(b.lang, 30), str(b.form_variant, 40), clientIp(req),
      );

    const leadId = Number(info.lastInsertRowid);
    logActivity(0, 'lead.created', 'lead', leadId, `${name} — ${pagePath}`);

    // CRM: a client profile is created automatically the first time someone
    // enquires, and every later enquiry attaches to the same profile.
    try {
      const clientId = upsertClient({
        name, email,
        phone: str(b.phone, 60) || null,
        company: str(b.company, 160) || null,
        domain: str(b.domain, 200) || null,
        country: str(b.region, 120) || null,
        city: null,
        service: str(b.service_interest, 120) || str(b.service, 120) || null,
        sourcePage: pagePath,
        sourceCampaign: str(b.utm_campaign, 200) || str(b.utm_source, 120) || null,
        lead: true,
      });
      createEnquiry({
        clientId,
        channel: 'form',
        subject: str(b.service_interest, 120) || str(b.service, 120) || `Enquiry from ${pagePath}`,
        message: str(b.message, 4000),
        actor: 'website form',
      });
      logClientEvent(clientId, 'lead.created', `Enquiry submitted from ${pagePath}`, { leadId });
    } catch (e) {
      console.error('CRM lead sync failed', e);
    }

    res.json({
      ok: true,
      message: 'We reply to every enquiry within one business day.',
    });
  } catch (err) {
    console.error('lead error', err);
    res.status(500).json({ error: 'Something went wrong. Please email us directly.' });
  }
});

/** Client-side search. */
app.get('/api/search', (req: Request, res: Response) => {
  const file = path.join(DIST, 'search-index.json');
  if (!existsSync(file)) return res.json({ results: [] });
  const index = JSON.parse(readFileSync(file, 'utf8'));
  const q = str(req.query.q, 100).toLowerCase().trim();
  if (!q) return res.json({ results: [] });
  const terms = q.split(/\s+/).filter(Boolean);
  const results = index
    .map((r: any) => {
      const hay = `${r.t} ${r.k} ${r.e}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (r.t.toLowerCase().startsWith(t)) score += 12;
        else if (r.t.toLowerCase().includes(t)) score += 7;
        if (r.k.toLowerCase().includes(t)) score += 5;
        if (hay.includes(t)) score += 2;
      }
      return { ...r, score };
    })
    .filter((r: any) => r.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 40);
  res.json({ results, query: q, total: results.length });
});

/** Checkout order creation. */
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    if (str(b.website, 200)) return res.json({ ok: true, ref: 'WDC-RECEIVED' });

    const sku = str(b.sku, 80);
    const name = str(b.name, 120);
    const email = str(b.email, 200);
    if (!sku) return res.status(400).json({ error: 'Missing package SKU.' });
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a name and a valid email address.' });
    }
    if (b.terms !== 'on' && b.terms !== true) {
      return res.status(400).json({ error: 'Please accept the Terms of Service to continue.' });
    }

    // Resolve the package from the server-side catalogue — never trust a
    // client-supplied price.
    let resolved: { usd: number; name: string; period: string; serviceSlug: string } | null = null;
    for (const s of SERVICES) {
      for (const p of packagesFor(s.slug, s.packageSet)) {
        if (p.sku === sku) {
          resolved = { usd: p.usd, name: p.name, period: p.period, serviceSlug: s.slug };
          break;
        }
      }
      if (resolved) break;
    }
    if (!resolved) return res.status(400).json({ error: 'Unknown package.' });

    const method = (str(b.pay_method, 20) || 'paypal') as PayMethod;
    const order = createOrder({
      sku,
      packageId: str(b.package_id, 80),
      packageName: resolved.name,
      serviceSlug: resolved.serviceSlug,
      amountUsd: resolved.usd,
      period: resolved.period,
      name,
      email,
      phone: str(b.phone, 60),
      company: str(b.company, 160),
      region: str(b.region, 120),
      domain: str(b.domain, 200),
      notes: str(b.notes, 4000),
      payMethod: ['paypal', 'card', 'bank', 'crypto'].includes(method) ? method : 'paypal',
      pagePath: str(b.page_path, 500) || str(b.page_url, 500),
      ip: clientIp(req),
    });

    // CRM: orders also create/refresh the client profile and link the
    // enquiry thread to the order.
    try {
      const clientId = upsertClient({
        name, email,
        phone: str(b.phone, 60) || null,
        company: str(b.company, 160) || null,
        country: str(b.region, 120) || null,
        service: resolved.serviceSlug || null,
        sourcePage: str(b.page_path, 500) || null,
        sourceCampaign: str(b.utm_campaign, 200) || null,
        order: true,
        orderValue: resolved.usd,
        promoteToCustomer: false,
      });
      const conn = db();
      conn
        .prepare(`UPDATE orders SET customer_notes = COALESCE(NULLIF(?, ''), customer_notes) WHERE order_ref = ?`)
        .run(str(b.notes, 4000), order.ref);
      logClientEvent(clientId, 'order.created', `${resolved.name} — ${order.ref}`, { orderId: order.id });
    } catch (e) {
      console.error('CRM order sync failed', e);
    }

    res.json({
      ok: true,
      ref: order.ref,
      display: order.display,
      currency: order.currency,
      amount: order.amountLocal,
      payMethod: order.payMethod,
      instructions: order.instructions,
      payUrl: order.payUrl,
      emailBody: order.emailBody,
    });
  } catch (err) {
    console.error('order error', err);
    res.status(500).json({ error: 'We could not create your order. Please email us and we will sort it immediately.' });
  }
});

/** PayPal IPN endpoint. */
app.post('/api/paypal/ipn', async (req: Request, res: Response) => {
  res.sendStatus(200);
  try {
    const verified = await verifyPaypalIpn(req.body as Record<string, string>);
    if (!verified) {
      console.warn('PayPal IPN received but not verified (no endpoint configured or rejected)');
      return;
    }
    const b = req.body as Record<string, string>;
    if (b.payment_status === 'Completed' || b.txn_type === 'web_accept') {
      const ref = b.invoice || b.custom || b.item_number || '';
      if (ref) await handlePaypalPayment(ref, Number(b.amount), b.currency);
    }
  } catch (err) {
    console.error('ipn error', err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API
// ─────────────────────────────────────────────────────────────────────────────

app.use('/api/admin', attachUser);

app.post('/api/admin/login', (req: Request, res: Response) => {
  const email = str(req.body?.email, 200).toLowerCase();
  const password = str(req.body?.password, 200);
  const row = db().prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email) as any;
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  const sid = createSession(row.id, clientIp(req), req.get('user-agent'));
  setSessionCookie(res, sid);
  db().prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(row.id);
  logActivity(row.id, 'auth.login', 'user', row.id, clientIp(req));
  res.json({ ok: true, user: { id: row.id, email: row.email, name: row.name, role: row.role }, csrf: csrfToken(sid) });
});

app.post('/api/admin/logout', (req: AuthedRequest, res: Response) => {
  if (req.sessionId) destroySession(req.sessionId);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/admin/me', (req: AuthedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not signed in' });
  // Detect the shipped default password so the dashboard can nag until it is
  // changed. One bcrypt compare per session load.
  const row = db().prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as
    | { password_hash: string }
    | undefined;
  const usingDefault = row ? bcryptCompare(SITE.admin.password, row.password_hash) : false;
  res.json({
    user: req.user,
    csrf: req.sessionId ? csrfToken(req.sessionId) : '',
    usingDefaultPassword: usingDefault,
  });
});

app.get('/api/admin/dashboard', requireAuth, (req: AuthedRequest, res: Response) => {
  const conn = db();
  const totals = conn
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM leads) leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'new') leads_new,
        (SELECT COUNT(*) FROM leads WHERE date(created_at) = date('now')) leads_today,
        (SELECT COUNT(*) FROM leads WHERE date(created_at) >= date('now','-7 day')) leads_week,
        (SELECT COUNT(*) FROM orders) orders,
        (SELECT COUNT(*) FROM orders WHERE pay_status = 'paid') orders_paid,
        (SELECT COUNT(*) FROM orders WHERE pay_status IN ('pending','awaiting_payment')) orders_open,
        (SELECT COUNT(*) FROM posts) posts,
        (SELECT COUNT(*) FROM case_studies) cases,
        (SELECT COUNT(*) FROM portfolio) portfolio,
        (SELECT COUNT(*) FROM pages) pages,
        (SELECT COUNT(*) FROM media) media,
        (SELECT COUNT(*) FROM services) services,
        (SELECT COUNT(*) FROM testimonials) testimonials`,
    )
    .get();

  const revenue = conn
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN pay_status = 'paid' THEN amount_usd ELSE 0 END), 0) revenue_usd,
        COUNT(CASE WHEN pay_status = 'paid' THEN 1 END) paid_count
       FROM orders`,
    )
    .get() as any;

  const byDay = conn
    .prepare(
      `SELECT date(created_at) d, COUNT(*) c FROM leads
       WHERE created_at >= date('now','-29 day') GROUP BY d ORDER BY d`,
    )
    .all() as { d: string; c: number }[];

  const byPage = conn
    .prepare(
      `SELECT page_path, COUNT(*) c FROM leads GROUP BY page_path ORDER BY c DESC LIMIT 12`,
    )
    .all() as { page_path: string; c: number }[];

  const byService = conn
    .prepare(
      `SELECT COALESCE(NULLIF(service_interest,''), service, 'Not specified') s, COUNT(*) c
       FROM leads GROUP BY s ORDER BY c DESC LIMIT 10`,
    )
    .all() as { s: string; c: number }[];

  const byRegion = conn
    .prepare(`SELECT COALESCE(NULLIF(region,''),'Unknown') r, COUNT(*) c FROM leads GROUP BY r ORDER BY c DESC LIMIT 10`)
    .all() as { r: string; c: number }[];

  const recentLeads = conn
    .prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 10')
    .all();

  const recentOrders = conn
    .prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10')
    .all();

  res.json({ totals, revenue, byDay, byPage, byService, byRegion, recentLeads, recentOrders });
});

// ── Leads ────────────────────────────────────────────────────────────────────

app.get('/api/admin/leads', requireAuth, (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const per = Math.min(100, Math.max(10, Number(req.query.per) || 25));
  const status = str(req.query.status, 30);
  const q = str(req.query.q, 100);
  const pageType = str(req.query.type, 40);

  const where: string[] = [];
  const params: any[] = [];
  if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
  if (pageType && pageType !== 'all') { where.push('page_type = ?'); params.push(pageType); }
  if (q) {
    where.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR message LIKE ? OR page_path LIKE ? OR phone LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = (db().prepare(`SELECT COUNT(*) c FROM leads ${clause}`).get(...params) as any).c;
  const rows = db()
    .prepare(`SELECT * FROM leads ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, per, (page - 1) * per);

  res.json({ rows, total, page, per, pages: Math.ceil(total / per) });
});

app.patch('/api/admin/leads/:id', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const status = str(req.body?.status, 20);
  const notes = str(req.body?.notes, 4000);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  db().prepare(
    `UPDATE leads SET status = COALESCE(NULLIF(?,''), status), notes = COALESCE(NULLIF(?,''), notes), updated_at = datetime('now') WHERE id = ?`,
  ).run(status, notes, id);
  logActivity(req.user!.id, 'lead.update', 'lead', id, `status=${status}`);
  res.json({ ok: true });
});

app.delete('/api/admin/leads/:id', requireAuth, requireOwner, requireCsrf, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  db().prepare('DELETE FROM leads WHERE id = ?').run(id);
  logActivity(req.user!.id, 'lead.delete', 'lead', id);
  res.json({ ok: true });
});

app.get('/api/admin/leads.csv', requireAuth, (req: Request, res: Response) => {
  const rows = db().prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as any[];
  const cols = [
    'id', 'created_at', 'status', 'name', 'email', 'phone', 'company', 'service', 'service_interest',
    'region', 'budget', 'timeline', 'page_url', 'page_path', 'page_type', 'referrer',
    'utm_source', 'utm_medium', 'utm_campaign', 'device', 'screen', 'message', 'notes', 'ip',
  ];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

// ── Orders ───────────────────────────────────────────────────────────────────

app.get('/api/admin/orders', requireAuth, (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const per = Math.min(100, Math.max(10, Number(req.query.per) || 25));
  const status = str(req.query.status, 30);
  const where = status && status !== 'all' ? 'WHERE pay_status = ?' : '';
  const params = status && status !== 'all' ? [status] : [];
  const total = (db().prepare(`SELECT COUNT(*) c FROM orders ${where}`).get(...params) as any).c;
  const rows = db()
    .prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, per, (page - 1) * per);
  res.json({ rows, total, page, per, pages: Math.ceil(total / per) });
});

app.patch('/api/admin/orders/:id', requireAuth, requireCsrf, async (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const status = str(req.body?.pay_status, 30);
  const valid = ['pending', 'awaiting_payment', 'paid', 'failed', 'refunded'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (status === 'paid') {
    await markOrderPaid(id, str(req.body?.pay_ref, 200) || null, req.user!.email);
  } else {
    db().prepare(
      `UPDATE orders SET pay_status = ?, internal_notes = COALESCE(NULLIF(?,''), internal_notes), updated_at = datetime('now') WHERE id = ?`,
    ).run(status, str(req.body?.internal_notes, 4000), id);
    db().prepare('INSERT INTO order_events (order_id, event, detail, actor) VALUES (?,?,?,?)').run(
      id, `status:${status}`, str(req.body?.internal_notes, 500), req.user!.email,
    );
  }
  res.json({ ok: true });
});

app.get('/api/admin/orders/:id/events', requireAuth, (req: Request, res: Response) => {
  res.json({ rows: db().prepare('SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at DESC').all(Number(req.params.id)) });
});

// ── Generic CMS CRUD ────────────────────────────────────────────────────────

const CMS_TABLES: Record<string, { table: string; fields: string[]; json: string[]; order: string }> = {
  posts: {
    table: 'posts',
    fields: ['slug', 'path', 'title', 'primary_keyword', 'meta_title', 'meta_description', 'excerpt', 'body', 'category', 'tags', 'service_slug', 'author', 'status', 'published_at', 'scheduled_for', 'featured', 'read_minutes', 'seo_score'],
    json: ['tags'],
    order: 'published_at DESC, id DESC',
  },
  cases: {
    table: 'case_studies',
    fields: ['slug', 'path', 'title', 'primary_keyword', 'meta_title', 'meta_description', 'client', 'industry', 'location', 'year', 'summary', 'challenge', 'approach', 'results', 'stack', 'services', 'status', 'published_at', 'featured', 'seo_score'],
    json: ['results', 'stack', 'services', 'palette'],
    order: 'published_at DESC, id DESC',
  },
  portfolio: {
    table: 'portfolio',
    fields: ['slug', 'title', 'client', 'industry', 'location', 'year', 'summary', 'challenge', 'approach', 'results', 'stack', 'services', 'palette', 'cover_style', 'cover_image', 'status', 'published_at', 'featured', 'sort_order', 'seo_score'],
    json: ['results', 'stack', 'services', 'palette', 'gallery'],
    order: 'sort_order ASC, id DESC',
  },
  pages: {
    table: 'pages',
    fields: ['path', 'page_type', 'title', 'primary_keyword', 'meta_title', 'meta_description', 'h1', 'h2', 'body', 'excerpt', 'status', 'published_at', 'scheduled_for', 'author', 'template', 'seo_score'],
    json: [],
    order: 'path ASC',
  },
  testimonials: {
    table: 'testimonials',
    fields: ['name', 'role', 'company', 'location', 'service_slug', 'rating', 'quote', 'outcome', 'featured', 'sort_order'],
    json: [],
    order: 'sort_order ASC',
  },
  services: {
    table: 'services',
    fields: ['slug', 'name', 'primary_keyword', 'category', 'tagline', 'summary', 'deliverables', 'faqs', 'from_price', 'timeline', 'status', 'featured', 'sort_order'],
    json: ['deliverables', 'faqs'],
    order: 'sort_order ASC',
  },
  packages: {
    table: 'packages',
    fields: ['sku', 'service_slug', 'name', 'price_usd', 'was_price_usd', 'period', 'family', 'suited', 'features', 'units', 'eta', 'badge', 'active', 'sort_order'],
    json: ['features'],
    order: 'service_slug ASC, sort_order ASC',
  },
  galleries: {
    table: 'galleries',
    fields: ['slug', 'title', 'description', 'prefix', 'cover', 'status', 'published_at', 'sort_order'],
    json: [],
    order: 'sort_order ASC',
  },
};

app.get('/api/admin/content/:type', requireAuth, (req: Request, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  const page = Math.max(1, Number(req.query.page) || 1);
  const per = Math.min(200, Math.max(10, Number(req.query.per) || 25));
  const q = str(req.query.q, 100);
  const status = str(req.query.status, 30);
  const where: string[] = [];
  const params: any[] = [];
  if (q) {
    where.push('(title LIKE ? OR slug LIKE ? OR path LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (db().prepare(`SELECT COUNT(*) c FROM ${cfg.table} ${clause}`).get(...params) as any).c;
  const rows = db()
    .prepare(`SELECT * FROM ${cfg.table} ${clause} ORDER BY ${cfg.order} LIMIT ? OFFSET ?`)
    .all(...params, per, (page - 1) * per);
  res.json({ rows, total, page, per, pages: Math.ceil(total / per), fields: cfg.fields, json: cfg.json });
});

app.get('/api/admin/content/:type/:id', requireAuth, (req: Request, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  const row = db().prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ row, fields: cfg.fields, json: cfg.json });
});

app.post('/api/admin/content/:type', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  const body = req.body || {};
  const cols = cfg.fields.filter((f) => body[f] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'No fields supplied' });
  const values = cols.map((f) => {
    let v = body[f];
    if (cfg.json.includes(f) && typeof v === 'object') v = JSON.stringify(v);
    if (typeof v === 'boolean') v = v ? 1 : 0;
    if (f === 'year' || f === 'rating' || f === 'read_minutes' || f === 'sort_order' || f === 'seo_score' || f === 'from_price' || f === 'price_usd' || f === 'was_price_usd' || f === 'active') {
      if (v === '' || v === null || v === undefined) return null;
      v = Number(v);
    }
    return v;
  });
  const placeholders = cols.map(() => '?').join(',');
  const info = db()
    .prepare(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${placeholders})`)
    .run(...values);
  logActivity(req.user!.id, `${req.params.type}.create`, req.params.type, Number(info.lastInsertRowid));
  res.json({ ok: true, id: Number(info.lastInsertRowid) });
});

app.put('/api/admin/content/:type/:id', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  const id = Number(req.params.id);
  const body = req.body || {};
  const cols = cfg.fields.filter((f) => body[f] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'No fields supplied' });
  const values = cols.map((f) => {
    let v = body[f];
    if (cfg.json.includes(f) && typeof v === 'object') v = JSON.stringify(v);
    if (typeof v === 'boolean') v = v ? 1 : 0;
    if (['year', 'rating', 'read_minutes', 'sort_order', 'seo_score', 'from_price', 'price_usd', 'was_price_usd', 'active'].includes(f)) {
      if (v === '' || v === null || v === undefined) return null;
      v = Number(v);
    }
    return v;
  });
  const set = cols.map((c) => `${c} = ?`).join(', ');
  db()
    .prepare(`UPDATE ${cfg.table} SET ${set}, updated_at = datetime('now') WHERE id = ?`)
    .run(...values, id);
  logActivity(req.user!.id, `${req.params.type}.update`, req.params.type, id);
  res.json({ ok: true });
});

app.post('/api/admin/content/:type/:id/duplicate', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  const id = Number(req.params.id);
  const row = db().prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(id) as any;
  if (!row) return res.status(404).json({ error: 'Not found' });

  const stamp = Date.now().toString(36);
  const dup: any = { ...row };
  delete dup.id;
  dup.title = `${row.title} (copy)`;
  if (dup.slug) dup.slug = `${row.slug}-copy-${stamp}`;
  if (dup.path) dup.path = `${row.path.replace(/\/$/, '')}-copy-${stamp}/`;
  if (dup.sku) dup.sku = `${row.sku}-COPY${stamp}`.toUpperCase().slice(0, 60);
  dup.status = 'draft';
  if (dup.published_at) dup.published_at = null;

  const cols = Object.keys(dup).filter((k) => cfg.fields.includes(k) || ['created_at', 'updated_at'].includes(k));
  const info = db()
    .prepare(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
    .run(...cols.map((c) => dup[c]));
  logActivity(req.user!.id, `${req.params.type}.duplicate`, req.params.type, Number(info.lastInsertRowid), `from #${id}`);
  res.json({ ok: true, id: Number(info.lastInsertRowid) });
});

app.delete('/api/admin/content/:type/:id', requireAuth, requireOwner, requireCsrf, (req: AuthedRequest, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  db().prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).run(Number(req.params.id));
  logActivity(req.user!.id, `${req.params.type}.delete`, req.params.type, Number(req.params.id));
  res.json({ ok: true });
});

/** Bulk status change — used by the list view checkboxes. */
app.post('/api/admin/content/:type/bulk', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const cfg = CMS_TABLES[req.params.type];
  if (!cfg) return res.status(404).json({ error: 'Unknown content type' });
  const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
  const status = str(req.body?.status, 20);
  if (!ids.length || !status) return res.status(400).json({ error: 'ids and status required' });
  const stmt = db().prepare(`UPDATE ${cfg.table} SET status = ?, updated_at = datetime('now') WHERE id = ?`);
  const tx = db().transaction(() => ids.forEach((id) => stmt.run(status, id)));
  tx();
  logActivity(req.user!.id, `${req.params.type}.bulk`, req.params.type, 0, `${ids.length} → ${status}`);
  res.json({ ok: true, updated: ids.length });
});

// ── CRM / EMS ────────────────────────────────────────────────────────────────

app.get('/api/admin/crm', requireAuth, (_req: Request, res: Response) => {
  res.json(crmReport());
});

app.get('/api/admin/clients', requireAuth, (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const per = Math.min(100, Math.max(10, Number(req.query.per) || 25));
  const q = str(req.query.q, 100);
  const status = str(req.query.status, 30);
  const where: string[] = [];
  const params: any[] = [];
  if (q) {
    where.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (db().prepare(`SELECT COUNT(*) c FROM clients ${clause}`).get(...params) as any).c;
  const rows = db()
    .prepare(`SELECT * FROM clients ${clause} ORDER BY last_seen DESC LIMIT ? OFFSET ?`)
    .all(...params, per, (page - 1) * per);
  res.json({ rows, total, page, per, pages: Math.ceil(total / per) });
});

app.get('/api/admin/clients/:id', requireAuth, (req: Request, res: Response) => {
  const d = clientDetail(Number(req.params.id));
  if (!d) return res.status(404).json({ error: 'Client not found' });
  res.json(d);
});

app.patch('/api/admin/clients/:id', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const b = req.body || {};
  db().prepare(
    `UPDATE clients SET
      name = COALESCE(NULLIF(?,''), name),
      phone = COALESCE(NULLIF(?,''), phone),
      company = COALESCE(NULLIF(?,''), company),
      status = COALESCE(NULLIF(?,''), status),
      notes = COALESCE(NULLIF(?,''), notes),
      tags = COALESCE(NULLIF(?,''), tags),
      updated_at = datetime('now')
     WHERE id = ?`,
  ).run(str(b.name, 120), str(b.phone, 60), str(b.company, 160), str(b.status, 30), str(b.notes, 8000), str(b.tags, 300), id);
  logClientEvent(id, 'client.updated', 'Profile updated', { actor: req.user!.email });
  res.json({ ok: true });
});

app.get('/api/admin/enquiries', requireAuth, (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const per = Math.min(100, Math.max(10, Number(req.query.per) || 25));
  const status = str(req.query.status, 30);
  const where = status && status !== 'all' ? 'WHERE e.status = ?' : '';
  const params = status && status !== 'all' ? [status] : [];
  const total = (db().prepare(`SELECT COUNT(*) c FROM enquiries e ${where}`).get(...params) as any).c;
  const rows = db()
    .prepare(
      `SELECT e.*, c.name client_name, c.email client_email, c.company client_company, c.status client_status
       FROM enquiries e JOIN clients c ON c.id = e.client_id
       ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, per, (page - 1) * per);
  res.json({ rows, total, page, per, pages: Math.ceil(total / per) });
});

app.patch('/api/admin/enquiries/:id', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const b = req.body || {};
  const valid = ['new', 'in_progress', 'awaiting_client', 'quoted', 'won', 'lost', 'closed'];
  if (b.status && !valid.includes(b.status)) return res.status(400).json({ error: 'Invalid status' });
  db().prepare(
    `UPDATE enquiries SET
      status = COALESCE(NULLIF(?,''), status),
      subject = COALESCE(NULLIF(?,''), subject),
      message = COALESCE(NULLIF(?,''), message),
      assigned_to = COALESCE(NULLIF(?,''), assigned_to),
      next_action = COALESCE(NULLIF(?,''), next_action),
      next_action_at = COALESCE(NULLIF(?,''), next_action_at),
      updated_at = datetime('now')
     WHERE id = ?`,
  ).run(str(b.status, 20), str(b.subject, 300), str(b.message, 8000), str(b.assigned_to, 120), str(b.next_action, 300), str(b.next_action_at, 40), id);
  const row = db().prepare('SELECT client_id FROM enquiries WHERE id = ?').get(id) as any;
  if (row) logClientEvent(row.client_id, 'enquiry.updated', `Enquiry status → ${b.status || 'updated'}`, { actor: req.user!.email });
  res.json({ ok: true });
});

app.post('/api/admin/enquiries/:id/note', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const note = str(req.body?.note, 4000);
  const row = db().prepare('SELECT client_id FROM enquiries WHERE id = ?').get(id) as any;
  if (!row) return res.status(404).json({ error: 'Not found' });
  logClientEvent(row.client_id, 'note', note, { actor: req.user!.email });
  res.json({ ok: true });
});

// ── Media ────────────────────────────────────────────────────────────────────

mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
      cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 12 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|avif|gif|svg\+xml)$/.test(file.mimetype)) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

app.post('/api/admin/media', requireAuth, requireCsrf, upload.array('files', 20), async (req: AuthedRequest, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const folder = str(req.body?.folder, 60) || 'general';
  const out: any[] = [];
  for (const f of files) {
    let width: number | null = null;
    let height: number | null = null;
    let finalName = f.filename;
    try {
      // Convert everything to WebP — the brief requires WebP everywhere.
      const img = sharp(f.path);
      const meta = await img.metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
      if (meta.format !== 'svg') {
        finalName = f.filename.replace(/\.[^.]+$/, '') + '.webp';
        await sharp(f.path).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(UPLOAD_DIR, finalName));
        unlinkSync(f.path);
      }
    } catch {
      /* keep the original on conversion failure */
    }
    const st = statSync(path.join(UPLOAD_DIR, finalName));
    const info = db()
      .prepare('INSERT INTO media (filename, original_name, path, mime, width, height, size_bytes, alt, title, folder, uploaded_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(finalName, f.originalname, `/uploads/${finalName}`, `image/webp`, width, height, st.size, str(req.body?.alt, 250), f.originalname, folder, req.user!.id);
    out.push({ id: Number(info.lastInsertRowid), url: `/uploads/${finalName}`, filename: finalName, width, height, size: st.size });
  }
  logActivity(req.user!.id, 'media.upload', 'media', 0, `${files.length} file(s)`);
  res.json({ ok: true, files: out });
});

app.get('/api/admin/media', requireAuth, (req: Request, res: Response) => {
  const folder = str(req.query.folder, 60);
  const q = str(req.query.q, 80);
  const where: string[] = [];
  const params: any[] = [];
  if (folder && folder !== 'all') { where.push('folder = ?'); params.push(folder); }
  if (q) { where.push('(filename LIKE ? OR alt LIKE ? OR original_name LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db().prepare(`SELECT * FROM media ${clause} ORDER BY created_at DESC LIMIT 500`).all(...params);
  const folders = db().prepare('SELECT folder, COUNT(*) c FROM media GROUP BY folder').all();
  res.json({ rows, folders });
});

app.patch('/api/admin/media/:id', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  db().prepare('UPDATE media SET alt = ?, title = ?, folder = ? WHERE id = ?')
    .run(str(req.body?.alt, 250), str(req.body?.title, 200), str(req.body?.folder, 60), Number(req.params.id));
  res.json({ ok: true });
});

app.delete('/api/admin/media/:id', requireAuth, requireOwner, requireCsrf, (req: AuthedRequest, res: Response) => {
  const row = db().prepare('SELECT * FROM media WHERE id = ?').get(Number(req.params.id)) as any;
  if (row) {
    try { unlinkSync(path.join(UPLOAD_DIR, row.filename)); } catch { /* already gone */ }
  }
  db().prepare('DELETE FROM media WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

// ── Settings / users / activity ──────────────────────────────────────────────

app.get('/api/admin/settings', requireAuth, (req: AuthedRequest, res: Response) => {
  const rows = db().prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  res.json({ settings: out, payments: paymentConfig() });
});

app.put('/api/admin/settings', requireAuth, requireOwner, requireCsrf, (req: AuthedRequest, res: Response) => {
  const body = req.body || {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string') setSetting(k, v.slice(0, 20000));
  }
  logActivity(req.user!.id, 'settings.update', 'settings', 0);
  res.json({ ok: true });
});

app.get('/api/admin/activity', requireAuth, (_req: Request, res: Response) => {
  res.json({ rows: db().prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT 200').all() });
});

app.get('/api/admin/users', requireAuth, requireOwner, (_req: Request, res: Response) => {
  res.json({ rows: db().prepare('SELECT id, email, name, role, last_login_at, created_at, active FROM users ORDER BY id').all() });
});

app.post('/api/admin/users', requireAuth, requireOwner, requireCsrf, (req: AuthedRequest, res: Response) => {
  const email = str(req.body?.email, 200).toLowerCase();
  const password = str(req.body?.password, 200);
  const name = str(req.body?.name, 120) || 'Editor';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
  if (password.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
  const bcrypt = require('bcryptjs');
  const exists = db().prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'That email already exists' });
  const info = db().prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,?)')
    .run(email, name, bcrypt.hashSync(password, 12), str(req.body?.role, 20) || 'editor');
  logActivity(req.user!.id, 'user.create', 'user', Number(info.lastInsertRowid), email);
  res.json({ ok: true, id: Number(info.lastInsertRowid) });
});

app.post('/api/admin/password', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const current = str(req.body?.current, 200);
  const next = str(req.body?.next, 200);
  const row = db().prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!row || !verifyPassword(current, row.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (next.length < 10) return res.status(400).json({ error: 'New password must be at least 10 characters' });
  const bcrypt = require('bcryptjs');
  db().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 12), req.user!.id);
  // Invalidate every other session for this user.
  db().prepare('DELETE FROM sessions WHERE user_id = ?').run(req.user!.id);
  logActivity(req.user!.id, 'user.password', 'user', req.user!.id);
  res.json({ ok: true });
});

// ── SEO overrides ────────────────────────────────────────────────────────────

app.get('/api/admin/seo', requireAuth, (req: Request, res: Response) => {
  const q = str(req.query.q, 100);
  const clause = q ? 'WHERE path LIKE ?' : '';
  const params = q ? [`%${q}%`] : [];
  res.json({
    rows: db().prepare(`SELECT * FROM seo_overrides ${clause} ORDER BY path LIMIT 500`).all(...params),
  });
});

app.put('/api/admin/seo', requireAuth, requireCsrf, (req: AuthedRequest, res: Response) => {
  const b = req.body || {};
  const p = str(b.path, 500);
  if (!p) return res.status(400).json({ error: 'path required' });
  db().prepare(
    `INSERT INTO seo_overrides (path, meta_title, meta_description, primary_keyword, h1, h2, canonical, robots, og_image, schema_extra, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?, datetime('now'))
     ON CONFLICT(path) DO UPDATE SET meta_title=excluded.meta_title, meta_description=excluded.meta_description,
       primary_keyword=excluded.primary_keyword, h1=excluded.h1, h2=excluded.h2, canonical=excluded.canonical,
       robots=excluded.robots, og_image=excluded.og_image, schema_extra=excluded.schema_extra, updated_at=datetime('now')`,
  ).run(p, str(b.meta_title, 200), str(b.meta_description, 400), str(b.primary_keyword, 150), str(b.h1, 250),
        str(b.h2, 250), str(b.canonical, 500), str(b.robots, 120), str(b.og_image, 500), str(b.schema_extra, 5000));
  res.json({ ok: true });
});

// ── 1×1 tracking pixel for conversion counting ──────────────────────────────
app.get('/api/px.gif', (req: Request, res: Response) => {
  const sid = str(req.query.sid, 80);
  if (sid) db().prepare('UPDATE leads SET updated_at = updated_at WHERE id = (SELECT id FROM leads WHERE id = ?)').run(Number(sid) || 0);
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});

// ─────────────────────────────────────────────────────────────────────────────
// Static serving
// ─────────────────────────────────────────────────────────────────────────────

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));
app.use('/assets', express.static(path.join(DIST, 'assets'), { maxAge: '1y', immutable: true }));
app.use(express.static(DIST, { maxAge: '1h', extensions: ['html'] }));

// Pretty URLs: /foo/ → /foo/index.html
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) return next();
  const clean = req.path.replace(/\/+$/, '');
  const candidate = path.join(DIST, clean || 'index.html', 'index.html');
  const flat = path.join(DIST, clean || '', 'index.html');
  if (existsSync(candidate)) return res.sendFile(candidate);
  if (existsSync(flat)) return res.sendFile(flat);
  if (existsSync(`${flat}.html`)) return res.sendFile(`${flat}.html`);
  if (req.path.startsWith('/admin')) return next();
  res.status(404).sendFile(path.join(DIST, '404.html'), (err) => {
    if (err) res.status(404).type('text/plain').send('Not found');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

// Export the app so platform adapters (Vercel / Netlify / Cloudflare) can
// mount it without opening a listening socket.
export { app };
export default app;

// Only listen when this file is the entrypoint (not when imported).
const isEntrypoint =
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.ts') ||
    process.argv[1].endsWith('server/index.js'));

if (isEntrypoint && !process.env.SERVERLESS) {
  app.listen(PORT, () => {
    console.log(`\n  ${SITE.name} — server running`);
    console.log(`  → http://localhost:${PORT}`);
    console.log(`  → http://localhost:${PORT}/admin/`);
    console.log(`  Admin: ${SITE.admin.email}\n`);
  });
}
