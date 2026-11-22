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

function page(path, title, description, body, { scripts = '', head = '', bodyClass = '' } = {}) {
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
<footer class="site">
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
const pricingTable = (base) => `<div class="table-wrap"><table class="sortable" id="pricing-table">
<thead><tr><th>Provider</th><th>Model</th><th class="num">Input / 1M</th><th class="num">Output / 1M</th><th class="num">Cached input / 1M</th><th class="num">Context window</th><th>Source</th><th>Checked</th></tr></thead>
<tbody>
${models.map((m) => `<tr><td data-v="${esc(m.provider)}">${esc(m.provider)}</td><td data-v="${esc(m.model)}"><a href="${base}models/${m.slug}/">${esc(m.model)}</a></td><td class="num" data-v="${m.inputPer1M}">${price(m.inputPer1M)}</td><td class="num" data-v="${m.outputPer1M}">${price(m.outputPer1M)}</td><td class="num" data-v="${m.cachedInputPer1M}">${price(m.cachedInputPer1M)}</td><td class="num" data-v="${m.contextWindow}">${num(m.contextWindow)}</td><td data-v="${esc(m.sourceUrl)}"><a href="${esc(m.sourceUrl)}" rel="nofollow noopener">source</a></td><td data-v="${m.checkedDate}">${m.checkedDate}</td></tr>`).join('\n')}
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
const providers = [...new Set(models.map((m) => m.provider))]
const pricingHead = `<h2>LLM API pricing table (USD per 1M tokens)</h2>
<p class="muted">${models.length} models across ${providers.join(', ')}.</p>`

const calculator = (h1, lead) => (base) => `<h1>${esc(h1)}</h1>
<p class="lead">${esc(lead)}</p>
${calcForm}
${costHead}
${costTable(base)}
${pricingHead}
${pricingTable(base)}`

const calcScripts = (base) => `<script type="application/json" id="models-data">${JSON.stringify(models).replace(/</g, '\\u003c')}</script>
<script src="${base}vendor/gpt-tokenizer-o200k_base.js" defer></script>
<script src="${base}assets/app.js" defer></script>`

const calcPages = [
  ['token-calculator', 'Token Calculator — count tokens for GPT, Claude, Gemini | TokenPriceDB', 'Token calculator',
    'Paste text to count its tokens, then see the cost on every major LLM API.'],
  ['token-cost-calculator', 'Token Cost Calculator — LLM API cost per request | TokenPriceDB', 'Token cost calculator',
    'Enter input and output tokens to get the cost per request on every major LLM API.'],
]
for (const [path, title, h1, lead] of calcPages) page(path, title, lead, calculator(h1, lead), { scripts: calcScripts })

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
<p class="lead">${esc(m.provider)} · checked ${m.checkedDate} · <a href="${esc(m.sourceUrl)}" rel="nofollow noopener">source</a></p>
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
<p class="lead">${models.length} models ranked by blended cost per 1M tokens for three workload profiles. Every number is computed from the pricing table.</p>
${PROFILES.map((p) => `<h2 id="${p.id}">${p.name}: ${pct(p.input)} input${p.cached ? `, ${pct(p.cached)} cached input` : ''}, ${pct(p.output)} output</h2>
<p class="muted">Blended cost = ${p.input} × input price${p.cached ? ` + ${p.cached} × cached input price` : ''} + ${p.output} × output price. The token mix is an assumption for this profile.</p>
<div class="table-wrap"><table class="sortable">
<thead><tr><th class="num">Rank</th><th>Provider</th><th>Model</th><th class="num">Blended / 1M</th><th>Arithmetic</th></tr></thead>
<tbody>
${[...models].sort((a, b) => blended(a, p) - blended(b, p)).map((m, i) => `<tr><td class="num" data-v="${i + 1}">${i + 1}</td><td data-v="${esc(m.provider)}">${esc(m.provider)}</td><td data-v="${esc(m.model)}"><a href="${base}models/${m.slug}/">${esc(m.model)}</a></td><td class="num" data-v="${blended(m, p)}"><strong>${usd(blended(m, p))}</strong></td><td class="arith" data-v="${blended(m, p)}">${p.input} × ${price(m.inputPer1M)}${p.cached ? ` + ${p.cached} × ${price(m.cachedInputPer1M)}` : ''} + ${p.output} × ${price(m.outputPer1M)}</td></tr>`).join('\n')}
</tbody></table></div>`).join('\n')}
<p><a href="${base}">← Calculate the cost of your own prompt</a></p>`,
  { scripts: (base) => `<script src="${base}assets/app.js" defer></script>` })

