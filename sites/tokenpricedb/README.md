# tokenpricedb.com

Static site: LLM API pricing database + token/cost calculator. No server code; deploy this folder as-is.

- `data/models.json`, `data/price-changes.json` — single source of truth. Every row has a `sourceUrl` and `checkedDate`. Never add a price that is not on the linked page.
- `scripts/gen-models.mjs` — regenerates all HTML pages from the data: `npm run build`.
- `vendor/gpt-tokenizer-o200k_base.js` — browser bundle of `gpt-tokenizer` (o200k_base): `npm ci && npm run vendor`.

After editing data, run `npm run build` and commit the regenerated pages.
