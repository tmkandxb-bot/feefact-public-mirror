import type { Metadata } from "next";
import Link from "next/link";

// Brought in from https://feefact.com/tiktok-shop-vs-amazon-fees/ as published on November 23, 2026; wording and figures unchanged.
const title = "TikTok Shop vs Amazon Fees: Which Platform Keeps More of Your Sale? (2026) | FeeFact";
const description = "TikTok Shop charges 6–8% referral in the US; Amazon charges around 15% in many popular categories, plus FBA fees. A side-by-side fee comparison for cross-border sellers.";

export const metadata: Metadata = { title, description, alternates: { canonical: "https://feefact.com/tiktok-shop-vs-amazon-fees/" } };

const rows = [
  ["Referral fee, typical categories", "6% published (8% widely reported)", "Varies by category; ~15% in many popular ones (e.g. Home & Kitchen)"],
  ["Creator/affiliate layer", "Optional, set by seller (5–20%+)", "Optional (Associates is buyer-side)"],
  ["Fulfillment program", "FBT, per-unit fees", "FBA, per-unit fees by size/weight"],
  ["Refund admin fee", "20% of referral, capped $5/SKU", "Refund administration fee also applies on many refunds"],
];

const card = "mt-10 rounded-2xl border bg-white p-6 sm:p-8";
const th = "py-3 pr-4 font-medium";
const td = "py-3 pr-4";
const link = "text-indigo-700 underline";

export default function VsAmazonFeesPage() {
  return <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">TikTok Shop fees, made clear</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">TikTok Shop vs Amazon Fees (2026)</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">Same product, two platforms — how much of the sale price does each one keep?</p>
    <p className="mt-3 text-sm text-slate-500">Rates last verified: October 30, 2026</p>
    <p className="mt-8 max-w-3xl rounded-2xl border border-indigo-200 bg-indigo-50 p-6 leading-relaxed"><strong>The short answer: TikTok Shop charges a 6% referral fee on its official US table (many sellers report an effective 8%), while Amazon&apos;s referral fee depends on the category. This page puts the same product through both fee stacks, side by side.</strong></p>

    <div className={card}>
      <div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><td className={th} /><th scope="col" className={th}>TikTok Shop US</th><th scope="col" className={th}>Amazon US</th></tr></thead>
        <tbody>{rows.map(([label, tiktok, amazon]) => <tr key={label} className="border-b align-top last:border-0"><th scope="row" className={th}>{label}</th><td className={td}>{tiktok}</td><td className={td}>{amazon}</td></tr>)}</tbody>
      </table></div>
      <p className="mt-4 text-sm leading-relaxed text-slate-900">The honest summary: TikTok Shop&apos;s platform take is usually lower, but its affiliate commissions stack on top and its traffic depends on content. Amazon&apos;s referral is higher and more predictable, with search-driven demand. Serious sellers model both — start with the free <Link className={link} href="/">TikTok Shop profit calculator</Link>, using your real commission and ad numbers.</p>
    </div>

    <div className={card}>
      <strong>Run your numbers</strong>
      <p className="mt-2 leading-relaxed text-slate-600">The free <Link className={link} href="/">FeeFact calculator</Link> stacks all of these fees, compares 6% vs 8% side by side, and audits your settlement file for wrong rates.</p>
    </div>

    <p className="mt-12 text-sm text-slate-500">FeeFact is an independent tool, not affiliated with TikTok or ByteDance. <Link className={link} href="/">All FeeFact tools</Link></p>
  </main>;
}
