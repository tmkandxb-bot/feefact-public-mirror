// Generates every static page of tokenpricedb.com from data/*.json (the single source of truth).
// Usage: node scripts/gen-models.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => JSON.parse(readFileSync(join(root, f), 'utf8'))
const models = read('data/models.json')
const changes = read('data/price-changes.json')

const SITE = 'https://tokenpricedb.com'
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const usd = (n) => '$' + (n >= 1 ? n.toFixed(2) : n >= 0.01 ? n.toFixed(4) : n.toFixed(6))
const price = (n) => '$' + String(n) // per-1M prices are printed exactly as stored
const num = (n) => n.toLocaleString('en-US')
const checked = models.map((m) => m.checkedDate).sort().at(-1)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const prettyDate = (iso) => { const [y, m, d] = iso.split('-'); return `${+d} ${MONTHS[+m - 1]} ${y}` }

// Rows the provider has deprecated or retired and whose stored price can no longer be confirmed on the
// provider's own pages. They stay out of every table, calculator and ranking; only their model page remains.
const GOOGLE_PRICING = 'https://ai.google.dev/gemini-api/docs/pricing'
const DEEPSEEK_PRICING = 'https://api-docs.deepseek.com/quick_start/pricing'
const MISTRAL_MODELS = 'https://docs.mistral.ai/models'
const HELD_BACK = {
  'gemini-3-5-flash': { text: 'Google lists gemini-3.5-flash as deprecated: it has no price on Google\u2019s pricing page, and API requests to it are automatically routed to gemini-3.6-flash.', url: 'https://ai.google.dev/gemini-api/docs/deprecations', label: 'Google deprecations page' },
  'mistral-large-2512': { text: 'Mistral lists mistral-large-2512 as deprecated on 10/31/2026 and retiring on 4/30/2027, with Mistral Large 4 as the alternative. Mistral\u2019s pricing page gives no price for it.', url: MISTRAL_MODELS, label: 'Mistral models page' },
  'devstral-2512': { text: 'Mistral lists devstral-2512 as deprecated on 5/22/2026 and retired on 7/31/2026, with Mistral Medium 3.5 as the alternative.', url: MISTRAL_MODELS, label: 'Mistral models page' },
  'deepseek-v4-pro': { text: 'DeepSeek\u2019s pricing page lists DeepSeek-V4-Pro-0813 as the version behind the deepseek-v4-pro model name and gives no price for the 0423 version.', url: DEEPSEEK_PRICING, label: 'DeepSeek pricing page' },
  'deepseek-v4-flash': { text: 'DeepSeek states that the legacy deepseek-v4-flash model has been retired: requests under that name are served by DeepSeek-V4.1-Flash-1017 and billed at the Flash price.', url: DEEPSEEK_PRICING, label: 'DeepSeek pricing page' },
}
// Listed rows whose provider page states an end date, a second rate or a long-context tier for the price.
const geminiStep = 'Google lists $2.00 input / $10.00 output per 1M tokens through November 30, 2026, and $4.00 / $20.00 starting December 1, 2026.'
const deepseekPeak = (peak, offPeak) => `DeepSeek bills two rates. This row is the peak rate (${peak} per 1M tokens), charged 01:00\u201304:00 and 06:00\u201310:00 UTC, Monday through Friday, excluding Chinese public holidays. The off-peak rate for all other hours is half: ${offPeak}.`
const PRICE_NOTES = {
  'gemini-4-carbon': { text: geminiStep, url: GOOGLE_PRICING, label: 'Google pricing page' },
  'gemini-4-argon': { text: geminiStep, url: GOOGLE_PRICING, label: 'Google pricing page' },
  'gemini-3-8-flash': { text: 'Google lists $0.75 input / $3.75 output per 1M tokens through December 31, 2026, and $1.50 / $7.50 starting January 1, 2027.', url: GOOGLE_PRICING, label: 'Google pricing page' },
  'gpt-5-6-sol': { text: 'OpenAI states that GPT-5.6 Sol\u2019s promotional pricing is available until November 30, 2026; it does not list the price after that date.', url: 'https://developers.openai.com/api/docs/pricing', label: 'OpenAI pricing page' },
  'claude-haiku-5-5': { text: 'Anthropic prices Claude Haiku 5.5 by prompt length. This row is the price for prompts up to 100,000 tokens ($0.10 input / $0.50 output per 1M tokens); prompts over 100,000 tokens cost $0.50 / $2.50.', url: 'https://platform.claude.com/docs/en/about-claude/pricing', label: 'Anthropic pricing page' },
  'deepseek-v4-1-flash-1017': { text: deepseekPeak('$0.3 input / $1.2 output', '$0.15 / $0.6'), url: DEEPSEEK_PRICING, label: 'DeepSeek pricing page' },
  'deepseek-v4-pro-0813': { text: deepseekPeak('$1.32 input / $3.96 output', '$0.66 / $1.98'), url: DEEPSEEK_PRICING, label: 'DeepSeek pricing page' },
}
const NOTES_READ = '2026-11-23'
// Per-request tiers the single stored price cannot express; the calculator switches to them above `over` input tokens.
const LONG_PROMPT = {
  'claude-haiku-5-5': { over: 100000, inputPer1M: 0.5, outputPer1M: 2.5 },
}
const listed = models.filter((m) => !HELD_BACK[m.slug])
const src = (url, label = 'source') => `<a href="${esc(url)}" rel="nofollow noopener">${esc(label)}</a>`
const noteLine = (n) => `${n.text} ${src(n.url, n.label)}, read ${NOTES_READ}.`
const priceNotes = (list = listed) => `<h3 id="price-notes">* Price notes</h3>
<ul>
${list.filter((m) => PRICE_NOTES[m.slug]).map((m) => `<li><strong>${esc(m.model)}</strong>: ${noteLine(PRICE_NOTES[m.slug])}</li>`).join('\n')}
</ul>`

