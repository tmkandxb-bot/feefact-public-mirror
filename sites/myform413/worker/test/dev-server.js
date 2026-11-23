// Local end-to-end harness: serves the site, runs the Worker handlers against an
// in-memory database, and stands in for Waffo with a fake checkout page that sends a
// correctly signed order.completed webhook. No Waffo account or credential is used.
//   node test/dev-server.js [port]     (site files: ../ plus MF413_SITE_DIR for app.js etc.)
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../src/index.js';
import { handleCheckout } from '../src/index.js';
import { d1 } from './d1-shim.js';

const port = Number(process.argv[2] || 8413);
const origin = `http://localhost:${port}`;
const roots = [process.env.MF413_SITE_DIR, new URL('../../', import.meta.url).pathname].filter(Boolean);
const api = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const hook = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const env = {
  DB: d1(), WAFFO_ENVIRONMENT: 'test', SITE_ORIGIN: origin, WAFFO_MERCHANT_ID: 'MER_local',
  WAFFO_PRIVATE_KEY: api.privateKey.export({ type: 'pkcs8', format: 'pem' }),
  WAFFO_WEBHOOK_PUBLIC_KEY: hook.publicKey.export({ type: 'spki', format: 'pem' }),
  WAFFO_PRODUCT_ID_STANDARD: 'PROD_local_29', WAFFO_PRODUCT_ID_FIRST: 'PROD_local_19',
};
const PRODUCT_PRICE = { PROD_local_29: '29.00', PROD_local_19: '19.00' };
const sessions = new Map();
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const fakeWaffo = async (url, init) => {
  const body = JSON.parse(init.body);
  const id = 'cs_' + crypto.randomBytes(6).toString('hex');
  sessions.set(id, body);
  return new Response(JSON.stringify({ data: { sessionId: id, checkoutUrl: `${origin}/__fake-waffo/${id}` } }));
};

async function toRequest(req) {
  const chunks = []; for await (const c of req) chunks.push(c);
  return new Request(origin + req.url, {
    method: req.method, headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
}
async function send(res, r) {
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  if (url.pathname === '/api/checkout' && req.method === 'POST') return send(res, await handleCheckout(await toRequest(req), env, { fetch: fakeWaffo }));
  if (url.pathname.startsWith('/api/')) return send(res, await worker.fetch(await toRequest(req), env));

  const m = url.pathname.match(/^\/__fake-waffo\/(cs_\w+)(\/pay)?$/);
  if (m && sessions.has(m[1])) {
    const s = sessions.get(m[1]);
    const price = PRODUCT_PRICE[s.productId];
    if (!m[2]) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(`<h1>Fake Waffo checkout (local test)</h1><p>${s.buyerEmail} — <b id="price">$${price} ${s.currency}</b></p>
        <form method="post" action="/__fake-waffo/${m[1]}/pay"><button id="pay">Pay</button></form>`);
    }
    const event = {
      id: 'PAY_' + m[1], eventType: 'order.completed', eventId: 'PAY_' + m[1], storeId: 'STO_local', mode: 'test',
      data: { orderId: 'ORD_' + m[1], buyerEmail: s.buyerEmail, currency: s.currency, paymentStatus: 'succeeded',
        listPrice: { subtotal: price, total: price }, orderMerchantExternalId: s.orderMerchantExternalId },
    };
    const raw = JSON.stringify(event), t = Date.now();
    const v1 = crypto.sign('sha256', Buffer.from(`${t}.${raw}`), hook.privateKey).toString('base64');
    const delay = Number(process.env.MF413_WEBHOOK_DELAY_MS || 3000); // real webhooks arrive after the redirect
    setTimeout(() => worker.fetch(new Request(origin + '/api/waffo-webhook', {
      method: 'POST', body: raw, headers: { 'X-Waffo-Signature': `t=${t},v1=${v1}` },
    }), env).then(r => console.log('webhook ->', r.status)), delay);
    res.writeHead(303, { Location: s.successUrl }); return res.end();
  }

  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  for (const root of roots) {
    const file = path.join(root, rel);
    if (file.startsWith(path.resolve(root)) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      return fs.createReadStream(file).pipe(res);
    }
  }
  res.writeHead(404); res.end('not found');
}).listen(port, () => console.log(`MyForm413 local test server on ${origin}`));
