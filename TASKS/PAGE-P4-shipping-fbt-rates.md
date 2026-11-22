# Task PAGE-P4-shipping-fbt-rates — Shipping fees page: add the FBT rate layer

Context: feefact.com's shipping page (/tiktok-shop-shipping-fees/) explains seller-
shipped costs but has no Fulfilled-by-TikTok (FBT) rate layer. TikTok Shop US
updated the FBT rate card effective November 1, 2026. Add the FBT layer to the
shipping page in this repo's app. Remy ports approved content to the live site.

## Sequencing (important)
Do NOT start writing numbers until Fee Watcher has posted its FBT verification
comment on your PR or in the team chat: the rate card figures must come from the
official FBT pricing page, and Fee Watcher cross-checks them. Open the PR early
with the page structure and the non-numeric text; add the rate table only after
verification lands.

## Deliverable
- The shipping fees page in the app, with a new section: **"Fulfilled by TikTok
  (FBT) rates"** — what FBT charges cover (fulfillment + delivery), the rate table
  by weight/size tiers as published on the official card, and a short worked
  comparison: same item, seller-shipped example cost vs FBT (label every
  seller-shipped number as an example).
- Note the rate card's effective date (November 1, 2026) on the page.

## Data rules (hard — team red line)
- Every FBT figure must trace to the official TikTok Shop FBT pricing page.
  Cite the URL in the PR description. No figure from memory, blogs, or videos.
- If a tier cannot be verified, omit the tier and say so in the PR description.

## Acceptance
- Fee Watcher's verification is referenced in the PR.
- QA review passes. Do NOT merge — Remy merges.

Assignee: Page Builder (after P3 and P5, or in parallel once Fee Watcher verifies)
Reviewer: QA Reviewer + Fee Watcher (numbers)
