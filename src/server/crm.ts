/**
 * CRM + Enquiry Management System (EMS).
 *
 * The brief asks for a layer "between click and us": when someone fills a form
 * or places an order, a client profile is created automatically, every
 * subsequent enquiry attaches to that profile, and the whole relationship
 * (enquiries, orders, notes, reports) is visible from one place.
 *
 * This module owns that logic so both the API and the dashboard use exactly
 * the same rules.
 */

import { db, logActivity } from '../db/index.js';
import { getSetting } from '../db/index.js';

export type ClientStatus = 'lead' | 'enquiry' | 'active' | 'customer' | 'inactive';
export type EnquiryStatus = 'new' | 'in_progress' | 'awaiting_client' | 'quoted' | 'won' | 'lost' | 'closed';

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  domain: string | null;
  country: string | null;
  city: string | null;
  service: string | null;
  status: ClientStatus;
  source_page: string | null;
  source_campaign: string | null;
  first_seen: string;
  last_seen: string;
  total_leads: number;
  total_orders: number;
  lifetime_value: number;
  notes: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: number;
  client_id: number;
  channel: 'form' | 'email' | 'phone' | 'chat' | 'whatsapp' | 'manual';
  subject: string;
  message: string;
  status: EnquiryStatus;
  order_id: number | null;
  assigned_to: string | null;
  next_action: string | null;
  next_action_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientEvent {
  id: number;
  client_id: number;
  type: string;
  detail: string;
  order_id: number | null;
  lead_id: number | null;
  actor: string | null;
  created_at: string;
}

/** Normalise an email so the same person always maps to one profile. */
function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Create or update a client profile from a lead or an order.
 * Idempotent on email — a returning visitor never gets a second profile.
 */
