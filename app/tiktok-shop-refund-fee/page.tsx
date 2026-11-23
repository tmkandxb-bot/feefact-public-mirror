import type { Metadata } from "next";
import Link from "next/link";
import { calcPreOwnedReferralFee, calcRefundAdminFee, refundCapSalePrice } from "../../lib/calc";
import { formatMoney, tiktokShopRefund as refund, tiktokShopRefundDeadlines as deadlines, tiktokShopRefundOfficial as official, tiktokShopReturnProtection as protection, tiktokShopUsReferral as referral } from "../../lib/fees";
import { returnShippingChecked, returnShippingFaqs, returnShippingRows, returnShippingSources as sources, type PolicySource } from "../../lib/returnShipping";

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;
const share = percent(refund.adminShareOfReferral);
const cap = formatMoney(refund.capPerSku).replace(".00", "");
const standard = refund.standardReferralRate;
const adminFee = (sale: number, rate: number = standard) => calcRefundAdminFee(sale, rate).fee;
const money = (amount: number) => formatMoney(amount, refund.currency);
const whole = (amount: number) => money(amount).replace(".00", "");
const skuFees = (skus: readonly number[]) => skus.map(sku => calcRefundAdminFee(sku, standard));
const perOrder = (sale: number, returnRate: number) => `$${Number((adminFee(sale) * returnRate).toFixed(3))}`;

export const metadata: Metadata = {
  title: `TikTok Shop Refund Administration Fee Explained (${share}, ${cap} Cap) | FeeFact`,
  description: `TikTok Shop keeps a refund administration fee of ${share} of the referral fee, capped at ${cap} per SKU, on refunded orders. The full refund cost stack, TikTok Shop's own multi-SKU and partial-refund examples, and who pays for return shipping.`,
};

function Source({ source }: { source: PolicySource }) {
  return <a className="text-indigo-700 underline" href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a>;
}

const card = "mt-10 rounded-2xl border bg-white p-6 sm:p-8";
const th = "py-3 pr-4 font-medium";
const td = "py-3 pr-4";

