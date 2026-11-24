// MyForm413 payment Worker: /api/checkout, /api/waffo-webhook, /api/order-status.
// Filling the form stays free and local; only the export (PDF download) is paid.
import { createCheckoutSession, verifyWebhookSignature } from './waffo.js';
import { CURRENCY, PRICES, tierFor, productIdFor, toCents } from './pricing.js';

const enc = new TextEncoder();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;
const ORDER_RE = /^mf413_[a-f0-9]{32}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function sha256Hex(s) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
  return Array.from(d, b => b.toString(16).padStart(2, '0')).join('');
}

function newOrderId() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return 'mf413_' + Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

function mode(env) {
  return env.WAFFO_ENVIRONMENT === 'prod' ? 'prod' : 'test';
}

function configured(env) {
  return env.DB && env.WAFFO_MERCHANT_ID && env.WAFFO_PRIVATE_KEY &&
    env.WAFFO_PRODUCT_ID_STANDARD && env.WAFFO_PRODUCT_ID_FIRST && env.SITE_ORIGIN;
}

async function hasPaidBefore(env, email) {
  const row = await env.DB.prepare(
    "SELECT 1 AS x FROM orders WHERE status = 'paid' AND mode = ?1 AND (email = ?2 OR buyer_email = ?2) LIMIT 1"
  ).bind(mode(env), email).first();
  return !!row;
}

export async function handleCheckout(request, env, deps = {}) {
  if (!configured(env)) return json({ error: 'Checkout is not configured.' }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  const email = String((input && input.email) || '').trim().toLowerCase();
  const token = String((input && input.token) || '');
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: 'Enter a valid email address.' }, 400);
  if (!TOKEN_RE.test(token)) return json({ error: 'Invalid export token.' }, 400);

  // The price tier is decided here, never by the browser.
  const tier = tierFor(await hasPaidBefore(env, email));
  const price = PRICES[tier];
  const orderId = newOrderId();
  const now = new Date().toISOString();

  let session;
  try {
    session = await createCheckoutSession(env, {
      productId: productIdFor(env, tier),
      currency: CURRENCY,
      buyerEmail: email,
      successUrl: `${env.SITE_ORIGIN.replace(/\/$/, '')}/?paid=${orderId}#start`,
      orderMerchantExternalId: orderId,
      metadata: { site: 'myform413', tier },
    }, deps.fetch);
  } catch (e) {
    console.error(e.message);
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }

  await env.DB.prepare(
    `INSERT INTO orders (id, email, token_hash, tier, amount_cents, currency, mode, status, waffo_session_id, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'pending', ?8, ?9)`
  ).bind(orderId, email, await sha256Hex(token), tier, price.cents, CURRENCY, mode(env), session.sessionId || null, now).run();

  return json({ orderId, tier, amount: price.amount, currency: CURRENCY, checkoutUrl: session.checkoutUrl });
}

export async function handleWebhook(request, env, deps = {}) {
  // Verify against the raw body, before any parsing.
  const raw = await request.text();
  const ok = await verifyWebhookSignature(
    raw, request.headers.get('X-Waffo-Signature'), env.WAFFO_WEBHOOK_PUBLIC_KEY, deps.now ? deps.now() : Date.now()
  );
  if (!ok) return json({ error: 'Invalid signature.' }, 401);

  let event;
  try { event = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  const data = (event && event.data) || {};
  // Test and Live are isolated: a Test event must never unlock a Live deployment, and vice versa.
  if (event.mode !== mode(env)) return json({ received: true, ignored: 'mode' });

  const eventKey = `${event.eventType}:${event.eventId || event.id}`;
  const orderRef = typeof data.orderMerchantExternalId === 'string' ? data.orderMerchantExternalId : null;
  // Audit log only. A redelivery is processed again: the order update below is idempotent,
  // so a retry after a failed update still marks the order paid.
  const ins = await env.DB.prepare(
    `INSERT OR IGNORE INTO webhook_events (event_key, event_type, mode, order_ref, payload, received_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).bind(eventKey, String(event.eventType), event.mode, orderRef, raw, new Date().toISOString()).run();
  const duplicate = !ins.meta || ins.meta.changes === 0;

  if (event.eventType !== 'order.completed' || data.paymentStatus !== 'succeeded' || !orderRef) {
    return json({ received: true, duplicate });
  }
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?1 AND mode = ?2').bind(orderRef, mode(env)).first();
  if (!order) return json({ received: true, ignored: 'unknown order' });
  if (order.status === 'paid') return json({ received: true, duplicate });

  // Pre-tax list price must be exactly what this order was quoted ($29 or $19).
  const subtotal = data.listPrice && data.listPrice.subtotal;
  const paidCents = toCents(subtotal);
  const amountOk = data.currency === order.currency && paidCents === order.amount_cents;
  const check = paidCents === null ? 'unknown' : amountOk ? 'ok' : 'mismatch';

  await env.DB.prepare(
    `UPDATE orders SET waffo_order_id = ?2, buyer_email = ?3, paid_subtotal = ?4, amount_check = ?5,
       status = CASE WHEN ?6 = 1 THEN 'paid' ELSE status END,
       paid_at = CASE WHEN ?6 = 1 THEN ?7 ELSE paid_at END
     WHERE id = ?1`
  ).bind(
    order.id, data.orderId || null, String(data.buyerEmail || '').trim().toLowerCase() || null,
    typeof subtotal === 'string' ? subtotal : null, check, amountOk ? 1 : 0, new Date().toISOString()
  ).run();
  if (!amountOk) console.error(`order ${order.id}: amount check ${check}, not unlocked`);
  return json({ received: true, duplicate });
}

export async function handleOrderStatus(request, env) {
  if (!env.DB) return json({ error: 'Not configured.' }, 503);
  const url = new URL(request.url);
  const id = url.searchParams.get('order') || '';
  const token = url.searchParams.get('token') || '';
  if (!ORDER_RE.test(id) || !TOKEN_RE.test(token)) return json({ paid: false }, 400);
  const order = await env.DB.prepare('SELECT status, token_hash, tier FROM orders WHERE id = ?1 AND mode = ?2')
    .bind(id, mode(env)).first();
  if (!order || order.token_hash !== await sha256Hex(token)) return json({ paid: false }, 404);
  return json({ paid: order.status === 'paid', tier: order.tier });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/checkout') {
        return request.method === 'POST' ? handleCheckout(request, env) : json({ error: 'Method not allowed.' }, 405);
      }
      if (pathname === '/api/waffo-webhook') {
        return request.method === 'POST' ? handleWebhook(request, env) : json({ error: 'Method not allowed.' }, 405);
      }
      if (pathname === '/api/order-status') {
        return request.method === 'GET' ? handleOrderStatus(request, env) : json({ error: 'Method not allowed.' }, 405);
      }
      return json({ error: 'Not found.' }, 404);
    } catch (e) {
      console.error(e && e.stack || e);
      return json({ error: 'Server error.' }, 500);
    }
  },
};
