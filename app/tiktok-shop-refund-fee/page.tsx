import type { Metadata } from "next";
import Link from "next/link";
import { calcRefundAdminFee, refundCapSalePrice } from "../../lib/calc";
import { formatMoney, tiktokShopRefund as refund } from "../../lib/fees";
import { returnShippingChecked, returnShippingFaqs, returnShippingRows, returnShippingSources as sources, type PolicySource } from "../../lib/returnShipping";

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;
const share = percent(refund.adminShareOfReferral);
const cap = formatMoney(refund.capPerSku).replace(".00", "");
const standard = refund.standardReferralRate;
const adminFee = (sale: number, rate: number = standard) => calcRefundAdminFee(sale, rate).fee;
const money = (amount: number) => formatMoney(amount, refund.currency);
const whole = (amount: number) => money(amount).replace(".00", "");
const perOrder = (sale: number, returnRate: number) => `$${Number((adminFee(sale) * returnRate).toFixed(3))}`;

export const metadata: Metadata = {
  title: `TikTok Shop Refund Administration Fee Explained (${share}, ${cap} Cap) | FeeFact`,
  description: `TikTok Shop keeps a refund administration fee of ${share} of the referral fee, capped at ${cap} per SKU, on refunded orders. How it works, worked examples, and who pays for return shipping.`,
};

function Source({ source }: { source: PolicySource }) {
  return <a className="text-indigo-700 underline" href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a>;
}

const card = "mt-10 rounded-2xl border bg-white p-6 sm:p-8";
const th = "py-3 pr-4 font-medium";
const td = "py-3 pr-4";