export default function RefundFeePage() {
  const [promo, jewelry, , reported] = refund.referralRates;
  const [exemptA, exemptB] = refund.exemptions;
  const { preOwned, reducedJewelry } = referral;
  const { customerPayment, platformDiscount, tax, rate: partialRate, refundedShare } = official.partial;
  const partialBase = customerPayment + platformDiscount - tax;
  const partialReferral = partialBase * partialRate;
  const partialFee = adminFee(partialBase * refundedShare, partialRate);
  const fullFee = adminFee(partialBase, partialRate);
  const officialSource = <a className="text-indigo-700 underline" href={refund.source} rel="noopener noreferrer" target="_blank">TikTok Shop Academy: {official.title}</a>;
  const faqs = [
    { question: "Is the admin fee charged on every refund?", answer: `No. It is charged on most refunded US orders, deducted automatically from the referral fee being returned, but TikTok Shop's policy lists two cases with no refund administration fee: ${exemptA}, and ${exemptB}. On every other refund the fee applies and there is nothing to opt out of.` },
    { question: `Does the ${cap} cap apply per order or per SKU?`, answer: `Per SKU. A refunded order with two different SKUs can incur up to ${cap} on each one — the cap does not pool across the order.` },
    { question: `Do new sellers on the ${percent(promo.rate)} promo pay the admin fee too?`, answer: `Yes, but ${share} of a smaller referral fee. A refunded ${whole(35)} order costs ${money(adminFee(35, promo.rate))} in admin fees at ${percent(promo.rate)}, against ${money(adminFee(35))} at ${percent(standard)} — the promo quietly cuts your refund cost as well as your referral fee.` },
    { question: "Can I avoid the admin fee?", answer: "Only in the two exempt cases above; otherwise it is charged automatically on refunds. The lever is the return rate itself: accurate sizing charts, honest photos and clear descriptions. Every point of return rate you cut is admin fees you never pay, before you count the return shipping you also save." },
    { question: "How is the admin fee calculated on a partial refund?", answer: `In proportion to what is refunded. In TikTok Shop's own sample order, the referral fee is ${money(partialReferral)}; when half of the order is refunded the refund administration fee is ${money(partialFee)}, and when all of it is refunded the fee is ${money(fullFee)}.` },
    { question: "Is the admin fee charged when an order is cancelled?", answer: `It can be. TikTok Shop's policy applies the fee when "a refund, return, or cancellation occurs after the customer successfully places an order". The exception is a refund the buyer starts before the order ships that meets TikTok Shop's auto-canceling criteria, which carries no refund administration fee.` },
    { question: `When did the ${cap} cap start?`, answer: `On ${official.capEffective}. TikTok Shop's policy says that from that date the maximum refund administration fee for each SKU type in a refund is ${cap}.` },
    { question: "What amount is the referral fee, and so the admin fee, based on?", answer: `TikTok Shop calculates the referral fee on ${official.feeBase}. The refund administration fee is ${share} of that referral fee, so a platform-funded discount raises the base and sales tax does not count.` },
    { question: "How long does a customer have to ask for a return?", answer: `The return window shown at checkout, or by default ${deadlines.defaultReturnWindowDays} calendar days from the date the package is marked as delivered. Once a request is in, sellers have ${deadlines.returnReviewBusinessDays} business days to review a return and refund request; if they take no action, TikTok Shop may approve it automatically.` },
    ...returnShippingFaqs,
  ];
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  const { orders, returnRates, sales } = refund.monthly;

  return <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">TikTok Shop fees, made clear</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">TikTok Shop Refund Administration Fee</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">The fee almost nobody models — and the reason high-return categories quietly bleed money.</p>
    <p className="mt-3 text-sm text-slate-500">Rates last verified: {refund.verified} · US rule</p>
    <p className="mt-8 max-w-3xl rounded-2xl border border-indigo-200 bg-indigo-50 p-6 leading-relaxed"><strong>The short answer:</strong> when a US order is refunded, you do not get the whole referral fee back — TikTok keeps a refund administration fee of {share} of the referral fee, capped at {cap} per SKU. Two cases are exempt: {exemptA}, and {exemptB}. Return shipping is a separate cost that this fee does not cover; see <a className="font-semibold text-indigo-700 underline" href="#return-shipping">who pays for return shipping</a>.</p>

    <section className={card} aria-labelledby="rule-heading">
      <h2 id="rule-heading" className="text-2xl font-bold">The rule</h2>
      <p className="mt-4 leading-relaxed text-slate-600">When a TikTok Shop order is refunded, the referral fee is not fully returned. TikTok charges a <strong className="text-slate-900">refund administration fee equal to {share} of the referral fee, capped at {cap} per SKU</strong>.</p>
      <p className="mt-4 leading-relaxed text-slate-600"><strong className="text-slate-900">Two refunds carry no administration fee:</strong></p>
      <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
        <li>Refunds on {exemptA}.</li>
        <li>{exemptB.charAt(0).toUpperCase() + exemptB.slice(1)}.</li>
      </ul>
      <p className="mt-3 text-sm text-slate-500">Source: <a className="text-indigo-700 underline" href={refund.source} rel="noopener noreferrer" target="_blank">TikTok Shop Academy: Referral Fee Updates</a>, section &quot;Refunds and Returns&quot;.</p>
    </section>

    <section className={card} aria-labelledby="stack-heading">
      <h2 id="stack-heading" className="text-2xl font-bold">The refund cost stack at a glance</h2>
      <p className="mt-4 leading-relaxed text-slate-600">A refund touches more than one line of your settlement. This table lists every refund-related cost TikTok Shop publishes a rule for; each row is explained in a section below.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[40rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Line</th><th scope="col" className={th}>What happens on a refund</th><th scope="col" className={th}>When it applies</th></tr></thead>
        <tbody className="align-top">
          <tr className="border-b"><th scope="row" className={th}>Referral fee</th><td className={td}>Refunded to you, minus the refund administration fee</td><td className={td}>Refund, return or cancellation after the order is placed</td></tr>
          <tr className="border-b"><th scope="row" className={th}>Refund administration fee</th><td className={td}>{share} of the referral fee, capped at {cap} per SKU</td><td className={td}>Every refund except the two exempt cases</td></tr>
          <tr className="border-b"><th scope="row" className={th}>Return shipping</th><td className={td}>Seller&apos;s cost when the customer uses TikTok Shop&apos;s drop-off return; customer&apos;s cost when they arrange their own shipping</td><td className={td}>Returns where the item is sent back</td></tr>
          <tr><th scope="row" className={th}>Return Shipping Protection Program</th><td className={td}>{percent(protection.feeShareOfTcov)} of Total Covered Order Value on each covered order; covers eligible return shipping fees</td><td className={td}>Only if you opt in</td></tr>
        </tbody>
      </table></div>
      <p className="mt-3 text-sm text-slate-500">Sources: {officialSource}; <Source source={sources.policy} />; <Source source={sources.protectionGuide} />. TikTok Shop does not publish a dollar amount for return shipping, so none is shown here; the amount charged per return is on your settlement lines.</p>
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
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Read it as: admin fee = {share} × referral fee. The {percent(jewelry.rate)} column applies only to the five jewelry sub-categories TikTok Shop lists at {percent(jewelry.rate)} ({reducedJewelry.join(", ")}) and to pre-owned categories; other jewelry, such as silver and pearl, is {percent(standard)}. On pre-owned sales above {whole(preOwned.threshold)}, the portion over {whole(preOwned.threshold)} is charged {percent(preOwned.rateAboveThreshold)} instead of {percent(preOwned.rate)}, so a {whole(12000)} pre-owned sale carries a {whole(calcPreOwnedReferralFee(12000))} referral fee (<a className="text-indigo-700 underline" href={referral.source} rel="noopener noreferrer" target="_blank">Category Referral Rates</a>). The {percent(reported.rate)} column is the widely reported effective rate; the fee scales with whatever rate your account actually pays, so check your settlement lines.</p>
    </section>

    <section className={card} aria-labelledby="sku-heading">
      <h2 id="sku-heading" className="text-2xl font-bold">Orders with more than one SKU</h2>
      <p className="mt-4 leading-relaxed text-slate-600">The fee and the {cap} cap are both applied <strong className="text-slate-900">per SKU, not per order</strong>. These are the four scenarios TikTok Shop uses to illustrate the rule, all at the {percent(standard)} rate.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Scenario</th><th scope="col" className={th}>Refunded order</th><th scope="col" className={th}>Fee per SKU</th><th scope="col" className={th}>Refund administration fee</th></tr></thead>
        <tbody>{official.scenarios.map(({ id, order, skus }) => {
          const results = skuFees(skus);
          return <tr key={id} className="border-b last:border-0"><th scope="row" className={th}>{id}</th><td className={td}>{order}</td><td className={td}>{results.map(result => `${money(result.fee)}${result.capped ? " (capped)" : ""}`).join(" + ")}</td><td className={`${td} font-semibold`}>{money(results.reduce((sum, result) => sum + result.fee, 0))}</td></tr>;
        })}</tbody>
      </table></div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Scenario D is the one to remember: the {whole(500)} SKU would be {money(500 * standard * refund.adminShareOfReferral)} at {share} of the referral fee, is reduced to {cap} by the cap, and the {whole(10)} SKU still adds its own {money(adminFee(10))}. The cap never pools across the order.</p>
      <p className="mt-3 text-sm text-slate-500">Source: {officialSource}, scenarios A to D under &quot;Refunds and Returns&quot;.</p>
    </section>

    <section className={card} aria-labelledby="partial-heading">
      <h2 id="partial-heading" className="text-2xl font-bold">Partial refunds and the fee base</h2>
      <p className="mt-4 leading-relaxed text-slate-600">The referral fee is charged on <strong className="text-slate-900">{official.feeBase}</strong>, and the refund administration fee follows the share of the order that is refunded. TikTok Shop&apos;s sample order: the customer pays {whole(customerPayment)}, a platform discount adds {whole(platformDiscount)}, and {whole(tax)} of the payment is sales tax and retail delivery fee, so the fee base is {whole(partialBase)}.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Line</th><th scope="col" className={th}>No refund</th><th scope="col" className={th}>{percent(refundedShare)} refunded</th><th scope="col" className={th}>Fully refunded</th></tr></thead>
        <tbody>
          <tr className="border-b"><th scope="row" className={th}>Referral fee at {percent(partialRate)}</th><td className={td}>{money(partialReferral)}</td><td className={td}>{money(partialReferral * (1 - refundedShare))}</td><td className={td}>{money(0)}</td></tr>
          <tr><th scope="row" className={th}>Refund administration fee</th><td className={td}>None</td><td className={td}>{money(partialFee)}</td><td className={td}>{money(fullFee)}</td></tr>
        </tbody>
      </table></div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Read it as: on the half refund, the referral fee on the refunded half ({money(partialReferral * refundedShare)}) comes back to you less {share} of it, {money(partialFee)}. On the full refund, the whole {money(partialReferral)} comes back less {money(fullFee)}.</p>
      <p className="mt-3 text-sm text-slate-500">Source: {officialSource}, &quot;Sample computation - Referral Fee&quot;.</p>
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
      <p className="mt-3 leading-relaxed text-slate-600"><strong className="text-slate-900">The program is not free.</strong> It is voluntary: you can opt in or out, and sellers who opt in pay a fee on each covered order. TikTok Shop&apos;s guide sets the fee at {percent(protection.feeShareOfTcov)} of the order&apos;s Total Covered Order Value (the amount the buyer paid, plus platform subsidy, minus tax) (<Source source={sources.protectionGuide} />).</p>

      <h3 className="mt-6 text-lg font-semibold">What to do with this</h3>
      <p className="mt-2 leading-relaxed text-slate-600">Budget for return shipping on every return that comes back through TikTok Shop&apos;s drop-off option, whatever the reason, on top of the refund administration fee above. The actual amount charged per return shows on your settlement lines.</p>
      <p className="mt-4 text-sm text-slate-500">Return shipping rules checked against TikTok Shop Academy on {returnShippingChecked}. TikTok Shop determines who is responsible for each return and can change these rules; confirm on the linked pages.</p>
    </section>

    <section className={card} aria-labelledby="deadlines-heading">
      <h2 id="deadlines-heading" className="text-2xl font-bold">Refund deadlines that decide whether you get a say</h2>
      <p className="mt-4 leading-relaxed text-slate-600">A refund you did not review is still a refund you pay the administration fee on. TikTok Shop&apos;s US policy sets these clocks:</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Request</th><th scope="col" className={th}>Time limit</th><th scope="col" className={th}>If it passes</th></tr></thead>
        <tbody className="align-top">
          <tr className="border-b"><th scope="row" className={th}>Customer asks for a return and refund</th><td className={td}>The window shown at checkout, or by default {deadlines.defaultReturnWindowDays} calendar days from &quot;Delivered&quot;</td><td className={td}>The standard return window has closed</td></tr>
          <tr className="border-b"><th scope="row" className={th}>Seller reviews a return and refund request</th><td className={td}>{deadlines.returnReviewBusinessDays} business days</td><td className={td}>TikTok Shop may approve it automatically</td></tr>
          <tr className="border-b"><th scope="row" className={th}>Seller reviews a refund-only request</th><td className={td}>{deadlines.refundOnlyReviewBusinessDays} business days for items {whole(deadlines.refundOnlyPriceLimit)} or less; {deadlines.returnReviewBusinessDays} business days above {whole(deadlines.refundOnlyPriceLimit)}</td><td className={td}>TikTok Shop may approve the refund automatically</td></tr>
          <tr><th scope="row" className={th}>Seller acts on a cancellation or refund request before shipping</th><td className={td}>{deadlines.cancellationReviewHours} hours</td><td className={td}>TikTok Shop may approve it automatically and refund the customer</td></tr>
        </tbody>
      </table></div>
      <p className="mt-3 text-sm text-slate-500">Source: <Source source={sources.policy} /> (updated {sources.policy.updated}). TikTok Shop can extend return windows for holiday periods.</p>
    </section>

    <section className={card} aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-2xl font-bold">Sources</h2>
      <p className="mt-4 leading-relaxed text-slate-600">Every rule and number on this page comes from these TikTok Shop Academy pages. Where TikTok Shop publishes no figure, this page gives none.</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
        <li>{officialSource} (updated {official.updated}): the {share} fee, the {cap} cap from {official.capEffective}, the exemptions, scenarios A to D and the partial-refund sample. Checked {official.checked}.</li>
        <li><a className="text-indigo-700 underline" href={referral.source} rel="noopener noreferrer" target="_blank">TikTok Shop Academy: Category Referral Rates</a>: the category referral rates the fee is a share of.</li>
        {Object.values(sources).map(source => <li key={source.url}><Source source={source} /> (updated {source.updated}).</li>)}
      </ul>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>
    <p className="mt-12 text-sm text-slate-500">FeeFact is an independent tool, not affiliated with TikTok or ByteDance. <Link className="text-indigo-700 underline" href="/">All FeeFact tools</Link></p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
