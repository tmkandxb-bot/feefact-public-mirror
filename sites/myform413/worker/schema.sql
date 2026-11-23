-- D1 schema for the MyForm413 export paywall. Apply with:
--   wrangler d1 execute myform413 --file=schema.sql
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,               -- our reference, sent to Waffo as orderMerchantExternalId
  email TEXT NOT NULL,               -- email entered on the site (lowercased)
  token_hash TEXT NOT NULL,          -- sha256 of the browser's export token
  tier TEXT NOT NULL,                -- 'first' ($19) or 'standard' ($29)
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  mode TEXT NOT NULL,                -- 'test' or 'prod'
  status TEXT NOT NULL,              -- 'pending' | 'paid'
  waffo_session_id TEXT,
  waffo_order_id TEXT,
  buyer_email TEXT,                  -- email Waffo reports on the paid order
  paid_subtotal TEXT,                -- listPrice.subtotal from the webhook, for audit
  amount_check TEXT,                 -- 'ok' | 'mismatch' | 'unknown'
  created_at TEXT NOT NULL,
  paid_at TEXT
);
CREATE INDEX IF NOT EXISTS orders_email ON orders (email, status);
CREATE INDEX IF NOT EXISTS orders_buyer_email ON orders (buyer_email, status);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_key TEXT PRIMARY KEY,        -- `${eventType}:${eventId}`, deliveries can repeat
  event_type TEXT NOT NULL,
  mode TEXT NOT NULL,
  order_ref TEXT,
  payload TEXT NOT NULL,
  received_at TEXT NOT NULL
);
