import type { Metadata } from "next";
import Link from "next/link";
import { affiliate, calcAffiliateStack, categoryBenchmarks } from "../../lib/affiliate";
import { formatMoney } from "../../lib/fees";

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;
const money = (amount: number) => formatMoney(amount, affiliate.currency);
const sale = affiliate.exampleSale;
const referral = percent(affiliate.referralRate);
const example = calcAffiliateStack(sale, affiliate.exampleCommission);
const reported = calcAffiliateStack(sale, affiliate.exampleCommission, affiliate.reportedReferralRate);
const noCreator = calcAffiliateStack(sale, 0);
const { cogs, shipping, ads, commissions } = affiliate.breakEven;
const margin = sale - cogs;
const room = margin - noCreator.referral - shipping - ads;
const netAt = (rate: number) => room - calcAffiliateStack(sale, rate).commission;
const signed = (amount: number) => (amount < 0 ? `−${money(-amount)}` : money(amount));

export const metadata: Metadata = {
  title: "TikTok Shop Affiliate Commission Explained: How It Stacks on the Referral Fee | FeeFact",
  description: "Affiliate commission on TikTok Shop is a percentage each seller sets, and it stacks on the referral fee. Worked examples, a commission ladder, and seller-set example ranges by category.",
};

const faqs = [
  { question: "Is affiliate commission charged on top of the referral fee?", answer: "Yes. They are separate deductions from the same order: the referral fee goes to TikTok Shop, the commission goes to the creator who drove the sale. On a creator-driven order you pay both." },
  { question: "Who sets the affiliate commission rate?", answer: "You do. TikTok Shop does not publish a standard affiliate rate. You set the percentage in Seller Center and you can change it. Any rate you see mentioned elsewhere, including the category ranges on this page, is a seller's choice, not a platform fee." },
  { question: "Does TikTok Shop set a commission rate for my category?", answer: "No. There is no official affiliate commission rate for any category. The category table on this page shows seller-set example ranges to help you think about your own number; none of them is a TikTok Shop rate." },
  { question: "What commission should I offer?", answer: `There is no universal right number. Start from your margin: subtract the referral fee (${referral} official US baseline) and your per-order shipping and ad costs from your gross margin, and offer less than what remains.` },
  { question: "Do I pay commission on every order?", answer: "No, only on orders attributed to a creator's affiliate promotion. Orders from your own videos, your shop page or ads carry the referral fee but no creator commission." },
];
const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

const th = "py-3 pr-4";
const td = "py-4 pr-4 align-top";

