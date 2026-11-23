import type { Metadata } from "next";

// Imported as-is from https://feefact.com/tiktok-shop-fee-changes/ (fetched November 23, 2026).
// The live page is static HTML; text, table rows and link targets are unchanged, only the markup is this app's.
const description = "A dated log of TikTok Shop fee changes and reported changes, verified against official tables. US referral 6% vs reported 8%, UK/EU 9% — what changed and when.";

export const metadata: Metadata = {
  title: "TikTok Shop Fee Changes — Verified Change Log & Alerts | FeeFact",
  description,
  alternates: { canonical: "https://feefact.com/tiktok-shop-fee-changes/" },
};

const link = "font-semibold text-indigo-700 underline";
const card = "mt-8 rounded-2xl border bg-white p-6 sm:p-8";
const note = "mt-4 text-sm leading-relaxed text-slate-500";

export default function FeeChangesPage() {
  return <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
    <h1 className="text-4xl font-bold tracking-tight">TikTok Shop Fee Change Log</h1>
    <p className="mt-5 text-lg text-slate-600">Every fee change we can verify, dated and labeled: <strong>Official</strong> means it is in TikTok&apos;s published tables; <strong>Reported</strong> means sellers are charged it but the table hasn&apos;t caught up.</p>
    <p className="mt-3 text-sm text-slate-500">Maintained by FeeFact · We re-verify rates monthly · Rates last verified: October 30, 2026</p>
    <p className="mt-6 font-semibold leading-relaxed">The short answer: at the last verification on October 30, 2026, the US published table still lists 6% for most categories (sellers report an effective 8% since August 2026) and UK/EU standard referral is 9%. Every change we verify is logged on this page.</p>

    <div className={card}>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className="py-2 pr-4">Date</th><th scope="col" className="py-2 pr-4">Change</th><th scope="col" className="py-2 text-right">Status</th></tr></thead>
        <tbody>
          <tr className="border-b align-top"><td className="py-2 pr-4">Nov 2026</td><td className="py-2 pr-4">Pre-Order / Made-to-Order opens to all eligible US sellers (no account manager needed). Pre-order items carry a 1.09% service fee on top of the standard referral fee; fulfillment window 3–30 days. The 1.09% rate itself dates to Singapore, December 2025 — the US opening is what is new. See the <a className={link} href="/tiktok-shop-fees/">fee breakdown</a>.</td><td className="py-2 text-right">Official</td></tr>
          <tr className="border-b align-top"><td className="py-2 pr-4">Oct 1 – Dec 31, 2026</td><td className="py-2 pr-4">Seller LIVE Auction referral fee temporarily reduced: 4% for qualifying new auction sellers, 3% for high-value orders from established sellers (jewelry $1,500+, other specified categories $500+); weekly cap of $400,000 in auction sales. Expires December 31, 2026.</td><td className="py-2 text-right">Official</td></tr>
          <tr className="border-b align-top"><td className="py-2 pr-4">Nov 1, 2026</td><td className="py-2 pr-4">FBT rate card updated (new card in effect). Full card on the <a className={link} href="/tiktok-shop-shipping-fees/">shipping fees page</a>.</td><td className="py-2 text-right">Official</td></tr>
          <tr className="border-b align-top"><td className="py-2 pr-4">Oct 2026</td><td className="py-2 pr-4">FeeFact verification: US published table still lists 6% for most categories (5% jewelry/pre-owned, 3% new-seller promo). UK/EU standard 9%.</td><td className="py-2 text-right">Official</td></tr>
          <tr className="align-top"><td className="py-2 pr-4">Aug 2026</td><td className="py-2 pr-4">US sellers widely report an effective referral rate of 8% on settlement lines, above the 6% table rate.</td><td className="py-2 text-right">Reported</td></tr>
        </tbody>
      </table></div>
      <p className={note}>Think a rate changed? The fastest way to know for your account is to <a className={link} href="/tiktok-shop-settlement-checker/">audit your latest settlement</a> — it shows the rate you were actually charged, line by line.</p>
    </div>

    <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white sm:p-8"><strong>Fee-change alerts</strong><p className="mt-2 leading-relaxed">When TikTok changes a rate, we re-verify every number on FeeFact and note it here first. The email alert list opens soon — bookmark this page and check back after each settlement cycle.</p></div>

    <div className={card}>
      <strong>Related FeeFact tools</strong>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <a className="block rounded-xl border p-4 hover:border-slate-900" href="/tiktok-shop-settlement-checker/"><h3 className="font-semibold">Settlement Checker</h3><p className="mt-1 text-sm text-slate-500">Audit your settlement CSV line by line for wrong referral rates.</p></a>
        <a className="block rounded-xl border p-4 hover:border-slate-900" href="/"><h3 className="font-semibold">Profit Calculator</h3><p className="mt-1 text-sm text-slate-500">Stack every fee and see what you keep — per sale and per month.</p></a>
        <a className="block rounded-xl border p-4 hover:border-slate-900" href="/tiktok-shop-referral-fee/"><h3 className="font-semibold">Referral Fee: 6% or 8%?</h3><p className="mt-1 text-sm text-slate-500">Why both numbers circulate, and how to model the gap.</p></a>
      </div>
      <p className={note}>All tools: <a className="underline" href="/">Profit Calculator + Settlement Checker</a> · <a className="underline" href="/tiktok-shop-settlement-checker/">Settlement Checker</a> · <a className="underline" href="/tiktok-shop-fee-calculator-uk/">UK Calculator</a> · <a className="underline" href="/tiktok-shop-fee-calculator-eu/">EU Calculator</a> · <a className="underline" href="/tiktok-shop-fees/">All TikTok Shop Fees</a> · <a className="underline" href="/tiktok-shop-fee-changes/">Fee Change Log</a> · <a className="underline" href="/tiktok-shop-affiliate-commission/">Affiliate Commission</a> · <a className="underline" href="/tiktok-shop-shipping-fees/">Shipping Fees</a></p>
    </div>
  </main>;
}