export function upsertClient(input: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  domain?: string | null;
  country?: string | null;
  city?: string | null;
  service?: string | null;
  sourcePage?: string | null;
  sourceCampaign?: string | null;
  /** Increment counters. */
  lead?: boolean;
  order?: boolean;
  orderValue?: number;
  /** A client becomes a customer the moment a paid order lands. */
  promoteToCustomer?: boolean;
}): number {
  const conn = db();
  const email = normaliseEmail(input.email);
  if (!email) throw new Error('email is required to create a client profile');

  const existing = conn.prepare('SELECT * FROM clients WHERE email = ?').get(email) as ClientProfile | undefined;
  const now = new Date().toISOString();

  if (existing) {
    conn
      .prepare(
        `UPDATE clients SET
          name = COALESCE(NULLIF(?,''), name),
          phone = COALESCE(NULLIF(?,''), phone),
          company = COALESCE(NULLIF(?,''), company),
          domain = COALESCE(NULLIF(?,''), domain),
          country = COALESCE(NULLIF(?,''), country),
          city = COALESCE(NULLIF(?,''), city),
          service = COALESCE(NULLIF(?,''), service),
          source_page = COALESCE(NULLIF(?,''), source_page),
          source_campaign = COALESCE(NULLIF(?,''), source_campaign),
          total_leads = total_leads + ?,
          total_orders = total_orders + ?,
          lifetime_value = lifetime_value + ?,
          status = CASE
            WHEN ? = 1 AND status IN ('lead','enquiry') THEN 'customer'
            ELSE status END,
          last_seen = ?,
          updated_at = ?
         WHERE id = ?`,
      )
      .run(
        input.name || '', input.phone || null, input.company || null, input.domain || null,
        input.country || null, input.city || null, input.service || null,
        input.sourcePage || null, input.sourceCampaign || null,
        input.lead ? 1 : 0, input.order ? 1 : 0, input.orderValue || 0,
        input.promoteToCustomer ? 1 : 0, now, now, existing.id,
      );
    return existing.id;
  }

  const status: ClientStatus = input.promoteToCustomer ? 'customer' : input.order ? 'active' : 'lead';
  const info = conn
    .prepare(
      `INSERT INTO clients
        (name, email, phone, company, domain, country, city, service, status, source_page, source_campaign,
         first_seen, last_seen, total_leads, total_orders, lifetime_value, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      input.name || 'Unknown', email, input.phone || null, input.company || null, input.domain || null,
      input.country || null, input.city || null, input.service || null, status,
      input.sourcePage || null, input.sourceCampaign || null,
      now, now, input.lead ? 1 : 0, input.order ? 1 : 0, input.orderValue || 0, now, now,
    );
  return Number(info.lastInsertRowid);
}

/** Log an event against a client profile — the backbone of the CRM timeline. */
export function logClientEvent(
  clientId: number,
  type: string,
  detail: string,
  extra?: { orderId?: number | null; leadId?: number | null; actor?: string | null },
): void {
  db()
    .prepare('INSERT INTO client_events (client_id, type, detail, order_id, lead_id, actor) VALUES (?,?,?,?,?,?)')
    .run(clientId, type, detail, extra?.orderId ?? null, extra?.leadId ?? null, extra?.actor ?? null);
}

/** Create an enquiry (EMS record) and attach it to a client profile. */
export function createEnquiry(input: {
  clientId: number;
  channel: Enquiry['channel'];
  subject: string;
  message: string;
  orderId?: number | null;
  actor?: string | null;
}): number {
  const conn = db();
  const info = conn
    .prepare(
      `INSERT INTO enquiries (client_id, channel, subject, message, status, order_id, assigned_to, created_at, updated_at)
       VALUES (?,?,?,?, 'new', ?, ?, datetime('now'), datetime('now'))`,
    )
    .run(input.clientId, input.channel, input.subject, input.message, input.orderId ?? null, input.actor ?? null);
  const id = Number(info.lastInsertRowid);
  logClientEvent(input.clientId, 'enquiry.created', input.subject, {
    orderId: input.orderId ?? null,
    actor: input.actor ?? null,
  });
  // A client with an open enquiry moves out of plain "lead".
  conn.prepare("UPDATE clients SET status = CASE WHEN status = 'lead' THEN 'enquiry' ELSE status END, updated_at = datetime('now') WHERE id = ?").run(input.clientId);
  return id;
}

/** Full CRM report: totals, pipeline, top clients, recent activity. */
export function crmReport() {
  const conn = db();
  const totals = conn
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM clients) clients,
        (SELECT COUNT(*) FROM clients WHERE status='lead') as_lead,
        (SELECT COUNT(*) FROM clients WHERE status='enquiry') as_enquiry,
        (SELECT COUNT(*) FROM clients WHERE status='active') as_active,
        (SELECT COUNT(*) FROM clients WHERE status='customer') as_customer,
        (SELECT COUNT(*) FROM enquiries) enquiries,
        (SELECT COUNT(*) FROM enquiries WHERE status='new') enquiries_new,
        (SELECT COUNT(*) FROM enquiries WHERE status='in_progress') enquiries_progress,
        (SELECT COALESCE(SUM(lifetime_value),0) FROM clients) lifetime_value`,
    )
    .get();

  const pipeline = conn
    .prepare(
      `SELECT status, COUNT(*) c FROM enquiries GROUP BY status ORDER BY c DESC`,
    )
    .all();

  const topClients = conn
    .prepare(
      `SELECT id, name, email, company, status, total_leads, total_orders, lifetime_value, last_seen
       FROM clients ORDER BY lifetime_value DESC, total_orders DESC, last_seen DESC LIMIT 10`,
    )
    .all();

  const byRegion = conn
    .prepare(
      `SELECT COALESCE(NULLIF(country,''),'Unknown') r, COUNT(*) c FROM clients GROUP BY r ORDER BY c DESC LIMIT 10`,
    )
    .all();

  const byService = conn
    .prepare(
      `SELECT COALESCE(NULLIF(service,''),'Not specified') s, COUNT(*) c FROM clients GROUP BY s ORDER BY c DESC LIMIT 10`,
    )
    .all();

  const recentEvents = conn
    .prepare(
      `SELECT e.*, c.name client_name, c.email client_email
       FROM client_events e JOIN clients c ON c.id = e.client_id
       ORDER BY e.created_at DESC LIMIT 15`,
    )
    .all();

  return { totals, pipeline, topClients, byRegion, byService, recentEvents };
}

/** Everything about one client: profile, enquiries, orders, events, notes. */
export function clientDetail(id: number) {
  const conn = db();
  const client = conn.prepare('SELECT * FROM clients WHERE id = ?').get(id) as ClientProfile | undefined;
  if (!client) return null;
  const enquiries = conn
    .prepare('SELECT * FROM enquiries WHERE client_id = ? ORDER BY created_at DESC')
    .all(id) as Enquiry[];
  const orders = conn
    .prepare('SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC')
    .all(client.email);
  const events = conn
    .prepare('SELECT * FROM client_events WHERE client_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(id) as ClientEvent[];
  const leads = conn
    .prepare('SELECT * FROM leads WHERE email = ? ORDER BY created_at DESC')
    .all(client.email);
  return { client, enquiries, orders, events, leads };
}
