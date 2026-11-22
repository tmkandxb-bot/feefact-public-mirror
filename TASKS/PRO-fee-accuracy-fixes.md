# Task PRO-fee-accuracy-fixes — Fix the 8 live fee-accuracy issues (Fee Watcher #2–#9)

Context: Fee Watcher opened 8 issues against the live feefact.com calculators and
fee pages. Every one is a place where the site shows a wrong number or rule.
Fix them in this repo's app (calculators in `src/`, fee pages in `app/`) and list
each fix in the PR description so Remy can port the same corrections to the live
static site. QA reviews; Fee Watcher re-verifies each item against its source.

## The 8 fixes (each cites its official source — re-read it before changing code)

1. **Issue #2 — buyer-paid shipping counts in the US referral fee base.**
   US referral fee is charged on the item price PLUS buyer-paid shipping.
   Fix the home calculator and the referral-fee examples that show $1.80 at 6% on
   a $29.99 item even with $3.99 buyer-paid shipping.
2. **Issue #3 — limit the US 5% preset to the published tiers.**
   The "5% — jewelry / pre-owned" preset is wrong on two counts: jewelry is 6%,
   and 5% does not apply flat to the full price on high-value pre-owned items
   (tiered). Fix the label and the tier logic.
3. **Issue #4 — show the refund administration fee exemptions.**
   The US refund admin fee (20% of referral, $5/SKU cap) is $0 on "Buy now refund
   later" creator-sample refunds and on buyer-initiated pre-shipment refunds that
   meet TikTok's auto-cancellation criteria. The refund page FAQ currently says
   the fee applies to every refund and can never be waived — correct it.
4. **Issue #5 — stop applying the US refund administration fee in the UK and
   EU calculators.** The 20%-of-referral / $5-per-SKU rule is US-only. Remove it
   from the UK and EU calculator paths.
5. **Issue #6 — split the EU new-seller commission by country.**
   The EU new-seller referral rate is not one number; it differs by country.
   Update the new-seller page and the EU calculator to the per-country rates
   from the official EU seller documentation.
6. **Issue #7 — default the UK and EU settlement checkers to the 9% standard
   rate.** They currently start at 6%, so a correctly charged 9% commission is
   flagged as wrong. Default 9%; keep the 6% figure only where a specific
   program actually uses it.
7. **Issue #8 — exclude blacklisted products from the US Smart Promotion fee
   base.** Smart Promotion (3.5% outside campaigns, 4.5–5.5% during campaigns)
   is charged on eligible GMV only; blacklisted product IDs can be excluded.
   Correct the Complete Breakdown page's claim that it is charged on all GMV.
8. **Issue #9 — use the $1 US seller payout minimum, not creator terms.**
   Seller Center's Finances FAQ gives a $1 minimum for automatic US seller bank
   payouts. The $2 minimum and $0.05 / 0.9% schedule on the site are Creator
   Center withdrawal terms — remove them from the seller payout section.

## Rules (hard — team red line)
- Every changed number must trace to the official page Fee Watcher cited in the
  issue. Cite the URL per fix in the PR description. No figure from memory.
- If a fix's official source cannot be re-confirmed, leave that item out of the
  PR and say so in the PR description instead of guessing.
- Do not change any fee number outside these 8 issues.

## Acceptance
- PR description lists each fix (issue #) + its source URL + what changed.
- Fee Watcher re-verifies each item; QA review passes. Do NOT merge — Remy merges.

Assignee: Pro Builder (after PRO-batch-sku-profit, or in parallel if capacity allows)
Reviewer: QA Reviewer + Fee Watcher (numbers)
