# Task PAGE-TPDB-design-polish — TokenPriceDB homepage design polish (from Remy's 2026-11-22 design audit)

Scope: presentation ONLY. `data/models.json` and `data/price-changes.json` stay
byte-identical; calculator hooks (#prompt, #in-tokens, #out-tokens,
#count-note, #usage, #cost-table), scripts, title/meta and URLs do not change.

## P1 — do these first
1. **Third image check.** Verify the price-change-alerts image actually renders
   in the price-changes band on desktop and mobile (Remy's full-page capture
   ended before it became visible). Fix placement/loading if missing.
2. **"As entered" pill noise.** The cost table repeats the same "as entered"
   pill 43 times. De-emphasize it (smaller, muted) or move the explanation into
   the table caption once and drop the per-row pill. Presentation only — the
   token-count behaviour does not change.
3. **Hero strip cards:** one label ("PRICES WITH A SOURCE LINK") wraps to two
   lines and breaks the row's rhythm. Shorten the label or set a uniform
   min-height so all five cards align.

## P2
4. **Calculator heading duplication.** The section heading repeats the H1
   ("LLM API token & cost calculator" / "Token & cost calculator"). Retitle
   the section to an action heading (e.g. "Price a prompt") in the generator
   template; hooks unchanged.
5. **CHECKED column repetition.** The pricing table repeats the same date 43
   times. Mute it (smaller, grey) — keep the per-row source links as they are.
6. **Family cards typography.** Range lines wrap mid-unit ("Input $0.09 –
   $1.32 / 1M" breaks awkwardly). Tighten: smaller size, no wrap on the unit
   suffix.

## P3
7. **Date format in the hero strip:** render "21 Nov 2026" instead of the ISO
   string (format at render time; the data value does not change).
8. **Footer:** the page ends abruptly after price changes. Add a slim footer
   with links to the calculator pages, compare, price-changes, and a one-line
   data-source note. (If a footer already exists below the fold, enrich it
   instead.)

## Acceptance
- PR includes before/after screenshots at 1440px and 390px.
- Data files zero-diff, calculator hooks unchanged (state both in the PR).
- QA verifies on the rendered page. Do NOT merge — Remy merges and deploys.
