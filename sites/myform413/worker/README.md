# MyForm413 payment Worker (Waffo Pancake, Test Mode)

Filling the form is free. The download button on Step 6 opens checkout: **$29** per
download, **$19** for a customer's first order. These amounts are fixed; see `src/pricing.js`.

| Route | What it does |
| - | - |
| `POST /api/checkout` | Takes `{email, token}`, picks the tier server-side, creates a Waffo checkout session (API Key signature), stores a `pending` order, returns `checkoutUrl`. |
| `POST /api/waffo-webhook` | Verifies `X-Waffo-Signature` (RSA-SHA256 over `${t}.${rawBody}`, 45-minute tolerance) on the raw body, de-duplicates by event, and marks the order `paid` on `order.completed` when currency and list price match the quote. |
| `GET /api/order-status` | `{paid}` for an order, only with the browser token that created it. |

`../paywall.js` is the browser side. It sends only the email and a random token; form
answers stay in the browser (held in `sessionStorage` across the checkout redirect).

## How "first order $19" is decided

By email: an email with no paid order in this mode gets the $19 product, otherwise the
$29 product. The browser cannot choose the tier. A different email gets $19 again.

## Setup still needed (Test Mode)

None of this is in the repo, and no credential has been used so far:

1. In the Waffo dashboard, **Test Mode**: two one-time USD products, $29.00 and $19.00.
   Put their `PROD_` IDs in `wrangler.toml`.
2. `wrangler d1 create myform413`, put the id in `wrangler.toml`, then
   `wrangler d1 execute myform413 --remote --file=schema.sql`.
3. `wrangler secret put` for `WAFFO_MERCHANT_ID`, `WAFFO_PRIVATE_KEY` (Test key) and
   `WAFFO_WEBHOOK_PUBLIC_KEY` (Test webhook public key).
4. Register `https://myform413.com/api/waffo-webhook` as the Test webhook for `order.completed`.
5. `wrangler deploy`, and publish `paywall.js` plus the updated `index.html` with the site.

Until the Worker is deployed, do not publish `paywall.js`: the download button would
show the paywall with no working checkout behind it.

Going live (`WAFFO_ENVIRONMENT = "prod"`, live key, KYC, payouts) is the owner's step.

## Tests

```
npm test                                                          # unit tests, Node 22.5+
MF413_SITE_DIR=/path/to/live-site-files node test/dev-server.js   # local end-to-end with a fake Waffo
```

## Known limits

- The PDF is built in the browser, so the paywall is enforced by page script; someone
  who edits the page's JavaScript can skip it. Enforcing it fully would mean building
  the PDF on the server, which conflicts with "your data never leaves your browser".
- A paid order unlocks downloads in the browser that paid, with no expiry. Whether
  "$29 per download" should be stricter is a product decision that is not made here.
- Waffo shows tax on top of the list price where it applies; the check compares the pre-tax list price.
