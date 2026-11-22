# Task PAGE-TPDB-alternatives — TokenPriceDB: OpenRouter alternatives + LLM cost calculator pages (from HEXIN homework, task 221087)

Source: 生财航海 10485 任务 221087 第 1 名作业 HEXIN (sourceId 239047).
His SERP claims are LEADS ONLY — re-verify every number below yourself
before writing it into a page. Do NOT copy his volumes, CPC or rankings
blindly, and do NOT invent any price: every price on the page comes from
`data/models.json` / official provider pricing pages, with a checked date
and source link per row (same rule as PRO-tokenpricedb-v1, QA checked
43/43 against OpenRouter).

## Pages to build

### 1. `/openrouter-alternatives/` — target phrase "openrouter alternatives"
- Verify first: monthly volume, trend, and current top 20. HEXIN reported
  880 → 1,600/mo (+82% in 6 months), top 20 mostly comparison articles
  (not tool monopolies), llmapi.ai ranking #6 with a dedicated
  alternatives landing page. Confirm or correct all of it.
- Page: a comparison landing page for LLM API providers / resellers
  (OpenRouter vs the alternatives a buyer actually compares: direct
  provider APIs, other aggregators/resellers). For each alternative give
  what it is, who it fits, and a price example computed from our own
  price data (same model, same 1M-token example, so numbers are
  comparable) — no invented prices, no prices without a source link.
- Include the calculator hook: link into `/token-calculator/` with the
  comparison pre-loaded where feasible; keep existing calculator hooks
  unchanged.

### 2. `/llm-cost-calculator/` — target phrase "llm cost calculator"
- Verify first: HEXIN reported ~70/mo, CPC $9.35, top 20 has 4 independent
  tool sites, #2 llmpricecheck.com price data stopped in 2024 (GPT-4o era,
  stale), llm-prices.com (registered 2025-04) reached #1 in ~7 months.
  Confirm or correct; in particular check whether our existing
  `/token-calculator/` and `/token-cost-calculator/` already answer this
  phrase, and if so build this page as the dedicated entry page that
  reuses the same calculator (do not build a second divergent calculator).
- Page: a focused cost-calculator entry page — "price a prompt" first,
  then a per-model cost table with checked date + source link per row.
  The stale-competitor gap is the angle: every price row shows when it
  was last checked, so a reader can see ours is current where rivals
  are not. Do NOT claim a rival is stale unless you opened it and saw
  the stale date yourself; cite what you saw.

## Red lines
- Prices: only from `data/models.json` or official provider pages, with
  checked date + source link. Never from the homework, never from memory.
- No fake "best / #1 / cheapest" claims. No ranking claim without a
  dated SERP check recorded in the PR description.
- Presentation + these two pages only. `data/models.json` prices change
  only via the normal price-update path with sources, not inside this PR.
- English copy only; keep the existing site design system and footer.

## Acceptance
- PR includes: the dated SERP verification for both phrases (top 10 with
  domains), the price-source list, and before/after screenshots at
  1440px and 390px.
- QA verifies every price row against its source link. Do NOT merge —
  Remy merges and deploys.
