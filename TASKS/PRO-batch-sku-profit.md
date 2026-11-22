# Task PRO-batch-sku-profit — Batch SKU profit calculator (FeeFact Pro prototype)

Context: FeeFact's first paid feature (validated 2026-11-14: at least 5 competitors
charge $19–599/mo for per-SKU profit / batch import / reporting, and the pain
recurs across seller forums). Sellers currently paste SKUs into spreadsheets one
by one. Build the prototype in this repo's app: paste a batch of SKUs, get
per-SKU profit with the full TikTok Shop fee stack. This is the core of the future
Pro tier — the free single-item calculator stays as it is.

## Deliverable — page `/tools/batch-sku-profit/` (follow the app's existing structure)
1. Input: a textarea where the seller pastes CSV rows, one SKU per line:
   `sku, price, product cost, shipping, referral %, creator %, ads %`
   - Ship 5 pre-filled SAMPLE rows, clearly labeled as examples, so the page works
     on first load.
   - Also allow adding/removing rows in a rendered table (editable cells).
2. Output table, one row per SKU, computed with the SAME logic as the existing
   single-item calculator (`src/calculator.js` — `calcNetProfit`): referral fee,
   creator commission, ads, total fees, net profit, margin %. Reuse that function;
   do not fork a second fee implementation.
3. Summary row: totals across all SKUs + average margin, and a "losing money"
   highlight on any SKU with negative net.
4. A short explainer under the tool: what each fee is, linking to the fee pages.

## Rules (hard)
- No new fee numbers. Every rate comes from the pasted row or the existing
  calculator defaults. Sample rows are examples and must say so.
- Client-side only, like the existing calculator. No accounts, no storage claims.
- If `calcNetProfit` cannot be reused as-is, say why in the PR description and
  propose the smallest change — do not silently duplicate fee logic.

## Acceptance
- PR description shows 2 hand-checked rows (paste row → expected net/margin
  arithmetic → matches the page output).
- Page works with the sample rows on load; pasting replaces them.
- QA review passes. Do NOT merge — Remy merges.

Assignee: Pro Builder
Reviewer: QA Reviewer
