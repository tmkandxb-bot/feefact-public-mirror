# Task PRO-tokenpricedb-v1 — Build tokenpricedb.com v1 (AI model API cost calculator hub)

Context: New standalone site (domain tokenpricedb.com, purchased). It is a pricing
database + cost calculator hub for LLM APIs. Plain static site in repo folder
`sites/tokenpricedb/` (HTML/CSS/JS; one small Node script to generate model pages from data).

## Pages
0. Also create calculator landing paths `/token-calculator/` and `/token-cost-calculator/`
   (same calculator, page titles use those exact query phrases).
1. `/` — Token & cost calculator + full pricing table.
   - Textarea for prompt text, plus manual input/output token fields.
   - Token counting: exact for OpenAI models via the `gpt-tokenizer` package (o200k/cl100k);
     for other providers show an estimate and label it "estimate".
   - Cost table across every model in the data file: cost for the entered usage,
     sortable, cheapest first. Full pricing table (per 1M tokens) below.
2. `/models/<slug>/` — one page per model, generated from `data/models.json` by
   `scripts/gen-models.mjs`: price card (input / output / cached input per 1M),
   context window, provider, and "cost per typical task" examples COMPUTED from the
   prices in the data file (show the arithmetic), link back to the calculator.
3. `/price-changes/` — price change log rendered from `data/price-changes.json`.
   Seed ONLY with these verified entries (checked 2026-11-21):
   - Gemini 4 Carbon launch pricing $2 input / $10 output per 1M, with an announced
     increase of input price to $4 after Nov 30, 2026.
   - GPT-6.2 Astra launch pricing $8 / $40 per 1M; GPT-6.2 Sol $2 / $10 per 1M.
   No other entries unless sourced from an official pricing page (add source URL per entry).
4. `/compare/cheapest-llm-api/` — models ranked by blended cost for three workload
   profiles (chat, RAG, coding agent); all numbers computed from data/models.json.

## Data rules (hard — team red line: never invent numbers)
- `data/models.json`: ~40 current models across OpenAI, Anthropic, Google, DeepSeek,
  xAI, Mistral. Each row: provider, model, slug, input/output/cached price per 1M tokens,
  context window, sourceUrl (official pricing page or the model's OpenRouter page),
  checkedDate.
- If a price cannot be verified from a public page, OMIT the model. No placeholders.
- All pages render from the JSON; it is the single source of truth.

## Acceptance
- Static files run as-is (no server code). 
- PR description shows 2 hand-checked calculator examples (tokens/1e6 × price).
- Every model row carries a source URL. QA review passes. Do NOT merge — Remy merges.

Assignee: Pro Builder
Reviewer: QA Reviewer
