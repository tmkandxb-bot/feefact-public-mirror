import type { Metadata } from "next";
import Link from "next/link";
import BatchSkuProfit from "../../components/BatchSkuProfit";
import { fees } from "../../../lib/fees";

export const metadata: Metadata = {
  title: "Batch SKU Profit Calculator for TikTok Shop | FeeFact",
  description: "Paste a batch of SKUs and see referral fee, creator commission, ads, net profit and margin for each one.",
};

export default function BatchSkuProfitPage() {
  return <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">FeeFact Pro prototype</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Batch SKU profit calculator</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">Paste your TikTok Shop SKUs and see what each one keeps after referral fee, creator commission, ads, product cost and shipping.</p>
    <section className="mt-10 rounded-2xl border bg-white p-6 sm:p-8" aria-label="Batch calculator"><BatchSkuProfit /></section>
    <section className="mt-14 max-w-3xl" aria-labelledby="explainer-heading">
      <h2 id="explainer-heading" className="text-2xl font-bold">What each fee is</h2>
      <dl className="mt-6 space-y-5 leading-relaxed text-slate-600">
        <div><dt className="font-semibold text-slate-900">Referral fee</dt><dd>The platform&apos;s cut of the sale: price × referral %.</dd></div>
        <div><dt className="font-semibold text-slate-900">Creator commission</dt><dd>What you pay the creator or affiliate who drove the sale: price × creator %.</dd></div>
        <div><dt className="font-semibold text-slate-900">Ads</dt><dd>Your ad spend attributed to the sale: price × ads %.</dd></div>
        <div><dt className="font-semibold text-slate-900">Total fees, net profit and margin</dt><dd>Total fees = referral fee + creator commission + ads. Net profit = price − total fees − product cost − shipping. Margin = net profit ÷ price.</dd></div>
      </dl>
      <p className="mt-6 leading-relaxed text-slate-600">The rates are the ones you enter. They are not quotes from any platform, so check your own seller account for the rates that apply to you. This is the same calculation as the single-item calculator, run once per row.</p>
      <h3 className="mt-8 font-semibold">Fee pages</h3>
      <ul className="mt-2 list-disc pl-5">{fees.map(fee => <li key={fee.slug}><Link className="font-semibold text-indigo-700 underline" href={`/fees/${fee.slug}`}>{fee.name} fees</Link></li>)}</ul>
    </section>
  </main>;
}
