// Run with `npm test` in this folder (node:test). Named so the root vitest run does not pick it up.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { d1 } from './d1-shim.js';
import { handleCheckout, handleWebhook, handleOrderStatus } from '../src/index.js';
import { signRequest, verifyWebhookSignature } from '../src/waffo.js';
import { PRICES } from '../src/pricing.js';

// Throwaway keys generated per run; nothing here is a real credential.
const api = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const hook = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = (k, type, format = 'pem') => k.export({ type, format });

function makeEnv() {
  return {
    DB: d1(), WAFFO_ENVIRONMENT: 'test', SITE_ORIGIN: 'https://myform413.com',
    WAFFO_MERCHANT_ID: 'MER_test', WAFFO_PRIVATE_KEY: pem(api.privateKey, 'pkcs8'),
    WAFFO_WEBHOOK_PUBLIC_KEY: pem(hook.publicKey, 'spki'),
    WAFFO_PRODUCT_ID_STANDARD: 'PROD_std', WAFFO_PRODUCT_ID_FIRST: 'PROD_first',
  };
}

function fakeWaffo(calls) {
  return async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ data: { sessionId: 'cs_1', checkoutUrl: 'https://checkout.waffo.ai/cs_1', expiresAt: 'x' } }));
  };
}

const TOKEN = 'a'.repeat(64);
async function checkout(env, email, calls = []) {
  const res = await handleCheckout(new Request('https://myform413.com/api/checkout', {
    method: 'POST', body: JSON.stringify({ email, token: TOKEN }),
  }), env, { fetch: fakeWaffo(calls) });
  return { res, body: await res.json(), calls };
}

function signedWebhook(event, { t = Date.now(), key = hook.privateKey, tamper = false } = {}) {
  const raw = JSON.stringify(event);
  const v1 = crypto.sign('sha256', Buffer.from(`${t}.${raw}`), key).toString('base64');
  return new Request('https://myform413.com/api/waffo-webhook', {
    method: 'POST', body: tamper ? raw.replace('19.00', '0.01') : raw,
    headers: { 'X-Waffo-Signature': `t=${t},v1=${v1}`, 'X-Waffo-Event': event.eventType },
  });
}

function completed(orderId, subtotal, extra = {}) {
  return {
    id: 'PAY_1', eventType: 'order.completed', eventId: 'PAY_1', storeId: 'STO_1', mode: 'test',
    data: {
      orderId: 'ORD_1', buyerEmail: 'a@example.com', currency: 'USD', paymentStatus: 'succeeded',
      listPrice: { subtotal, total: subtotal }, orderMerchantExternalId: orderId,
    },
    ...extra,
  };
}

async function status(env, orderId, token = TOKEN) {
  const r = await handleOrderStatus(new Request(`https://myform413.com/api/order-status?order=${orderId}&token=${token}`), env);
  return r.json();
}

test('prices are $29 standard and $19 first order', () => {
  assert.equal(PRICES.standard.amount, '29.00');
  assert.equal(PRICES.first.amount, '19.00');
});

test('checkout: first order is $19 and the request to Waffo is signed', async () => {
  const env = makeEnv();
  const { res, body, calls } = await checkout(env, 'A@Example.com');
  assert.equal(res.status, 200);
  assert.equal(body.tier, 'first');
  assert.equal(body.amount, '19.00');
  assert.equal(body.checkoutUrl, 'https://checkout.waffo.ai/cs_1');
  const c = calls[0];
  assert.equal(c.url, 'https://api.waffo.ai/v1/actions/checkout/create-session');
  assert.equal(c.body.productId, 'PROD_first');
  assert.equal(c.body.orderMerchantExternalId, body.orderId);
  assert.ok(c.body.successUrl.startsWith('https://myform413.com/?paid='));
  assert.deepEqual(Object.keys(c.body).sort(), ['buyerEmail', 'currency', 'metadata', 'orderMerchantExternalId', 'productId', 'successUrl']);
  const h = c.init.headers;
  const hash = crypto.createHash('sha256').update(c.init.body).digest('base64');
  const canonical = `POST\n/v1/actions/checkout/create-session\n${h['X-Timestamp']}\n${hash}`;
  assert.ok(crypto.verify('sha256', Buffer.from(canonical), api.publicKey, Buffer.from(h['X-Signature'], 'base64')));
  assert.equal((await status(env, body.orderId)).paid, false);
});

