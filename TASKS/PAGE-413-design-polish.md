# Task PAGE-413-design-polish — MyForm413 homepage design polish (from Remy's 2026-11-22 design audit)

Scope: visual polish ONLY. No facts, prices, FAQ text, title/meta, JSON-LD or
wizard behaviour may change. The wizard block's HTML structure, ids/classes and
all JS stay byte-identical; wizard styling goes through a CSS layer (home.css
or equivalent), never by editing the wizard markup.

## P1 — do these first
1. **Wizard visual polish (CSS only).** The six-step form is the product, but it
   currently looks visibly cheaper than the marketing sections around it:
   default-looking inputs, tight labels. Via CSS only: input min-height 44px and
   comfortable padding, clearer label weight/size and spacing, more card
   padding, a stronger step-title hierarchy, brand-teal focus rings. No markup,
   hook or JS changes.
2. **Sample statement card presence.** The hero's sample card is the product
   proof (benchmark statementsready.com makes the document itself the hero).
   Enlarge it ~15–20% on desktop and let it overlap the photo more prominently.
   Keep the SAMPLE label and the sample numbers exactly as they are.
3. **FAQ illustration check.** In Remy's full-page capture, the FAQ band's left
   column under the heading looked empty — verify the checklist illustration
   actually renders beside the FAQ on desktop and mobile; fix placement or
   loading if it does not.

## P2
4. **Three-steps cards:** equal heights, body text starting at the same y.
5. **Data band consistency:** align the four stats on one baseline; unify the
   accent styling — currently "20" is white + "%+" teal while "0 uploads" colors
   the whole word. One rule: number white, suffix teal, for all four.
6. **Comparison table:** subtle zebra striping or row hover; give the blank
   top-left header cell a matching background (keep it text-free or label it
   "Compared on").
7. **Footer:** add links to the two guide pages and /sitemap.xml (the header
   has them; the footer is a single bare line today).

## P3
8. **Hero photo blend:** a slight cool overlay at the photo's edges so the warm
   photo sits inside the navy palette (CSS overlay/filter; do not edit the
   image file).
9. **Hero bottom rule:** the bright teal line under the hero reads abrupt —
   soften it to a gradient fade or remove it.

## Acceptance
- PR includes before/after screenshots at 1440px and 390px.
- Wizard block diff vs the live page: byte-identical (state it in the PR).
- QA checks every P1 item on the rendered page. Do NOT merge — Remy merges and
  deploys.