export default function AffiliateCommissionPage() {
  return <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">TikTok Shop fees, made clear</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">TikTok Shop affiliate commission, explained</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">The referral fee is the percentage TikTok sets. The affiliate commission is the percentage you set, and both come out of the same order.</p>
    <p className="mt-3 text-sm text-slate-500">Referral rate last verified: {affiliate.verified}. US referral baseline: {referral} official table rate.</p>

    <section className="mt-10 max-w-3xl rounded-2xl border bg-white p-6 sm:p-8" aria-labelledby="short-answer-heading">
      <h2 id="short-answer-heading" className="text-xl font-semibold">The short answer</h2>
      <p className="mt-3 leading-relaxed text-slate-600">Affiliate commission is a percentage you set yourself, and it stacks on top of TikTok&apos;s referral fee. On a {money(sale)} sale at the official {referral} referral rate with an example {percent(affiliate.exampleCommission)} commission, the two together take {percent(example.totalRate)} of the sale before any other cost.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="owners-heading">
      <h2 id="owners-heading" className="text-2xl font-bold">Two fees, two different owners</h2>
      <p className="mt-4 leading-relaxed text-slate-600">The <strong>referral fee</strong> is TikTok Shop&apos;s platform fee. In the US, TikTok&apos;s published table lists {referral} for most categories (many sellers report an effective {percent(affiliate.reportedReferralRate)} since August 2026). You cannot negotiate it and it applies to every order.</p>
      <p className="mt-4 leading-relaxed text-slate-600">The <strong>affiliate (creator) commission</strong> is different: you choose the percentage when you list a product for creator promotion. It is only charged when a creator&apos;s video, LIVE or product link actually drives the sale. There is no platform-published standard rate. The number is yours.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="stacking-heading">
      <h2 id="stacking-heading" className="text-2xl font-bold">How the stacking works: a worked example</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Both percentages are taken from the same order, so they add up. Say you sell a product for {money(sale)} (example price) and you have set a {percent(affiliate.exampleCommission)} affiliate commission (example rate; you set your own):</p>
      <table className="mt-6 w-full text-left text-sm">
        <caption className="sr-only">Worked example of referral fee plus a seller-set example commission on a {money(sale)} sale</caption>
        <tbody>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">Sale price</th><td className="text-right">{money(sale)}</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">− Referral fee ({referral}, verified US baseline)</th><td className="text-right">{money(example.referral)}</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">− Affiliate commission ({percent(affiliate.exampleCommission)}, your setting, example)</th><td className="text-right">{money(example.commission)}</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">Platform + creator take</th><td className="text-right">{money(example.total)} ({percent(example.totalRate)} of the price)</td></tr>
          <tr><th scope="row" className="py-3 font-semibold">Paid out to you, before product &amp; shipping costs</th><td className="text-right font-semibold">{money(example.payout)}</td></tr>
        </tbody>
      </table>
      <p className="mt-6 leading-relaxed text-slate-600">The same {money(sale)} order sold without a creator loses only the {money(noCreator.referral)} referral fee, so you would be paid {money(noCreator.payout)}. The creator-driven order pays you {money(example.commission)} less. If your settlement reflects the widely reported {percent(affiliate.reportedReferralRate)} referral rate instead of {referral}, the same example takes {money(reported.referral)} + {money(reported.commission)} = {money(reported.total)} off the top ({percent(reported.totalRate)}) and pays out {money(reported.payout)}.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="ladder-heading">
      <h2 id="ladder-heading" className="text-2xl font-bold">Commission ladder: what each rate costs on a {money(sale)} sale</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Same {money(sale)} sale, same verified {referral} referral fee ({money(example.referral)}). Only the commission you set changes. Every commission below is an example rate you choose, not a platform fee.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm">
        <caption className="mb-3 text-left font-semibold">Seller-set example commissions on a {money(sale)} sale</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Commission you set (example)</th><th scope="col" className={th}>Commission $</th><th scope="col" className={th}>Referral + commission</th><th scope="col" className="py-3 text-right">Paid to you*</th></tr></thead>
        <tbody>{affiliate.ladder.map(rate => {
          const row = calcAffiliateStack(sale, rate);
          return <tr key={rate} className="border-b last:border-0"><td className={td}>{percent(rate)}</td><td className={td}>{money(row.commission)}</td><td className={td}>{money(row.total)} ({percent(row.totalRate)})</td><td className="py-4 text-right align-top font-semibold">{money(row.payout)}</td></tr>;
        })}</tbody>
      </table></div>
      <p className="mt-3 text-sm text-slate-500">*Before product and shipping costs.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="category-heading">
      <h2 id="category-heading" className="text-2xl font-bold">Typical commission ranges by category (seller-set examples)</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Sellers often ask what rate to set for their category. TikTok Shop does not set one: there is no official affiliate commission rate for any category. The ranges below are <strong>common seller-set ranges (examples)</strong>, meaning the kind of commission sellers in each category choose to offer creators. They are not TikTok Shop rates and not platform fees. The only platform fee on this page is the {referral} referral fee.</p>
      <p className="mt-4 leading-relaxed text-slate-600">The bands are deliberately wide and are built from the same example rates as the ladder above. They are illustrations to reason from, not survey data, and the notes explain the reasoning (margin, return rate, creator demand) rather than quote statistics. The dollar column reuses the {money(sale)} example sale.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm">
        <caption className="mb-3 text-left font-semibold">Seller-set example commission ranges by category. Each seller chooses their own rate; these are not TikTok Shop rates.</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Category</th><th scope="col" className={th}>Seller-set example range</th><th scope="col" className={th}>Commission on a {money(sale)} sale</th><th scope="col" className="py-3">Why sellers in this category tend to sit there</th></tr></thead>
        <tbody>{categoryBenchmarks.map(row => <tr key={row.category} className="border-b last:border-0">
          <th scope="row" className={`${td} font-semibold`}>{row.category}</th>
          <td className={`${td} whitespace-nowrap`}>{percent(row.low)} to {percent(row.high)} (example)</td>
          <td className={`${td} whitespace-nowrap`}>{money(calcAffiliateStack(sale, row.low).commission)} to {money(calcAffiliateStack(sale, row.high).commission)}</td>
          <td className="py-4 align-top text-slate-600">{row.note}</td>
        </tr>)}</tbody>
      </table></div>
      <p className="mt-4 leading-relaxed text-slate-600">Use a band as a starting point for your own maths, not as a target. Two sellers in the same category can have very different margins, and the right commission for your product is whatever your margin can afford after the referral fee and your real costs. The next section shows how to work that out.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="break-even-heading">
      <h2 id="break-even-heading" className="text-2xl font-bold">Your break-even commission, worked out</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Take the same {money(sale)} product with a {percent(margin / sale)} gross margin, which is {money(margin)} of room before fees. Product cost is {money(cogs)}, and the example per-order costs are shipping {money(shipping)} and ads {money(ads)} (both seller-set examples, not platform fees):</p>
      <table className="mt-6 w-full text-left text-sm">
        <caption className="sr-only">Break-even commission on a {money(sale)} example product</caption>
        <tbody>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">Gross margin ({money(sale)} price − {money(cogs)} product cost)</th><td className="text-right">{money(margin)}</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">− Referral fee ({referral}, verified US baseline)</th><td className="text-right">{money(noCreator.referral)}</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">− Shipping (example)</th><td className="text-right">{money(shipping)}</td></tr>
          <tr className="border-b"><th scope="row" className="py-3 font-normal">− Ads (example)</th><td className="text-right">{money(ads)}</td></tr>
          <tr><th scope="row" className="py-3 font-semibold">Most commission this product can afford</th><td className="text-right font-semibold">{money(room)} ({percent(room / sale)} of {money(sale)})</td></tr>
        </tbody>
      </table>
      <p className="mt-6 leading-relaxed text-slate-600">At a {percent(commissions[1])} example commission this product nets {signed(netAt(commissions[1]))} per creator-driven order; at {percent(commissions[0])} it still nets {signed(netAt(commissions[0]))}. Without any creator it nets just {money(room)}. The lesson is not &quot;never use creators&quot;. It is that the commission you can afford is whatever is left after the referral fee and your real costs, and on a thin-margin product that can be close to zero, whatever other sellers in your category offer.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>
    <p className="mt-12 text-sm text-slate-500">FeeFact is an independent tool, not affiliated with TikTok or ByteDance. <Link className="text-indigo-700 underline" href="/">All FeeFact tools</Link></p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
