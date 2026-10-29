/**
 * Session authentication for the admin area.
 *
 * Opaque server-side sessions in SQLite, httpOnly SameSite=Lax cookies,
 * scrypt-free bcrypt password hashing, and CSRF protection on mutating
 * requests.
 */

import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';

export const SESSION_COOKIE = 'wdc_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function createSession(userId: number, ip?: string, ua?: string): string {
  const id = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db().prepare(
    'INSERT INTO sessions (id, user_id, ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, userId, ip || null, (ua || '').slice(0, 400), expires);
  return id;
}

export function destroySession(id: string) {
  db().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function userForSession(sessionId: string): SessionUser | null {
  if (!sessionId) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND u.active = 1`,
    )
    .get(sessionId) as (SessionUser & { expires_at: string }) | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(sessionId);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

export interface AuthedRequest extends Request {
  user?: SessionUser;
  sessionId?: string;
}

/** Attach req.user when a valid session cookie is present. Does not block. */
export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const sid = req.cookies?.[SESSION_COOKIE];
  if (sid) {
    const u = userForSession(sid);
    if (u) {
      req.user = u;
      req.sessionId = sid;
    } else {
      clearSessionCookieSafe(_res);
    }
  }
  next();
}

function clearSessionCookieSafe(res: Response) {
  try {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  } catch {
    /* ignore */
  }
}

/** Guard: 401 unless a valid session exists. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

export function requireOwner(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Insufficient permissions' });
    return;
  }
  next();
}

// ── CSRF ─────────────────────────────────────────────────────────────────────
//
// Session cookie is SameSite=Lax, so cross-site POSTs are already blocked at the
// browser level. This double-submit token covers same-site subdomain attacks
// and non-browser clients.

export function csrfToken(sessionId: string): string {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || 'wdc-csrf').update(sessionId).digest('hex');
}

export function requireCsrf(req: AuthedRequest, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const sent = req.get('x-csrf-token') || req.body?._csrf;
  const expected = req.sessionId ? csrfToken(req.sessionId) : '';
  if (!sent || !expected || sent.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected))) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }
  next();
}