test('signRequest accepts a PKCS#1 private key', async () => {
  const h = await signRequest({ method: 'POST', path: '/x', body: '{}', merchantId: 'M', privateKeyPem: pem(api.privateKey, 'pkcs1') });
  const hash = crypto.createHash('sha256').update('{}').digest('base64');
  assert.ok(crypto.verify('sha256', Buffer.from(`POST\n/x\n${h['X-Timestamp']}\n${hash}`), api.publicKey, Buffer.from(h['X-Signature'], 'base64')));
});

test('checkout rejects bad input and missing config', async () => {
  const env = makeEnv();
  assert.equal((await checkout(env, 'nope')).res.status, 400);
  assert.equal((await checkout({ ...env, WAFFO_PRIVATE_KEY: '' }, 'a@example.com')).res.status, 503);
});

test('webhook: valid order.completed unlocks; second order from same email is $29', async () => {
  const env = makeEnv();
  const first = (await checkout(env, 'a@example.com')).body;
  const ev = completed(first.orderId, '19.00');
  assert.equal((await handleWebhook(signedWebhook(ev), env)).status, 200);
  assert.equal((await status(env, first.orderId)).paid, true);
  assert.equal((await status(env, first.orderId, 'b'.repeat(64))).paid, false);
  const dup = await (await handleWebhook(signedWebhook(ev), env)).json();
  assert.equal(dup.duplicate, true);
  const second = await checkout(env, 'a@example.com');
  assert.equal(second.body.tier, 'standard');
  assert.equal(second.body.amount, '29.00');
  assert.equal(second.calls[0].body.productId, 'PROD_std');
});

test('webhook: bad, tampered, stale or missing signatures are rejected and unlock nothing', async () => {
  const env = makeEnv();
  const { orderId } = (await checkout(env, 'a@example.com')).body;
  const ev = completed(orderId, '19.00');
  const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const reqs = [
    signedWebhook(ev, { key: other.privateKey }),
    signedWebhook(ev, { tamper: true }),
    signedWebhook(ev, { t: Date.now() - 46 * 60 * 1000 }),
    new Request('https://myform413.com/api/waffo-webhook', { method: 'POST', body: JSON.stringify(ev) }),
  ];
  for (const r of reqs) assert.equal((await handleWebhook(r, env)).status, 401);
  assert.equal((await status(env, orderId)).paid, false);
  assert.equal(await verifyWebhookSignature('{}', 't=abc,v1=zz', env.WAFFO_WEBHOOK_PUBLIC_KEY), false);
});

test('webhook: wrong amount, wrong mode or non-payment events do not unlock', async () => {
  const env = makeEnv();
  const { orderId } = (await checkout(env, 'a@example.com')).body;
  await handleWebhook(signedWebhook(completed(orderId, '1.00')), env);
  await handleWebhook(signedWebhook(completed(orderId, '19.00', { mode: 'prod', eventId: 'PAY_2' })), env);
  await handleWebhook(signedWebhook({ ...completed(orderId, '19.00'), eventType: 'refund.succeeded', eventId: 'R1' }), env);
  assert.equal((await status(env, orderId)).paid, false);
});

test('webhook: a redelivery after a failed order update still marks the order paid', async () => {
  const env = makeEnv();
  const { orderId } = (await checkout(env, 'a@example.com')).body;
  const ev = completed(orderId, '19.00');
  const db = env.DB;
  env.DB = { prepare(sql) { if (/^UPDATE orders/.test(sql.trim())) throw new Error('db down'); return db.prepare(sql); } };
  await assert.rejects(handleWebhook(signedWebhook(ev), env));
  assert.equal((await status({ ...env, DB: db }, orderId)).paid, false);
  env.DB = db;
  assert.equal((await handleWebhook(signedWebhook(ev), env)).status, 200);
  assert.equal((await status(env, orderId)).paid, true);
});
