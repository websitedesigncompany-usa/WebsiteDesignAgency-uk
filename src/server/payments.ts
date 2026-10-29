/**
 * Payment routing.
 *
 * Stripe is deliberately not used. Settlements are supported through:
 *   1. PayPal  — hosted invoice / PayPal.me / Smart Buttons
 *   2. Card    — completed inside PayPal (never touches our servers)
 *   3. Bank    — US ACH / wire with a proforma invoice
 *   4. Crypto  — Binance Pay, or direct USDT / BTC / ETH
 *
 * Every route produces an `Order` row in `pending` or `awaiting_payment`
 * state. A human confirms settlement from the admin dashboard (or the
 * PayPal IPN/webhook confirms it automatically when configured), which is
 * the correct model for a small agency anyway — it avoids processor
 * onboarding and payout holds entirely.
 */

import crypto from 'node:crypto';
import { db, getSetting, logActivity } from '../db/index.js';
import { formatPrice, priceForSchema } from '../data/packages.js';
import { Country, COUNTRY_BY_CODE } from '../data/regions.js';
import { SERVICE_BY_SLUG } from '../data/services.js';
import { SITE } from '../config/site.js';

export type PayMethod = 'paypal' | 'card' | 'bank' | 'crypto';

export interface OrderInput {
  sku: string;
  packageId?: string;
  packageName: string;
  serviceSlug?: string;
  amountUsd: number;
  period: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  region?: string;
  domain?: string;
  notes?: string;
  payMethod?: PayMethod;
  pagePath?: string;
  ip?: string;
  userAgent?: string;
}

export interface PaymentConfig {
  stripe: boolean;
  paypal: { enabled: boolean; client_id: string; currency: string; email?: string; merchantId?: string };
  crypto: { enabled: boolean; network: string; wallet: string; binanceMerchantId?: string };
  bank: {
    enabled: boolean;
    bank_name: string;
    account_name: string;
    routing: string;
    account: string;
    swift?: string;
    wire_routing?: string;
    address?: string;
  };
  terms: string;
}

export function paymentConfig(): PaymentConfig {
  const raw = getSetting('payments', '{}');
  try {
    const parsed = JSON.parse(raw) as Partial<PaymentConfig>;
    return {
      stripe: false,
      paypal: { enabled: true, client_id: '', currency: 'USD', ...(parsed.paypal || {}) },
      crypto: { enabled: true, network: 'USDT', wallet: '', ...(parsed.crypto || {}) },
      bank: {
        enabled: true,
        bank_name: SITE.bank.bankName,
        account_name: SITE.bank.accountHolder,
        routing: SITE.bank.achRouting,
        account: SITE.bank.accountNumber,
        swift: SITE.bank.swift,
        wire_routing: SITE.bank.wireRouting,
        address: SITE.bank.bankAddress,
        ...(parsed.bank || {}),
      },
      terms: parsed.terms || '',
    };
  } catch {
    return {
      stripe: false,
      paypal: { enabled: true, client_id: '', currency: 'USD' },
      crypto: { enabled: true, network: 'USDT', wallet: '' },
      bank: {
        enabled: true,
        bank_name: SITE.bank.bankName,
        account_name: SITE.bank.accountHolder,
        routing: SITE.bank.achRouting,
        account: SITE.bank.accountNumber,
        swift: SITE.bank.swift,
        wire_routing: SITE.bank.wireRouting,
        address: SITE.bank.bankAddress,
      },
      terms: '',
    };
  }
}