// ---------- / (homepage) ----------
// Same calculator markup and hooks as the landing pages; only the layout around it differs.
const provClass = (p) => 'prov-' + p.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const range = (xs) => { const lo = Math.min(...xs), hi = Math.max(...xs); return lo === hi ? price(lo) : `${price(lo)} – ${price(hi)}` }
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
<p class="cta"><a class="btn btn-primary" href="#calculator">Open the calculator</a><a class="btn btn-ghost" href="#pricing">Browse all ${models.length} prices</a></p>
</div>
<a class="hero-art" href="#calculator"><img src="${base}assets/img/${IMG.hero.file}" alt="${IMG.hero.alt}" width="${IMG.hero.w}" height="${IMG.hero.h}" fetchpriority="high"></a>
<dl class="stats">
<div><dt>Models tracked</dt><dd>${models.length}</dd></div>
<div><dt>Providers</dt><dd>${providers.length}</dd></div>
<div><dt>Prices with a source link</dt><dd>${models.filter((m) => m.sourceUrl).length} / ${models.length}</dd></div>
<div><dt>Price-change entries logged</dt><dd>${changes.length}</dd></div>
<div><dt>Last checked</dt><dd>${checked}</dd></div>
</dl>
</section>
<section class="band band-light" id="calculator">
<h2 class="section-title">Token &amp; cost calculator</h2>
<div class="panel">
${calcForm}
</div>
${costHead}
${costTable(base)}
</section>
<section class="band band-dark promo">
<div class="promo-copy">
<p class="eyebrow">Compare</p>
<h2>Which LLM API is cheapest for your workload?</h2>
<p>All ${models.length} models ranked by blended cost per 1M tokens for chat, RAG and coding-agent workloads, with the arithmetic shown.</p>
<p class="cta"><a class="btn btn-primary" href="${base}compare/cheapest-llm-api/">See the full ranking</a></p>
</div>
<div class="promo-data">
<img class="promo-art" src="${base}assets/img/${IMG.compare.file}" alt="${IMG.compare.alt}" width="${IMG.compare.w}" height="${IMG.compare.h}" loading="lazy">
<ol class="rank">
${[...models].sort((a, b) => blended(a, chat) - blended(b, chat)).slice(0, 3).map((m) => `<li><span class="prov ${provClass(m.provider)}">${esc(m.provider)}</span> <a href="${base}models/${m.slug}/">${esc(m.model)}</a> <span class="rank-v">${usd(blended(m, chat))} / 1M</span></li>`).join('\n')}
</ol>
<p class="muted">Cheapest three for the chat profile (${pct(chat.input)} input, ${pct(chat.output)} output), computed from the pricing table.</p>
</div>
</section>
<section class="band band-soft" id="pricing">
${pricingHead}
<div class="families">
${providers.map((p) => { const ms = models.filter((m) => m.provider === p); return `<div class="family ${provClass(p)}"><div class="family-head">${esc(p)}</div><div class="family-body"><div class="v">${ms.length} <span>models</span></div><div class="k">Input ${range(ms.map((m) => m.inputPer1M))} / 1M</div><div class="k">Output ${range(ms.map((m) => m.outputPer1M))} / 1M</div></div></div>` }).join('\n')}
</div>
${pricingTable(base)}
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
<link rel="stylesheet" href="${base}assets/home.css">`, bodyClass: 'home' })

// ---------- /sitemap.xml ----------
// Main pages only: the owner asked to leave the per-model pages out.
const urls = ['', 'token-calculator/', 'token-cost-calculator/', 'compare/cheapest-llm-api/', 'price-changes/']
const homeImages = Object.values(IMG).map((i) => `<image:image><image:loc>${SITE}/assets/img/${i.file}</image:loc></image:image>`).join('')
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `<url><loc>${SITE}/${u}</loc>${u === '' ? homeImages : ''}</url>`).join('\n')}
</urlset>
`)