function page(path, title, description, body, { scripts = '', head = '', bodyClass = '', footer = '' } = {}) {
  const depth = path === '' ? 0 : path.split('/').length
  const base = depth ? '../'.repeat(depth) : './'
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}/${path ? path + '/' : ''}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='3' fill='%23111'/%3E%3Ctext x='8' y='12' font-size='11' text-anchor='middle' fill='%23fff' font-family='sans-serif'%3E$%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/style.css">${head ? '\n' + head(base) : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<header class="site">
<a class="brand" href="${base}">TokenPriceDB</a>
<nav>
<a href="${base}">Calculator</a>
<a href="${base}compare/cheapest-llm-api/">Cheapest LLM API</a>
<a href="${base}price-changes/">Price changes</a>
</nav>
</header>
<main>
${body(base)}
</main>
<footer class="site">${footer ? '\n' + footer(base) : ''}
<p>Prices are standard pay-as-you-go list prices in USD per 1M tokens, last checked ${checked}. Every row links to its source.
Batch, priority and long-context tiers are not included. Always confirm on the provider's pricing page before budgeting.</p>
</footer>
${scripts ? scripts(base) : ''}
<script>
// Opened from disk: directory links have no index.html resolution, so add it to the href.
if (location.protocol === 'file:') (function () {
  var fix = function (a) { if (a && a.protocol === 'file:' && a.pathname.slice(-1) === '/') a.href = a.href.split(/[?#]/)[0] + 'index.html'; };
  var onEvent = function (e) { fix(e.target.closest && e.target.closest('a[href]')); };
  document.addEventListener('DOMContentLoaded', function () { [].forEach.call(document.querySelectorAll('a[href]'), fix); });
  document.addEventListener('mousedown', onEvent, true);
  document.addEventListener('focusin', onEvent, true);
})();
</script>
</body>
</html>
`
  const dir = join(root, path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
}

// ---------- calculator pages (/, /token-calculator/, /token-cost-calculator/) ----------
const pricingTable = (base, list = listed, notes = PRICE_NOTES) => `<div class="table-wrap"><table class="sortable" id="pricing-table">
<thead><tr><th>Provider</th><th>Model</th><th class="num">Input / 1M</th><th class="num">Output / 1M</th><th class="num">Cached input / 1M</th><th class="num">Context window</th><th>Source</th><th>Checked</th></tr></thead>
<tbody>
${list.map((m) => `<tr><td data-v="${esc(m.provider)}">${esc(m.provider)}</td><td data-v="${esc(m.model)}"><a href="${base}models/${m.slug}/">${esc(m.model)}</a>${notes[m.slug] ? ' <a href="#price-notes" title="See the note on this price">*</a>' : ''}</td><td class="num" data-v="${m.inputPer1M}">${price(m.inputPer1M)}</td><td class="num" data-v="${m.outputPer1M}">${price(m.outputPer1M)}</td><td class="num" data-v="${m.cachedInputPer1M}">${price(m.cachedInputPer1M)}</td><td class="num" data-v="${m.contextWindow}">${num(m.contextWindow)}</td><td data-v="${esc(m.sourceUrl)}"><a href="${esc(m.sourceUrl)}" rel="nofollow noopener">source</a></td><td data-v="${m.checkedDate}">${m.checkedDate}</td></tr>`).join('\n')}
</tbody></table></div>`

const calcForm = `<section class="calc">
<div>
<label for="prompt">Prompt text</label>
<textarea id="prompt" placeholder="Paste a prompt to count its tokens…"></textarea>
<p class="muted" id="count-note"></p>
</div>
<div class="fields">
<div><label for="in-tokens">Input tokens</label><input type="number" id="in-tokens" min="0" step="1" value="1000"></div>
<div><label for="out-tokens">Output tokens</label><input type="number" id="out-tokens" min="0" step="1" value="500"></div>
<p class="muted">Cost = input tokens ÷ 1,000,000 × input price + output tokens ÷ 1,000,000 × output price.</p>
</div>
</section>`
const costHead = `<h2>Cost for <span id="usage"></span></h2>
<p class="muted">Cheapest first. Click a column header to sort. Token counts are exact only for OpenAI models that gpt-tokenizer maps to o200k_base; every other model is labeled "estimate".</p>`
const costTable = (base) => `<div class="table-wrap"><table class="sortable" id="cost-table" data-base="${base}">
<thead><tr><th>Provider</th><th>Model</th><th>Token count</th><th class="num">Input cost</th><th class="num">Output cost</th><th class="num">Total</th></tr></thead>
<tbody></tbody></table></div>`
const providers = [...new Set(listed.map((m) => m.provider))]
const pricingHead = `<h2>LLM API pricing table (USD per 1M tokens)</h2>
<p class="muted">${listed.length} models across ${providers.join(', ')}. Rows marked * have a note under the table.</p>`

const calculator = (h1, lead) => (base) => `<h1>${esc(h1)}</h1>
<p class="lead">${esc(lead)}</p>
${calcForm}
${costHead}
${costTable(base)}
${pricingHead}
${pricingTable(base)}
${priceNotes()}`

const calcScriptsFor = (list) => (base) => `<script type="application/json" id="models-data">${JSON.stringify(list.map((m) => (LONG_PROMPT[m.slug] ? { ...m, longPrompt: LONG_PROMPT[m.slug] } : m))).replace(/</g, '\\u003c')}</script>
<script src="${base}vendor/gpt-tokenizer-o200k_base.js" defer></script>
<script src="${base}assets/app.js" defer></script>`
const calcScripts = calcScriptsFor(listed)

const calcPages = [
  ['token-calculator', 'Token Calculator — count tokens for GPT, Claude, Gemini | TokenPriceDB', 'Token calculator',
    'Paste text to count its tokens, then see the cost on every major LLM API.'],
  ['token-cost-calculator', 'Token Cost Calculator — LLM API cost per request | TokenPriceDB', 'Token cost calculator',
    'Enter input and output tokens to get the cost per request on every major LLM API.'],
]
for (const [path, title, h1, lead] of calcPages) page(path, title, lead, calculator(h1, lead), { scripts: calcScripts })

// ---------- /llm-cost-calculator/ and /openrouter-alternatives/ ----------
page('llm-cost-calculator', 'LLM Cost Calculator — price a prompt on every major LLM API | TokenPriceDB',
  'LLM cost calculator: paste a prompt or enter token counts to see the cost per request on each model. Every price row shows its source link and the date it was checked.',
  (base) => `<h1>LLM cost calculator</h1>
<p class="lead">Paste a prompt or enter token counts to see what one request costs on ${listed.length} LLM API models. Every price row links to its source and shows the date it was last checked.</p>
<h2>Price a prompt</h2>
${calcForm}
${costHead}
${costTable(base)}
<h2>Per-model prices behind the calculator (USD per 1M tokens)</h2>
<p class="muted">${listed.length} models across ${providers.join(', ')}. The Checked column is the date each row was last compared with its source; open the source link to confirm a price before you budget on it. Rows marked * have a note under the table (an announced end date, a peak and off-peak rate, or a long-context tier); the calculator uses the price shown in the row.</p>
${pricingTable(base)}
${priceNotes()}
<h2>How the cost is calculated</h2>
<p>Cost = input tokens ÷ 1,000,000 × input price + output tokens ÷ 1,000,000 × output price. Prices are standard pay-as-you-go list prices; batch, priority and long-context tiers are not included.</p>
<p>Token counts from pasted text use the o200k_base encoding. They are exact only for the OpenAI models labeled "exact" and an estimate for every other model, because each provider uses its own tokenizer.</p>
<p>${models.length - listed.length} models from the full database are left out of the tables because their providers have deprecated or retired them and their stored prices could not be confirmed on the providers' own pages.</p>
<p><a href="${base}openrouter-alternatives/">Compare OpenRouter with direct APIs and other gateways</a> · <a href="${base}compare/cheapest-llm-api/">Models ranked by blended cost</a> · <a href="${base}price-changes/">Price-change log</a></p>`,
  { scripts: calcScripts })

// Fees and direct list prices below were read on each vendor's own page on FEES_CHECKED.
const FEES_CHECKED = '2026-11-22'
const EX = models.find((m) => m.slug === 'gpt-6-2-sol') // example model for the same-workload comparison
const exList = EX.inputPer1M + EX.outputPer1M // 1M input + 1M output tokens at list price
const OPENAI_PRICING = 'https://openai.com/api/pricing/'
const ROUTES = [
  { name: 'OpenAI API (direct)', kind: 'Direct provider API', fee: 0, feeText: 'None: you pay the list price', feeUrl: OPENAI_PRICING,
    what: 'The model maker\'s own API. Each provider (OpenAI, Anthropic, Google, xAI and others) has its own key, SDK and invoice.',
    fits: 'Teams that use one or two providers and want list prices, first-party rate limits and features without a middle layer.' },
  { name: 'OpenRouter (Standard)', kind: 'Hosted aggregator', fee: 0.055, feeText: '5.5% platform fee, charged when you buy credits', feeUrl: 'https://openrouter.ai/pricing',
    what: 'One API key and one credit balance for models from many providers. Inference is billed at the provider\'s list price; the fee is added when you buy credits.',
    fits: 'Prototypes and products that switch between many models and want one bill.' },
  { name: 'OpenRouter (Business)', kind: 'Hosted aggregator', fee: 0.08, feeText: '8% platform fee, charged when you buy credits', feeUrl: 'https://openrouter.ai/pricing',
    what: 'The same catalog and token prices as Standard, with in-region routing and more workspaces. The only billing difference is the fee on credit purchases.',
    fits: 'Teams that need the Business features and accept the higher fee on credits.' },
  { name: 'Vercel AI Gateway', kind: 'Hosted gateway', fee: 0, feeText: 'No markup and no platform fee on tokens; payment processing fees may apply', feeUrl: 'https://vercel.com/docs/ai-gateway/pricing',
    what: 'A gateway inside the Vercel platform, billed from prepaid AI Gateway Credits at provider list rates. Optional add-ons such as regional endpoints are charged separately.',
    fits: 'Teams already deploying on Vercel that want one balance for several providers.' },
  { name: 'Cloudflare AI Gateway (Unified Billing)', kind: 'Hosted gateway', fee: 0.05, feeText: '5% fee on credits bought through Unified Billing', feeUrl: 'https://developers.cloudflare.com/ai-gateway/reference/pricing/',
    what: 'A proxy in front of provider APIs with analytics, caching and rate limiting. Core features are free with your own provider keys; Unified Billing adds one Cloudflare bill.',
    fits: 'Teams already on Cloudflare that want caching and logs in front of their provider keys.' },
  { name: 'Requesty', kind: 'Hosted aggregator', fee: 0.05, feeText: '5% on model cost', feeUrl: 'https://www.requesty.ai/pricing',
    what: 'A hosted router with pay-as-you-go billing: you pay what your application spends on models plus a percentage.',
    fits: 'Teams that want a hosted router with usage-based billing and no credit-purchase step.' },
  { name: 'LiteLLM (self-hosted)', kind: 'Open-source gateway', fee: 0, feeText: 'No gateway fee in this example; you pay providers with your own keys and run the servers', feeUrl: 'https://docs.litellm.ai/docs/', extra: ' + your hosting',
    what: 'An open-source library and self-hosted proxy that exposes 100+ LLMs in the OpenAI format, with virtual keys and cost tracking.',
    fits: 'Platform teams that want the gateway inside their own infrastructure and can operate it.' },
]
const routeTotal = (r) => exList * (1 + r.fee)
// Direct list prices read on each provider's own pricing page; `slug` ties each one to our stored row.
const DIRECT = [
  { slug: 'gpt-6-2-sol', input: 2, output: 10, url: OPENAI_PRICING },
  { slug: 'claude-sonnet-5-5', input: 2, output: 10, url: 'https://docs.anthropic.com/en/docs/about-claude/pricing' },
  { slug: 'gemini-4-neon', input: 3, output: 15, url: 'https://ai.google.dev/gemini-api/docs/pricing' },
  { slug: 'grok-4-7', input: 2, output: 6, url: 'https://docs.x.ai/docs/models' },
].map((d) => ({ ...d, m: models.find((m) => m.slug === d.slug) }))

page('openrouter-alternatives', 'OpenRouter Alternatives — direct APIs and gateways compared on the same workload | TokenPriceDB',
  'OpenRouter alternatives compared on one workload: what each option is, who it fits, and what 1M input + 1M output tokens of the same model costs with each published fee. Every price links to its source.',
  (base) => `<h1>OpenRouter alternatives</h1>
<p class="lead">OpenRouter gives you one key for many models. The alternatives are the providers' own APIs, other hosted gateways, and a gateway you host yourself. This page shows what each one is, who it fits, and what the same workload costs on each, with a source link and checked date on every price.</p>
<h2>Same model, same tokens: what each route costs</h2>
<p class="muted">Example workload: 1,000,000 input + 1,000,000 output tokens of ${esc(EX.model)}. List price ${price(EX.inputPer1M)} input + ${price(EX.outputPer1M)} output per 1M tokens = ${usd(exList)} (<a href="${base}models/${EX.slug}/">our price row</a>, ${src(EX.sourceUrl)}, checked ${EX.checkedDate}; ${src(OPENAI_PRICING, 'OpenAI pricing page')}, checked ${FEES_CHECKED}). Each total is that list price plus the fee the vendor publishes. It is arithmetic on published numbers, not a quote: confirm the model is offered and the fee applies to your plan on the linked page.</p>
<div class="table-wrap"><table class="sortable">
<thead><tr><th>Route</th><th>Type</th><th>Published fee</th><th>Arithmetic</th><th class="num">Total</th><th>Fee source</th><th>Checked</th></tr></thead>
<tbody>
${ROUTES.map((r) => `<tr><td data-v="${esc(r.name)}">${esc(r.name)}</td><td data-v="${esc(r.kind)}">${esc(r.kind)}</td><td class="wrap" data-v="${r.fee}">${esc(r.feeText)}</td><td class="arith" data-v="${routeTotal(r)}">${usd(exList)}${r.fee ? ` + ${+(r.fee * 100).toFixed(1)}% × ${usd(exList)}` : ''}${r.extra || ''}</td><td class="num" data-v="${routeTotal(r)}"><strong>${usd(routeTotal(r))}</strong>${r.extra || ''}</td><td data-v="${esc(r.feeUrl)}">${src(r.feeUrl)}</td><td data-v="${FEES_CHECKED}">${FEES_CHECKED}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="muted">Fees can change the total more than the route does: a percentage fee grows with spend, and a self-hosted gateway adds server and engineering cost that is not in this table.</p>
<p><a href="${base}token-calculator/?in=1000000&amp;out=1000000">Open this workload in the token calculator</a> to see 1M input + 1M output tokens priced on every model, or <a href="${base}llm-cost-calculator/">price your own prompt</a>.</p>
<h2>What each alternative is and who it fits</h2>
<div class="alts">
${ROUTES.filter((r) => r.name !== 'OpenRouter (Business)').map((r) => `<div class="card"><h3>${esc(r.name.replace(' (Standard)', '').replace('OpenAI API (direct)', 'Direct provider APIs'))}</h3><p class="k">${esc(r.kind)}</p><p>${esc(r.what)}</p><p><strong>Fits:</strong> ${esc(r.fits)}</p><p class="k">${src(r.feeUrl, 'Pricing source')} · checked ${FEES_CHECKED}</p></div>`).join('\n')}
</div>
<h2>Going direct: provider list price next to the price listed on OpenRouter</h2>
<p class="muted">Four models whose list price we read on the provider's own pricing page on ${FEES_CHECKED}, next to the row in our database (sourced from the model's OpenRouter page). Cost is for 1M input + 1M output tokens, before any gateway fee.</p>
<div class="table-wrap"><table class="sortable">
<thead><tr><th>Provider</th><th>Model</th><th class="num">Direct input / 1M</th><th class="num">Direct output / 1M</th><th class="num">1M in + 1M out</th><th>Provider source</th><th>Checked</th><th class="num">Listed on OpenRouter (in / out)</th><th>Source</th><th>Checked</th></tr></thead>
<tbody>
${DIRECT.map((d) => `<tr><td data-v="${esc(d.m.provider)}">${esc(d.m.provider)}</td><td data-v="${esc(d.m.model)}"><a href="${base}models/${d.slug}/">${esc(d.m.model)}</a></td><td class="num" data-v="${d.input}">${price(d.input)}</td><td class="num" data-v="${d.output}">${price(d.output)}</td><td class="num" data-v="${d.input + d.output}"><strong>${usd(d.input + d.output)}</strong></td><td data-v="${esc(d.url)}">${src(d.url)}</td><td data-v="${FEES_CHECKED}">${FEES_CHECKED}</td><td class="num" data-v="${d.m.inputPer1M + d.m.outputPer1M}">${price(d.m.inputPer1M)} / ${price(d.m.outputPer1M)}</td><td data-v="${esc(d.m.sourceUrl)}">${src(d.m.sourceUrl)}</td><td data-v="${d.m.checkedDate}">${d.m.checkedDate}</td></tr>`).join('\n')}
</tbody></table></div>
<h2>How to choose</h2>
<p>Start from how many providers you call. With one or two, the direct APIs keep list prices and first-party limits. With many, a gateway trades a fee or an operations burden for one key and one bill. Check three things on the vendor's page before switching: where the fee is charged (credits, requests or usage), whether your own provider keys are supported, and whether the models you use are in the catalog.</p>
<p><a href="${base}llm-cost-calculator/">LLM cost calculator</a> · <a href="${base}compare/cheapest-llm-api/">Models ranked by blended cost</a> · <a href="${base}price-changes/">Price-change log</a></p>`,
  { scripts: (base) => `<script src="${base}assets/app.js" defer></script>` })

// ---------- /models/<slug>/ ----------
const TASKS = [
  { name: 'Chat reply', input: 1000, cached: 0, output: 300 },
  { name: 'Summarize a long document', input: 20000, cached: 0, output: 1000 },
  { name: 'Coding agent step (cached context)', input: 5000, cached: 40000, output: 2000 },
]
const taskCost = (m, t) => (t.input / 1e6) * m.inputPer1M + (t.cached / 1e6) * m.cachedInputPer1M + (t.output / 1e6) * m.outputPer1M
const taskArith = (m, t) => [
  `${num(t.input)} ÷ 1,000,000 × ${price(m.inputPer1M)}`,
  t.cached ? `${num(t.cached)} ÷ 1,000,000 × ${price(m.cachedInputPer1M)}` : null,
  `${num(t.output)} ÷ 1,000,000 × ${price(m.outputPer1M)}`,
].filter(Boolean).join(' + ') + ` = ${usd(taskCost(m, t))}`

rmSync(join(root, 'models'), { recursive: true, force: true })
for (const m of models) {
  page(`models/${m.slug}`, `${m.model} API pricing — cost per 1M tokens | TokenPriceDB`,
    `${m.provider} ${m.model} API pricing: ${price(m.inputPer1M)} input / ${price(m.outputPer1M)} output per 1M tokens, with worked cost examples.`,
    (base) => `<h1>${esc(m.model)} API pricing</h1>
<p class="lead">${esc(m.provider)} · checked ${m.checkedDate} · <a href="${esc(m.sourceUrl)}" rel="nofollow noopener">source</a></p>${HELD_BACK[m.slug] ? `\n<p><strong>Not in the pricing tables.</strong> ${noteLine(HELD_BACK[m.slug])} The price below was last seen on the linked source on ${m.checkedDate} and is not confirmed on ${esc(m.provider)}\u2019s own pages.</p>` : ''}${PRICE_NOTES[m.slug] ? `\n<p><strong>Price note.</strong> ${noteLine(PRICE_NOTES[m.slug])}</p>` : ''}
<div class="cards">
<div class="card"><div class="k">Input / 1M tokens</div><div class="v">${price(m.inputPer1M)}</div></div>
<div class="card"><div class="k">Output / 1M tokens</div><div class="v">${price(m.outputPer1M)}</div></div>
<div class="card"><div class="k">Cached input / 1M tokens</div><div class="v">${price(m.cachedInputPer1M)}</div></div>
<div class="card"><div class="k">Context window</div><div class="v">${num(m.contextWindow)}</div></div>
<div class="card"><div class="k">Provider</div><div class="v">${esc(m.provider)}</div></div>
</div>
<h2>Cost per typical task</h2>
<p class="muted">Computed from the prices above. The token counts are illustrative task sizes, not measurements.</p>
<div class="table-wrap"><table>
<thead><tr><th>Task</th><th>Tokens</th><th>Arithmetic</th><th class="num">Cost</th></tr></thead>
<tbody>
${TASKS.map((t) => `<tr><td>${t.name}</td><td>${num(t.input)} input${t.cached ? ` + ${num(t.cached)} cached input` : ''} + ${num(t.output)} output</td><td class="arith">${taskArith(m, t)}</td><td class="num"><strong>${usd(taskCost(m, t))}</strong></td></tr>`).join('\n')}
</tbody></table></div>
<p><a href="${base}">← Calculate the cost of your own prompt</a> · <a href="${base}compare/cheapest-llm-api/">Compare with the cheapest LLM APIs</a></p>`)
}

// ---------- /price-changes/ ----------
page('price-changes', 'LLM API price changes log | TokenPriceDB',
  'A sourced log of LLM API launch prices and price changes.',
  (base) => `<h1>LLM API price changes</h1>
<p class="lead">Launch prices and announced changes. Every entry links to the official pricing page it was checked against.</p>
<div class="table-wrap"><table>
<thead><tr><th>Date</th><th>Provider</th><th>Model</th><th>Change</th><th>Source</th><th>Checked</th></tr></thead>
<tbody>
${[...changes].sort((a, b) => b.date.localeCompare(a.date)).map((c) => `<tr><td>${c.date}</td><td>${esc(c.provider)}</td><td>${models.some((m) => m.slug === c.slug) ? `<a href="${base}models/${c.slug}/">${esc(c.model)}</a>` : esc(c.model)}</td><td style="white-space:normal">${esc(c.change)}</td><td><a href="${esc(c.sourceUrl)}" rel="nofollow noopener">source</a></td><td>${c.checkedDate}</td></tr>`).join('\n')}
</tbody></table></div>`)

// ---------- /compare/cheapest-llm-api/ ----------
// Share of tokens per workload; blended $/1M = Σ share × price.
const PROFILES = [
  { id: 'chat', name: 'Chat', input: 0.75, cached: 0, output: 0.25 },
  { id: 'rag', name: 'RAG', input: 0.9, cached: 0, output: 0.1 },
  { id: 'agent', name: 'Coding agent', input: 0.2, cached: 0.7, output: 0.1 },
]
const blended = (m, p) => p.input * m.inputPer1M + p.cached * m.cachedInputPer1M + p.output * m.outputPer1M
const pct = (x) => Math.round(x * 100) + '%'
page('compare/cheapest-llm-api', 'Cheapest LLM API — models ranked by blended cost | TokenPriceDB',
  'LLM APIs ranked by blended cost per 1M tokens for chat, RAG and coding-agent workloads.',
  (base) => `<h1>Cheapest LLM API</h1>
<p class="lead">${listed.length} models ranked by blended cost per 1M tokens for three workload profiles. Every number is computed from the pricing table.</p>
${PROFILES.map((p) => `<h2 id="${p.id}">${p.name}: ${pct(p.input)} input${p.cached ? `, ${pct(p.cached)} cached input` : ''}, ${pct(p.output)} output</h2>
<p class="muted">Blended cost = ${p.input} × input price${p.cached ? ` + ${p.cached} × cached input price` : ''} + ${p.output} × output price. The token mix is an assumption for this profile.</p>
<div class="table-wrap"><table class="sortable">
<thead><tr><th class="num">Rank</th><th>Provider</th><th>Model</th><th class="num">Blended / 1M</th><th>Arithmetic</th></tr></thead>
<tbody>
${[...listed].sort((a, b) => blended(a, p) - blended(b, p)).map((m, i) => `<tr><td class="num" data-v="${i + 1}">${i + 1}</td><td data-v="${esc(m.provider)}">${esc(m.provider)}</td><td data-v="${esc(m.model)}"><a href="${base}models/${m.slug}/">${esc(m.model)}</a></td><td class="num" data-v="${blended(m, p)}"><strong>${usd(blended(m, p))}</strong></td><td class="arith" data-v="${blended(m, p)}">${p.input} × ${price(m.inputPer1M)}${p.cached ? ` + ${p.cached} × ${price(m.cachedInputPer1M)}` : ''} + ${p.output} × ${price(m.outputPer1M)}</td></tr>`).join('\n')}
</tbody></table></div>`).join('\n')}
<p><a href="${base}">← Calculate the cost of your own prompt</a></p>`,
  { scripts: (base) => `<script src="${base}assets/app.js" defer></script>` })

// ---------- / (homepage) ----------
// Same calculator markup and hooks as the landing pages; only the layout around it differs.
const provClass = (p) => 'prov-' + p.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const range = (xs) => { const lo = Math.min(...xs), hi = Math.max(...xs); return lo === hi ? price(lo) : `${price(lo)} – ${price(hi)}` }
const familyRange = (xs) => `<span class="k-v">${range(xs)} <span class="unit">/ 1M</span></span>`
const IMG = {
  hero: { file: 'llm-api-token-price-database.webp', w: 1536, h: 864, alt: 'LLM API token price database: token streams flowing into one pricing database' },
  compare: { file: 'cheapest-llm-api-price-comparison.webp', w: 1200, h: 675, alt: 'Comparing LLM API prices to find the cheapest model per million tokens' },
  changes: { file: 'llm-api-price-change-alerts.webp', w: 1200, h: 600, alt: 'LLM API price change history shown as a trend line with an alert bell' },
}
const HOME_LEAD = 'Count the tokens in a prompt and compare what it costs on every major LLM API.'
const chat = PROFILES[0]
const latest = [...changes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
page('', 'TokenPriceDB — LLM API Token & Cost Calculator', HOME_LEAD, (base) => `<section class="hero band-dark">
<div class="hero-copy">
<p class="eyebrow">LLM API pricing database</p>
<h1>LLM API token &amp; cost calculator</h1>
<p class="lead">${esc(HOME_LEAD)}</p>
<p class="cta"><a class="btn btn-primary" href="#calculator">Open the calculator</a><a class="btn btn-ghost" href="#pricing">Browse all ${listed.length} prices</a></p>
</div>
<a class="hero-art" href="#calculator"><img src="${base}assets/img/${IMG.hero.file}" alt="${IMG.hero.alt}" width="${IMG.hero.w}" height="${IMG.hero.h}" fetchpriority="high"></a>
<dl class="stats">
<div><dt>Models tracked</dt><dd>${listed.length}</dd></div>
<div><dt>Providers</dt><dd>${providers.length}</dd></div>
<div><dt>Source-linked prices</dt><dd>${listed.filter((m) => m.sourceUrl).length} / ${listed.length}</dd></div>
<div><dt>Changes logged</dt><dd>${changes.length}</dd></div>
<div><dt>Last checked</dt><dd><time datetime="${checked}">${prettyDate(checked)}</time></dd></div>
</dl>
</section>
<section class="band band-light" id="calculator">
<h2 class="section-title">Price a prompt</h2>
<div class="panel">
${calcForm}
</div>
${costHead}
<p class="muted table-note">Token counts read "as entered" until you paste a prompt.</p>
${costTable(base)}
</section>
<section class="band band-dark promo">
<div class="promo-copy">
<p class="eyebrow">Compare</p>
<h2>Which LLM API is cheapest for your workload?</h2>
<p>All ${listed.length} models ranked by blended cost per 1M tokens for chat, RAG and coding-agent workloads, with the arithmetic shown.</p>
<p class="cta"><a class="btn btn-primary" href="${base}compare/cheapest-llm-api/">See the full ranking</a></p>
</div>
<div class="promo-data">
<img class="promo-art" src="${base}assets/img/${IMG.compare.file}" alt="${IMG.compare.alt}" width="${IMG.compare.w}" height="${IMG.compare.h}" loading="lazy">
<ol class="rank">
${[...listed].sort((a, b) => blended(a, chat) - blended(b, chat)).slice(0, 3).map((m) => `<li><span class="prov ${provClass(m.provider)}">${esc(m.provider)}</span> <a href="${base}models/${m.slug}/">${esc(m.model)}</a> <span class="rank-v">${usd(blended(m, chat))} / 1M</span></li>`).join('\n')}
</ol>
<p class="muted">Cheapest three for the chat profile (${pct(chat.input)} input, ${pct(chat.output)} output), computed from the pricing table.</p>
</div>
</section>
<section class="band band-soft" id="pricing">
${pricingHead}
<div class="families">
${providers.map((p) => { const ms = listed.filter((m) => m.provider === p); return `<div class="family ${provClass(p)}"><div class="family-head">${esc(p)}</div><div class="family-body"><div class="v">${ms.length} <span>models</span></div><div class="k"><span>Input</span> ${familyRange(ms.map((m) => m.inputPer1M))}</div><div class="k"><span>Output</span> ${familyRange(ms.map((m) => m.outputPer1M))}</div></div></div>` }).join('\n')}
</div>
${pricingTable(base)}
${priceNotes()}
</section>
<section class="band band-light promo">
<div class="promo-copy">
<p class="eyebrow">Price changes</p>
<h2>See when an LLM API price changes</h2>
<p>A sourced log of launch prices and announced changes. Every entry links to the pricing page it was checked against.</p>
<p class="cta"><a class="btn btn-dark" href="${base}price-changes/">Open the price-change log</a></p>
</div>
<div class="promo-data">
<img class="promo-art" src="${base}assets/img/${IMG.changes.file}" alt="${IMG.changes.alt}" width="${IMG.changes.w}" height="${IMG.changes.h}" loading="lazy">
<ul class="changes">
${latest.map((c) => `<li><time datetime="${c.date}">${c.date}</time> <span class="prov ${provClass(c.provider)}">${esc(c.provider)}</span> ${models.some((m) => m.slug === c.slug) ? `<a href="${base}models/${c.slug}/">${esc(c.model)}</a>` : esc(c.model)}<span class="change">${esc(c.change)}</span></li>`).join('\n')}
</ul>
</div>
</section>`, { scripts: calcScripts, head: (base) => `<meta property="og:image" content="${SITE}/assets/img/${IMG.hero.file}">
<link rel="stylesheet" href="${base}assets/home.css">`, bodyClass: 'home', footer: (base) => `<nav class="foot-nav" aria-label="Footer">
<a class="brand" href="${base}">TokenPriceDB</a>
<a href="${base}token-calculator/">Token calculator</a>
<a href="${base}token-cost-calculator/">Token cost calculator</a>
<a href="${base}compare/cheapest-llm-api/">Cheapest LLM API</a>
<a href="${base}price-changes/">Price changes</a>
</nav>` })

// ---------- /sitemap.xml ----------
// Main pages only: the owner asked to leave the per-model pages out.
const urls = ['', 'token-calculator/', 'token-cost-calculator/', 'llm-cost-calculator/', 'openrouter-alternatives/', 'compare/cheapest-llm-api/', 'price-changes/']
const homeImages = Object.values(IMG).map((i) => `<image:image><image:loc>${SITE}/assets/img/${i.file}</image:loc></image:image>`).join('')
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `<url><loc>${SITE}/${u}</loc>${u === '' ? homeImages : ''}</url>`).join('\n')}
</urlset>
`)