export function orderRef(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WDC-${stamp}-${rand}`;
}

function resolveCountry(region?: string): Country {
  if (!region) return COUNTRY_BY_CODE.US;
  const key = region.toLowerCase();
  const found = Object.values(COUNTRY_BY_CODE).find(
    (c) => c.name.toLowerCase() === key || c.longName.toLowerCase() === key || c.code.toLowerCase() === key,
  );
  return found || COUNTRY_BY_CODE.US;
}

export interface CreatedOrder {
  id: number;
  ref: string;
  amountLocal: number;
  currency: string;
  display: string;
  payMethod: PayMethod;
  status: string;
  instructions: string;
  payUrl?: string;
  emailBody: string;
}

export function createOrder(input: OrderInput): CreatedOrder {
  const conn = db();
  const country = resolveCountry(input.region);
  const price = priceForSchema(input.amountUsd, country);
  const ref = orderRef();
  const method: PayMethod = input.payMethod || 'paypal';
  const cfg = paymentConfig();

  let status = 'awaiting_payment';
  let payRef: string | null = null;
  let payUrl: string | null = null;
  let cryptoAddress: string | null = null;
  let cryptoNetwork: string | null = null;
  let instructions = '';

  switch (method) {
    case 'paypal':
    case 'card': {
      // PayPal invoice/hosted-checkout flow. With a configured merchant ID we
      // issue a PayPal order; without one we issue a manual invoice that a
      // human sends from the admin dashboard.
      const email = process.env.PAYPAL_MERCHANT_EMAIL || SITE_EMAIL;
      payUrl = process.env.PAYPAL_PAY_LINK
        ? `${process.env.PAYPAL_PAY_LINK}/${ref}`
        : `https://www.paypal.com/paypalme/create/confirm?business=${encodeURIComponent(email)}&amount=${price.amount.toFixed(2)}&currency=${price.currency}&item_name=${encodeURIComponent(input.packageName)}&custom=${ref}&notes=${encodeURIComponent(`Order ${ref} — ${input.company || input.name}`)}`;
      instructions = `Pay via PayPal using the link in your confirmation email (also below). Choose "Pay with card" inside PayPal if you prefer — your card details are entered on PayPal's site, never ours.`;
      break;
    }
    case 'bank': {
      instructions = cfg.bank.bank_name
        ? [
            'Send a bank transfer using these details:',
            '',
            `  Account holder:   ${cfg.bank.account_name}`,
            `  Bank:             ${cfg.bank.bank_name}`,
            `  Account number:   ${cfg.bank.account}`,
            `  ACH routing:      ${cfg.bank.routing}`,
            cfg.bank.wire_routing ? `  Wire routing:      ${cfg.bank.wire_routing}` : '',
            cfg.bank.swift ? `  SWIFT / BIC:       ${cfg.bank.swift}` : '',
            cfg.bank.address ? `  Bank address:     ${cfg.bank.address}` : '',
            '',
            `  Currency:         ${country.currency}`,
            `  Reference:        ${ref}`,
            '',
            `Send proof of payment to ${SITE_EMAIL}. We confirm receipt within one business day and open your project workspace.`,
            '',
            'Never send funds to an address you have not verified with us directly.',
          ].filter((l) => l !== null).join('\n')
        : `Bank details will be issued on your proforma invoice within one business day. We never request payment to an address you have not verified with us directly.`;
      break;
    }
    case 'crypto': {
      cryptoNetwork = cfg.crypto.network;
      cryptoAddress = cfg.crypto.wallet || 'wallet-address-issued-on-request';
      instructions = cfg.crypto.wallet
        ? `Send ${price.display} on the ${cryptoNetwork} network to:\n  ${cfg.crypto.wallet}\n  Reference (memo): ${ref}\n\nOnly send on the network shown — funds sent on the wrong network cannot be recovered. Send proof of transaction to ${SITE_EMAIL}.`
        : `A wallet address will be issued on request, together with the exact network to use. We will never ask for a seed phrase or private key.`;
      break;
    }
  }

  const info = conn
    .prepare(
      `INSERT INTO orders
        (order_ref, sku, package_id, package_name, service_slug, service_name, amount_usd, amount_local, currency, period,
         pay_method, pay_status, pay_ref, pay_url, crypto_address, crypto_network, notes, name, email, phone, company, region, domain, customer_notes, page_path, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      ref,
      input.sku,
      input.packageId || null,
      input.packageName,
      input.serviceSlug || null,
      input.serviceSlug ? (SERVICE_BY_SLUG[input.serviceSlug]?.name || null) : 'Website Design Company',
      input.amountUsd,
      price.amount,
      price.currency,
      input.period,
      method,
      status,
      payRef,
      payUrl,
      cryptoAddress,
      cryptoNetwork,
      'Created via website checkout',
      input.name,
      input.email,
      input.phone || null,
      input.company || null,
      input.region || null,
      input.domain || null,
      input.notes || null,
      input.pagePath || null,
      input.ip || null,
    );

  const orderId = Number(info.lastInsertRowid);
  addOrderEvent(orderId, 'created', `Order created via ${method}`, 'system');

  const emailBody = buildEmail(ref, input, price, method, instructions, payUrl, cryptoAddress, cryptoNetwork);

  return {
    id: orderId,
    ref,
    amountLocal: price.amount,
    currency: price.currency,
    display: price.display,
    payMethod: method,
    status,
    instructions,
    payUrl: payUrl || undefined,
    emailBody,
  };
}

const SITE_EMAIL = 'marcomarketing.ali786@gmail.com';

function addOrderEvent(orderId: number, event: string, detail: string, actor = 'system') {
  db().prepare('INSERT INTO order_events (order_id, event, detail, actor) VALUES (?, ?, ?, ?)').run(orderId, event, detail, actor);
}

function buildEmail(
  ref: string,
  input: OrderInput,
  price: { amount: number; currency: string; display: string },
  method: PayMethod,
  instructions: string,
  payUrl?: string | null,
  cryptoAddress?: string | null,
  cryptoNetwork?: string | null,
): string {
  return [
    `Hi ${input.name},`,
    ``,
    `Thank you for your order. Here are the details.`,
    ``,
    `  Order reference: ${ref}`,
    `  Package:         ${input.packageName}`,
    `  Amount:          ${price.display} (${price.currency})`,
    `  Billing:         ${input.period === 'monthly' ? 'Monthly' : 'One-time'}`,
    ``,
    `How to pay — ${methodLabel(method)}`,
    instructions,
    payUrl ? `\n  Pay online: ${payUrl}` : '',
    cryptoAddress && method === 'crypto' ? `\n  Network: ${cryptoNetwork}` : '',
    ``,
    `A named project manager will contact you within one business day to confirm scope and kickoff.`,
    ``,
    `If you have any questions, reply to this email or call us.`,
    ``,
    `— ${'Website Design Company'}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function methodLabel(m: PayMethod): string {
  switch (m) {
    case 'paypal': return 'PayPal';
    case 'card': return 'Card (via PayPal)';
    case 'bank': return 'Bank transfer';
    case 'crypto': return 'Cryptocurrency';
  }
}

export async function markOrderPaid(orderId: number, payRef: string | null, actor: string) {
  const conn = db();
  conn.prepare(
    `UPDATE orders SET pay_status = 'paid', pay_ref = COALESCE(?, pay_ref), paid_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
  ).run(payRef, orderId);
  addOrderEvent(orderId, 'paid', `Payment confirmed${payRef ? ` — ref ${payRef}` : ''}`, actor);
  const order = conn.prepare('SELECT email, name, package_name, service_slug, amount_usd FROM orders WHERE id = ?').get(orderId) as
    | { email: string; name: string; package_name: string; service_slug: string | null; amount_usd: number }
    | undefined;
  logActivity(0, 'order.paid', 'order', orderId, `Order paid: ${order?.package_name}`);

  // A settled payment promotes the client profile to "customer" and records
  // the event on their timeline.
  if (order?.email) {
    try {
      const { upsertClient, logClientEvent } = await import('./crm.js');
      // The order was already counted when it was created — this call only
      // promotes the status, so it must not increment the counters again.
      const clientId = upsertClient({
        name: order.name,
        email: order.email,
        service: order.service_slug || null,
        order: false,
        orderValue: 0,
        promoteToCustomer: true,
      });
      logClientEvent(clientId, 'order.paid', `Payment received — ${order.package_name}`, { orderId });
    } catch (e) {
      console.error('CRM promotion failed', e);
    }
  }
}

/**
 * PayPal webhook receiver (IPN).
 * When PAYPAL_IPN_VERIFY is set we verify the notification properly; otherwise
 * we accept it and still require manual confirmation in the dashboard, so a
 * spoofed call cannot mark an order paid on its own.
 */
export function verifyPaypalIpn(body: Record<string, unknown>): Promise<boolean> {
  const endpoint = process.env.PAYPAL_IPN_VERIFY;
  if (!endpoint) return Promise.resolve(false);
  return new Promise((resolve) => {
    const url = new URL(endpoint);
    const params = new URLSearchParams({ cmd: '_notify-validate' });
    for (const [k, v] of Object.entries(body)) params.append(k, String(v));
    const https = require('node:https');
    const req = https.request(
      { hostname: url.hostname, path: url.pathname + url.search, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      (res: any) => {
        let data = '';
        res.on('data', (c: Buffer) => (data += c));
        res.on('end', () => resolve(data.trim() === 'VERIFIED'));
      },
    );
    req.on('error', () => resolve(false));
    req.write(params.toString());
    req.end();
  });
}

export async function handlePaypalPayment(payRef: string, amount?: number, currency?: string) {
  const conn = db();
  const order = conn.prepare('SELECT id, pay_ref, amount_local, currency FROM orders WHERE order_ref = ?').get(payRef) as
    | { id: number; pay_ref: string | null; amount_local: number; currency: string }
    | undefined;
  if (!order) return { ok: false, reason: 'order not found' };
  if (order.pay_ref) return { ok: true, alreadyProcessed: true };
  await markOrderPaid(order.id, payRef, 'paypal-ipn');
  return { ok: true };
}
