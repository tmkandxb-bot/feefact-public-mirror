// Waffo Pancake helpers for Cloudflare Workers (WebCrypto only, no SDK).
// Docs: https://docs.waffo.ai/api-reference/authentication and /api-reference/webhooks

const enc = new TextEncoder();

export const WEBHOOK_TOLERANCE_MS = 45 * 60 * 1000; // retries replay the original t, see Waffo docs

function b64ToBytes(b64) {
  const bin = atob(b64.replace(/\s+/g, ''));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin);
}

function pemBody(pem) {
  return b64ToBytes(String(pem).replace(/\\n/g, '\n').replace(/-----[^-]+-----/g, ''));
}

function derLen(n) {
  if (n < 0x80) return [n];
  const bytes = [];
  while (n > 0) { bytes.unshift(n & 0xff); n >>= 8; }
  return [0x80 | bytes.length, ...bytes];
}

// WebCrypto imports PKCS#8 only; Waffo also issues PKCS#1 ("BEGIN RSA PRIVATE KEY") keys.
function pkcs1ToPkcs8(pkcs1) {
  const algId = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const octet = [0x04, ...derLen(pkcs1.length), ...pkcs1];
  const body = [0x02, 0x01, 0x00, ...algId, ...octet];
  return new Uint8Array([0x30, ...derLen(body.length), ...body]);
}

const RSA = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

export async function importPrivateKey(pem) {
  let der = pemBody(pem);
  if (/BEGIN RSA PRIVATE KEY/.test(pem)) der = pkcs1ToPkcs8(der);
  return crypto.subtle.importKey('pkcs8', der, RSA, false, ['sign']);
}

export async function importPublicKey(pem) {
  return crypto.subtle.importKey('spki', pemBody(pem), RSA, false, ['verify']);
}

// canonicalRequest = METHOD \n PATH \n TIMESTAMP(seconds) \n base64(sha256(body))
export async function signRequest({ method, path, body, merchantId, privateKeyPem, now = Date.now() }) {
  const timestamp = Math.floor(now / 1000).toString();
  const bodyHash = bytesToB64(await crypto.subtle.digest('SHA-256', enc.encode(body)));
  const canonical = `${method}\n${path}\n${timestamp}\n${bodyHash}`;
  const key = await importPrivateKey(privateKeyPem);
  const signature = bytesToB64(await crypto.subtle.sign(RSA, key, enc.encode(canonical)));
  return {
    'Content-Type': 'application/json',
    'X-Merchant-Id': merchantId,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

export async function createCheckoutSession(env, payload, fetchImpl = fetch) {
  const path = '/v1/actions/checkout/create-session';
  const body = JSON.stringify(payload);
  const headers = await signRequest({
    method: 'POST', path, body,
    merchantId: env.WAFFO_MERCHANT_ID,
    privateKeyPem: env.WAFFO_PRIVATE_KEY,
  });
  const base = env.WAFFO_API_BASE || 'https://api.waffo.ai';
  const res = await fetchImpl(base + path, { method: 'POST', headers, body });
  const json = await res.json().catch(() => null);
  const data = json && json.data;
  if (!res.ok || !data || !data.checkoutUrl) {
    throw new Error(`Waffo create-session failed (HTTP ${res.status})`);
  }
  return data; // { sessionId, checkoutUrl, expiresAt }
}

export function parseSignatureHeader(header) {
  const out = {};
  for (const part of String(header || '').split(',')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

// X-Waffo-Signature: t=<ms>,v1=<base64 RSA-SHA256 over `${t}.${rawBody}`>
export async function verifyWebhookSignature(rawBody, signatureHeader, publicKeyPem, now = Date.now()) {
  const { t, v1 } = parseSignatureHeader(signatureHeader);
  if (!t || !v1 || !/^\d+$/.test(t) || !publicKeyPem) return false;
  if (Math.abs(now - Number(t)) > WEBHOOK_TOLERANCE_MS) return false;
  try {
    const key = await importPublicKey(publicKeyPem);
    return await crypto.subtle.verify(RSA, key, b64ToBytes(v1), enc.encode(`${t}.${rawBody}`));
  } catch {
    return false;
  }
}
