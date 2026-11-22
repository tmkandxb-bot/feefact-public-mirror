Framework: Next.js 14 App Router + TypeScript + Tailwind CSS
- /app/fees/[slug]/page.tsx - dynamic fee pages, generateStaticParams() for 120 pages
- /app/components/Calculator.tsx - client component, useState + useMemo for live calc
- /lib/fees.ts - single source of truth, all fees as typed JSON, no hardcoded numbers in UI
- /lib/calc.ts - calcNetProfit() - pure function, unit tested

State:
- Calculator: local useState, URL search params sync (?sale=35) so shareable
- No Redux, no backend DB for v1. Fee data is static JSON in repo, versioned in git
- Settlement Checker: FileReader API, parse CSV client-side, never uploads to server

CI / Deployment:
- GitHub Actions on every PR: npm ci -> npm run lint -> npm run test -> npm run build
- If build fails, Chief blocks merge. That's the gate.
- Deploy: Vercel, main branch auto-deploy to feefact.com, preview URL per PR
- Perf gate: LCP < 2.5s, checked in CI with Lighthouse

Real example in repo: src/calculator.js is the exact same logic as /lib/calc.ts on live site.
$35 sale, referral 6% + creator 5% + ads 15% + COGS $8 + shipping $3.5 = net $14.40

Repo: https://github.com/tmkandxb-bot/feefact-public-mirror
Live: https://feefact.com

This is a real Next.js codebase, not a landing page.
