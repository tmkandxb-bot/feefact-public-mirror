# Task PAGE-P5-affiliate-benchmarks — Affiliate commission page: add a category benchmark table

Context: feefact.com's affiliate commission page explains how TikTok Shop affiliate
commissions work, but sellers keep asking "what rate should I set for my category?"
Add a category benchmark table to the affiliate page in this repo's app. Remy ports
approved content to the live site.

## The one rule that matters most here
Affiliate commission rates are SET BY EACH SELLER — they are not platform fees.
The table must be labeled, in the page text itself, as **common seller-set ranges
(examples)**, never as TikTok Shop rates. If a reader could mistake a number for an
official platform fee, the wording is wrong.

## Deliverable
- The affiliate commission page in the app, with a new section:
  **"Typical commission ranges by category (seller-set examples)"**
- One row per major category (e.g. beauty, fashion, electronics, home, health),
  each with a range and a one-line note on why that category tends to sit there
  (margin, return rate, creator demand) — notes must be reasoning, not invented data.
- Reuse the worked examples already on the live page
  https://feefact.com/tiktok-shop-affiliate-commission/ where numbers are needed;
  do not introduce new precise figures from memory.
- If you cite any outside guide for a range, name it in the PR description and keep
  the range wide; single-source precise numbers are not allowed.

## Acceptance
- The "seller-set example" labeling appears in the section intro AND the table caption.
- No number on the page can be read as an official platform rate.
- QA review passes. Do NOT merge — Remy merges.

Assignee: Page Builder
Reviewer: QA Reviewer