export default function RefundFeePage() {
  const [promo, jewelry, , reported] = refund.referralRates;
  const faqs = [
    { question: "Is the admin fee charged on every refund?", answer: "Yes — on every refunded US order. TikTok deducts it automatically from the referral fee being returned, so there is nothing to opt out of and no way to waive it. The only number you control is how often refunds happen." },
    { question: `Does the ${cap} cap apply per order or per SKU?`, answer: `Per SKU. A refunded order with two different SKUs can incur up to ${cap} on each one — the cap does not pool across the order.` },
    { question: `Do new sellers on the ${percent(promo.rate)} promo pay the admin fee too?`, answer: `Yes, but ${share} of a smaller referral fee. A refunded ${whole(35)} order costs ${money(adminFee(35, promo.rate))} in admin fees at ${percent(promo.rate)}, against ${money(adminFee(35))} at ${percent(standard)} — the promo quietly cuts your refund cost as well as your referral fee.` },
    { question: "Can I avoid the admin fee?", answer: "Not directly — it is charged automatically on refunds. The lever is the return rate itself: accurate sizing charts, honest photos and clear descriptions. Every point of return rate you cut is admin fees you never pay, before you count the return shipping you also save." },
    ...returnShippingFaqs,
  ];
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  const { orders, returnRates, sales } = refund.monthly;

  return <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">TikTok Shop fees, made clear</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">TikTok Shop Refund Administration Fee</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">The fee almost nobody models — and the reason high-return categories quietly bleed money.</p>
    <p className="mt-3 text-sm text-slate-500">Rates last verified: {refund.verified} · US rule</p>
    <p className="mt-8 max-w-3xl rounded-2xl border border-indigo-200 bg-indigo-50 p-6 leading-relaxed"><strong>The short answer:</strong> when a US order is refunded, you do not get the whole referral fee back — TikTok keeps a refund administration fee of {share} of the referral fee, capped at {cap} per SKU. Return shipping is a separate cost that this fee does not cover; see <a className="font-semibold text-indigo-700 underline" href="#return-shipping">who pays for return shipping</a>.</p>

    <section className={card} aria-labelledby="rule-heading">
      <h2 id="rule-heading" className="text-2xl font-bold">The rule</h2>
      <p className="mt-4 leading-relaxed text-slate-600">When a TikTok Shop order is refunded, the referral fee is not fully returned. TikTok charges a <strong className="text-slate-900">refund administration fee equal to {share} of the referral fee, capped at {cap} per SKU</strong>.</p>
    </section>

    <section className={card} aria-labelledby="examples-heading">
      <h2 id="examples-heading" className="text-2xl font-bold">Worked examples</h2>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[32rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Sale price</th>{refund.referralRates.map(({ rate, label }) => <th key={rate} scope="col" className={th}>{percent(rate)} · {label}</th>)}</tr></thead>
        <tbody>{refund.exampleSales.map(sale => <tr key={sale} className="border-b last:border-0"><th scope="row" className={th}>{whole(sale)}</th>{refund.referralRates.map(({ rate }) => {
          const result = calcRefundAdminFee(sale, rate);
          return <td key={rate} className={td}>{money(result.fee)}{result.capped ? " (capped)" : result.atCap ? " (at cap)" : ""}</td>;
        })}</tr>)}</tbody>
      </table></div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Read it as: admin fee = {share} × referral fee. The {percent(jewelry.rate)} column is for fine jewelry and pre-owned — the two categories on the published table at {percent(jewelry.rate)}. The {percent(reported.rate)} column is the widely reported effective rate; the fee scales with whatever rate your account actually pays, so check your settlement lines.</p>
    </section>

    <section className={card} aria-labelledby="why-heading">
      <h2 id="why-heading" className="text-2xl font-bold">Why it matters</h2>
      <p className="mt-4 leading-relaxed text-slate-600">At a 20% return rate on a {whole(35)} product, expected admin fees are about {perOrder(35, 0.2)} per order sold — before you count return shipping and unsellable units. Fashion and footwear sellers feel this first.</p>
    </section>

    <section className={card} aria-labelledby="cap-heading">
      <h2 id="cap-heading" className="text-2xl font-bold">Where the {cap} cap actually bites</h2>
      <p className="mt-4 leading-relaxed text-slate-600">The cap only matters on expensive items. The admin fee reaches {cap} when the sale price hits:</p>
      <table className="mt-4 w-full text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Referral rate</th><th scope="col" className={th}>Price where the {cap} cap bites</th></tr></thead>
        <tbody>{refund.referralRates.map(({ rate, capLabel }) => <tr key={rate} className="border-b last:border-0"><th scope="row" className={th}>{percent(rate)} — {capLabel}</th><td className={td}>{money(refundCapSalePrice(rate))}</td></tr>)}</tbody>
      </table>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Below that price the fee is simply {share} of the referral fee, so it grows with price. Above it, the fee is flat at {cap} no matter how expensive the item — a $500 order and a $2,000 order cost the same {cap} per refunded SKU. For most sellers (items under $100) the cap never comes into play; it is a high-ticket detail.</p>
    </section>

    <section className={card} aria-labelledby="monthly-heading">
      <h2 id="monthly-heading" className="text-2xl font-bold">What refunds cost you per month</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Admin fees only — return shipping is a separate cost, covered in the next section. Example: {orders} orders a month, standard {percent(standard)} referral rate.</p>
      <table className="mt-4 w-full text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Return rate</th><th scope="col" className={th}>Refunds / month</th>{sales.map(sale => <th key={sale} scope="col" className={th}>{whole(sale)} item — admin / month</th>)}</tr></thead>
        <tbody>{returnRates.map(rate => <tr key={rate} className="border-b last:border-0"><th scope="row" className={th}>{percent(rate)}</th><td className={td}>{Math.round(orders * rate)}</td>{sales.map(sale => <td key={sale} className={td}>{money(Math.round(orders * rate) * adminFee(sale))}</td>)}</tr>)}</tbody>
      </table>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">At a 20% return rate on a {whole(35)} product that is {perOrder(35, 0.2)} of admin fee baked into every order you sell. Cutting the return rate from 20% to 10% saves {money(Math.round(orders * 0.1) * adminFee(35))} a month on admin fees alone at this volume, before any return-shipping savings.</p>
    </section>

    <section id="return-shipping" className={`${card} scroll-mt-6`} aria-labelledby="return-shipping-heading">
      <h2 id="return-shipping-heading" className="text-2xl font-bold">Who pays for return shipping?</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Return shipping is a separate cost. The refund administration fee does not cover it. TikTok Shop&apos;s US return policy decides who pays, and the answer depends mostly on <strong className="text-slate-900">how the customer sends the item back</strong>, not on why they are returning it.</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
        <li><strong className="text-slate-900">Customer uses TikTok Shop&apos;s drop-off return</strong> (the policy calls this &quot;platform preferred logistics&quot;): the return shipping cost is the seller&apos;s responsibility.</li>
        <li><strong className="text-slate-900">Customer arranges their own return shipping:</strong> the customer pays.</li>
      </ul>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="mb-3 text-left font-semibold">Who is responsible for the return shipping cost (US)</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Why the item is coming back</th><th scope="col" className={th}>TikTok Shop drop-off return</th><th scope="col" className={th}>Customer arranges own shipping</th></tr></thead>
        <tbody>{returnShippingRows.map(row => <tr key={row.situation} className="border-b align-top last:border-0">
          <th scope="row" className={th}><span className="font-semibold">{row.situation}</span><span className="mt-1 block font-normal text-slate-500">{row.reasons}</span></th>
          <td className={`${td} font-semibold`}>{row.platformDropOff}</td><td className={`${td} font-semibold`}>{row.selfArranged}</td>
        </tr>)}</tbody>
      </table></div>
      <p className="mt-3 text-sm text-slate-500">Source: <Source source={sources.policy} />, section &quot;Return and Forward Shipping Cost Responsibilities&quot; (updated {sources.policy.updated}).</p>

      <h3 className="mt-8 text-lg font-semibold">Buyer changed their mind</h3>
      <p className="mt-2 leading-relaxed text-slate-600">Many new sellers expect the buyer to pay when the return is the buyer&apos;s choice. On TikTok Shop that is only true when the customer arranges their own shipping. The policy states that sellers are responsible for all return-related costs for buyer-fault return reasons such as &quot;no longer needed&quot; or &quot;does not fit&quot;. TikTok Shop also says that for approved returns that are not the seller&apos;s fault it often subsidizes a portion of the logistics costs, which reduces what is deducted from your balance (<Source source={sources.finance} />).</p>

      <h3 className="mt-6 text-lg font-semibold">Defective, damaged or wrong item</h3>
      <p className="mt-2 leading-relaxed text-slate-600">These are seller-fault returns. TikTok Shop says the seller bears the full cost of return shipping and handling when the return is due to the seller&apos;s error, such as shipping the wrong item, sending a defective product, or an inaccurate listing (<Source source={sources.finance} />). If several items come back together and at least one of them is returned for a seller-fault reason, the seller is responsible for the return shipping fee for the batch (<Source source={sources.policy} />).</p>

      <h3 className="mt-6 text-lg font-semibold">Exchanges and replacements</h3>
      <p className="mt-2 leading-relaxed text-slate-600">When a customer exchanges an item, the seller pays to ship the exchange item out and TikTok Shop covers the return shipping of the original item. When a customer returns an item for a replacement, the seller pays both: shipping the replacement out and the return shipping of the original (<Source source={sources.policy} />).</p>

      <h3 className="mt-6 text-lg font-semibold">Protection against return shipping costs</h3>
      <p className="mt-2 leading-relaxed text-slate-600">TikTok Shop offers an optional Return Shipping Protection Program, run by third-party vendors, that covers eligible return shipping fees. You enroll in Seller Center under Logistics → Fulfillment → Shipping Protection Settings. Coverage applies to eligible orders placed after you enroll, and return shipping fee claims are processed automatically once the buyer drops off the return parcel. The program&apos;s own charges appear on your Seller Center invoices (<Source source={sources.protection} />).</p>

      <h3 className="mt-6 text-lg font-semibold">What to do with this</h3>
      <p className="mt-2 leading-relaxed text-slate-600">Budget for return shipping on every return that comes back through TikTok Shop&apos;s drop-off option, whatever the reason, on top of the refund administration fee above. The actual amount charged per return shows on your settlement lines.</p>
      <p className="mt-4 text-sm text-slate-500">Return shipping rules checked against TikTok Shop Academy on {returnShippingChecked}. TikTok Shop determines who is responsible for each return and can change these rules; confirm on the linked pages.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>
    <p className="mt-12 text-sm text-slate-500">FeeFact is an independent tool, not affiliated with TikTok or ByteDance. <Link className="text-indigo-700 underline" href="/">All FeeFact tools</Link></p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
