import type { Metadata } from "next";
import Link from "next/link";
import { amazonChecked, amazonFba, amazonMediaClosingFee, amazonPlans, amazonReferralCategories, amazonRefundAdmin, amazonSources, calcAmazonReferralFee, compareFeeStacks, tiktokSources, vsAmazonExample, type FeeSource } from "../../lib/amazon";
import { fbtRateCard } from "../../lib/fbt";
import { formatMoney, tiktokShopRefund as refund, tiktokShopUsReferral as referral } from "../../lib/fees";

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;
const money = (amount: number) => formatMoney(amount);
const whole = (amount: number) => money(amount).replace(".00", "");

const tiktokRate = refund.standardReferralRate;
const { preOwned, reducedJewelry } = referral;
const { price, weightOz, amazonCategory, fbaTier } = vsAmazonExample;
const { tiktok, amazon, difference } = compareFeeStacks();
const exampleTier = amazonFba.tiers.find(tier => tier.sizeTier === fbaTier.sizeTier && tier.weight === fbaTier.weight)!;
const surcharge = percent(amazonFba.surchargeRate);
const peak = amazonFba.periods[1].label;
const share = percent(refund.adminShareOfReferral);
const cap = whole(refund.capPerSku);
const amazonShare = percent(amazonRefundAdmin.adminShareOfReferral);
const amazonCap = whole(amazonRefundAdmin.cap);
const [exemptA, exemptB] = refund.exemptions;

export const metadata: Metadata = {
  title: "TikTok Shop vs Amazon Fees: Which Platform Keeps More of Your Sale? (2026) | FeeFact",
  description: `TikTok Shop's US referral fee is ${percent(tiktokRate)} for most categories; Amazon's depends on the category and is 15% in many popular ones, plus FBA fees. A side-by-side fee stack, a worked example and FAQ, from official rates.`,
  alternates: { canonical: "https://feefact.com/tiktok-shop-vs-amazon-fees/" },
};

const faqs = [
  { question: "Is TikTok Shop cheaper than Amazon for sellers?", answer: `On the referral fee, usually yes. TikTok Shop's US table lists ${percent(tiktokRate)} for most categories, while Amazon's table lists 15% for categories such as ${amazonCategory} and Toys and Games, and 8% for Consumer Electronics. The total you pay also depends on fulfillment, advertising and any creator commission you choose to offer, so compare the full stack for your own product.` },
  { question: "Does Amazon charge a monthly fee to sell?", answer: `Amazon has two selling plans. The Professional plan is ${money(amazonPlans.professionalPerMonth)} per month when you have active listings, with no per-item fee. The Individual plan has no monthly subscription and charges ${money(amazonPlans.individualPerItem)} for each item sold. Referral fees apply on both plans.` },
  { question: "Do TikTok Shop and Amazon keep a fee when an order is refunded?", answer: `Yes, both. TikTok Shop keeps a refund administration fee of ${share} of the referral fee, capped at ${cap} per SKU. Amazon returns the referral fee minus a refund administration fee that is the lesser of ${amazonCap} or ${amazonShare} of the referral fee. Because Amazon's referral fee is higher in most categories, its refund administration fee on the same item is higher too, until the ${amazonCap} ceiling.` },
  { question: "Is the referral fee charged on shipping the buyer pays?", answer: "Yes, on both platforms. TikTok Shop's referral fee base is customer payment plus platform discount minus tax, and it includes the shipping fee paid by the customer. Amazon's referral fee is calculated on the total sales price, which includes the item price and any delivery or gift-wrapping charges, excluding tax." },
  { question: "Are FBA fees higher during the holidays?", answer: `Yes. Amazon's holiday peak fulfillment fees apply from October 15, 2026 to January 14, 2027, and the fee is charged when the shipment leaves the fulfillment center. For a ${fbaTier.sizeTier.toLowerCase()} item of ${fbaTier.weight} priced ${amazonFba.priceBand}, the fee is ${money(exampleTier.peak2026)} during the peak, against ${money(exampleTier.nonPeak2026)} before it and ${money(exampleTier.nonPeak2027)} from January 15, 2027. A ${surcharge} fuel and logistics-related surcharge applies on top of each of these.` },
  { question: "Does TikTok Shop's FBT fee depend on how many units are in the order?", answer: `Yes. Fulfilled by TikTok publishes a per-unit fee for orders of 1, 2, 3 and 4 or more units, and the per-unit fee falls as the order gets larger. The worked example on this page uses the 1 unit rate of ${money(tiktok.fulfillment)}.` },
  { question: "Which platform should I sell on?", answer: "The fee tables cannot answer that alone. They show what each platform takes from a sale; they do not show how many sales you will make or what you will spend on ads or creators to get them. Run your own price, weight and category through both stacks, then add your product, advertising and commission costs." },
];
const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

function Source({ source }: { source: FeeSource }) {
  return <a className="text-indigo-700 underline" href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a>;
}

const card = "mt-10 rounded-2xl border bg-white p-6 sm:p-8";
const th = "py-3 pr-4 font-medium";
const td = "py-3 pr-4";
const body = "mt-4 leading-relaxed text-slate-600";
const note = "mt-3 text-sm text-slate-500";
const link = "text-indigo-700 underline";

const stack: { layer: string; tiktok: string; amazon: string }[] = [
  { layer: "Selling plan", tiktok: "No subscription fee is listed on the TikTok Shop fee pages cited here", amazon: `Professional: ${money(amazonPlans.professionalPerMonth)} per month. Individual: ${money(amazonPlans.individualPerItem)} per item sold` },
  { layer: "Referral fee", tiktok: `${percent(tiktokRate)} for most categories; ${percent(preOwned.rate)} for five jewelry sub-categories and pre-owned`, amazon: `Set by category: 15% in ${amazonCategory} and many others, 8% in Consumer Electronics, minimum ${money(0.3)} per item` },
  { layer: "What the referral fee is charged on", tiktok: "Customer payment + platform discount − tax, including buyer-paid shipping", amazon: "Total sales price: item price plus delivery and gift-wrap charges, excluding tax" },
  { layer: "Closing fee", tiktok: "None listed", amazon: `${money(amazonMediaClosingFee)} per item in media categories (books, DVD, music, software, video games)` },
  { layer: "Platform fulfillment", tiktok: "Fulfilled by TikTok (FBT): per-unit fee by billable weight and units in the order", amazon: `Fulfillment by Amazon (FBA): per-unit fee by size tier, shipping weight and price band, plus a ${surcharge} surcharge` },
  { layer: "Refund administration fee", tiktok: `${share} of the referral fee, capped at ${cap} per SKU`, amazon: `Lesser of ${amazonCap} or ${amazonShare} of the referral fee` },
  { layer: "Creator or affiliate commission", tiktok: "Optional; the seller sets the rate", amazon: "Not part of Amazon's selling fee schedule" },
];

export default function VsAmazonFeesPage() {
  return <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">TikTok Shop fees, made clear</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">TikTok Shop vs Amazon Fees (2026)</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">Same product, two platforms: how much of the sale price does each one keep?</p>
    <p className="mt-3 text-sm text-slate-500">Rates last verified: {amazonChecked} · US marketplaces</p>
    <p className="mt-8 max-w-3xl rounded-2xl border border-indigo-200 bg-indigo-50 p-6 leading-relaxed"><strong>The short answer:</strong> TikTok Shop charges a {percent(tiktokRate)} referral fee on its official US table for most categories, while Amazon&apos;s referral fee depends on the category and is 15% in many popular ones. On a {money(price)} {amazonCategory} item weighing {weightOz} oz and fulfilled by each platform, the referral and fulfillment fees come to {money(tiktok.total)} on TikTok Shop and about {money(amazon.total)} on Amazon.</p>

    <section className={card} aria-labelledby="stack-heading">
      <h2 id="stack-heading" className="text-2xl font-bold">The fee stack, side by side</h2>
      <p className={body}>Each platform takes several fees from one order. This table lines up the layers that have a published rate or rule on both sides.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[40rem] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Fee layer</th><th scope="col" className={th}>TikTok Shop US</th><th scope="col" className={th}>Amazon US</th></tr></thead>
        <tbody>{stack.map(row => <tr key={row.layer} className="border-b align-top last:border-0"><th scope="row" className={th}>{row.layer}</th><td className={td}>{row.tiktok}</td><td className={td}>{row.amazon}</td></tr>)}</tbody>
      </table></div>
      <p className={note}>Sources: <Source source={tiktokSources.referral} />, <Source source={tiktokSources.refund} />, <Source source={tiktokSources.fbt} />, <Source source={amazonSources.pricing} />, <Source source={amazonSources.feeSchedule} />, <Source source={amazonSources.refundAdmin} />, <Source source={amazonSources.fbaFees} />.</p>
    </section>

    <section className={card} aria-labelledby="referral-heading">
      <h2 id="referral-heading" className="text-2xl font-bold">Referral fees: one rate against a category table</h2>
      <p className={body}>The referral fee is the percentage of the sale each platform keeps for the order itself. TikTok Shop&apos;s US table lists <strong className="text-slate-900">{percent(tiktokRate)} for most categories</strong>. Five jewelry sub-categories ({reducedJewelry.join(", ")}) and pre-owned categories are {percent(preOwned.rate)}, and on a pre-owned sale above {whole(preOwned.threshold)} the portion over {whole(preOwned.threshold)} is charged {percent(preOwned.rateAboveThreshold)}.</p>
      <p className={body}>Amazon sets the rate by category, and some categories change rate with the price. Here is what both platforms charge on the same {money(price)} sale in five Amazon categories:</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Referral fee on a {money(price)} sale, TikTok Shop US and Amazon US, by Amazon category</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Amazon category</th><th scope="col" className={th}>Amazon rate</th><th scope="col" className={th}>Amazon fee on {money(price)}</th><th scope="col" className={th}>TikTok Shop fee at {percent(tiktokRate)}</th></tr></thead>
        <tbody>{amazonReferralCategories.map(entry => <tr key={entry.category} className="border-b align-top last:border-0"><th scope="row" className={th}>{entry.category}</th><td className={td}>{entry.rule}</td><td className={td}>{money(calcAmazonReferralFee(price, entry))}</td><td className={td}>{money(tiktok.referral)}</td></tr>)}</tbody>
      </table></div>
      <p className={body}>These are five rows of Amazon&apos;s table, not all of it; look up your own category before you price. Amazon also applies a minimum referral fee of {money(0.3)} per item in these categories. TikTok Shop and Amazon do not use the same category names, so match your product to each table separately.</p>
      <p className={body}>Both platforms charge the referral fee on more than the item price. TikTok Shop&apos;s base is customer payment plus platform discount minus tax, and it includes shipping the customer pays. Amazon&apos;s base is the total sales price, which includes delivery and gift-wrap charges and excludes tax.</p>
      <p className={note}>Sources: <Source source={tiktokSources.referral} />; <Source source={amazonSources.pricing} />; <Source source={amazonSources.feeSchedule} />.</p>
    </section>

    <section className={card} aria-labelledby="example-heading">
      <h2 id="example-heading" className="text-2xl font-bold">Worked example: one {money(price)} item on both platforms</h2>
      <p className={body}>The item is an illustration: a {amazonCategory} product sold for {money(price)}, weighing {weightOz} oz, one unit per order, no shipping charged to the buyer and no discount, stored and shipped by the platform (FBT on TikTok Shop, FBA on Amazon). Every rate applied to it is an official one.</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">Referral and fulfillment fees on a {money(price)}, {weightOz} oz item on TikTok Shop US and Amazon US</caption>
        <thead><tr className="border-b text-slate-500"><td className={th} /><th scope="col" className={`${th} text-right`}>TikTok Shop (FBT)</th><th scope="col" className={`${th} text-right`}>Amazon (FBA)</th></tr></thead>
        <tbody>
          <tr className="border-b"><th scope="row" className={th}>Sale price</th><td className={`${td} text-right`}>{money(price)}</td><td className={`${td} text-right`}>{money(price)}</td></tr>
          <tr className="border-b"><th scope="row" className={th}>− Referral fee ({percent(tiktokRate)} / {percent(amazon.referralRate)})</th><td className={`${td} text-right`}>{money(tiktok.referral)}</td><td className={`${td} text-right`}>{money(amazon.referral)}</td></tr>
          <tr className="border-b"><th scope="row" className={th}>− Fulfillment fee, per unit</th><td className={`${td} text-right`}>{money(tiktok.fulfillment)}</td><td className={`${td} text-right`}>{money(amazon.fulfillment)}</td></tr>
          <tr className="border-b"><th scope="row" className={th}>− Fuel and logistics surcharge ({surcharge} of the FBA fee)</th><td className={`${td} text-right`}>—</td><td className={`${td} text-right`}>about {money(amazon.surcharge)}</td></tr>
          <tr className="border-b font-semibold"><th scope="row" className={th}>Left after these fees</th><td className={`${td} text-right`}>{money(tiktok.kept)}</td><td className={`${td} text-right`}>about {money(amazon.kept)}</td></tr>
          <tr><th scope="row" className={th}>Refund administration fee if the order is refunded</th><td className={`${td} text-right`}>{money(tiktok.refundAdmin)}</td><td className={`${td} text-right`}>{money(amazon.refundAdmin)}</td></tr>
        </tbody>
      </table></div>
      <p className={body}>On this item TikTok Shop leaves about <strong className="text-slate-900">{money(difference)} more per unit</strong> after referral and fulfillment fees. Almost all of the gap is the referral fee: {money(tiktok.referral)} against {money(amazon.referral)}. The two fulfillment fees are close.</p>
      <p className={body}>What the table leaves out matters as much as what it shows:</p>
      <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
        <li><strong className="text-slate-900">Your own costs.</strong> Product cost, inbound freight, advertising, and any creator commission you set on TikTok Shop are not in the table.</li>
        <li><strong className="text-slate-900">Amazon&apos;s selling plan.</strong> The Professional plan&apos;s {money(amazonPlans.professionalPerMonth)} per month is not spread over the unit; on the Individual plan, subtract {money(amazonPlans.individualPerItem)} per item instead.</li>
        <li><strong className="text-slate-900">Other FBA charges.</strong> Amazon lists storage, returns processing, aged-inventory and inbound-placement fees separately. They depend on your inventory, so they are not in a per-unit example.</li>
        <li><strong className="text-slate-900">The date.</strong> The FBA fee shown is the holiday peak rate for {peak.replace(" (holiday peak)", "")}. The next section shows the rate before and after.</li>
        <li><strong className="text-slate-900">Surcharge rounding.</strong> Amazon publishes the {surcharge} rate but not how it rounds the surcharge per unit, so the Amazon totals are marked &quot;about&quot;.</li>
      </ul>
      <p className={note}>Sources: <Source source={tiktokSources.referral} /> ({percent(tiktokRate)}); <Source source={tiktokSources.fbt} /> ({fbaTier.weight}, 1 unit order, card effective November 1, 2026); <Source source={amazonSources.pricing} /> ({amazonCategory}, {percent(amazon.referralRate)}); <Source source={amazonSources.fbaFees} /> ({fbaTier.sizeTier.toLowerCase()}, {fbaTier.weight}, {amazonFba.priceBand}); <Source source={tiktokSources.refund} />; <Source source={amazonSources.refundAdmin} />.</p>
    </section>

    <section className={card} aria-labelledby="fulfillment-heading">
      <h2 id="fulfillment-heading" className="text-2xl font-bold">Fulfillment fees: FBT against FBA</h2>
      <p className={body}>Both programs charge a fee per unit shipped, but they measure the unit differently.</p>
      <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
        <li><strong className="text-slate-900">FBT</strong> prices by billable weight and by how many units are in the order. TikTok Shop&apos;s card lists a per-unit fee for orders of 1, 2, 3 and 4 or more units. Items up to {fbtRateCard.maxItemLb} lb are eligible.</li>
        <li><strong className="text-slate-900">FBA</strong> prices by size tier, shipping weight and the item&apos;s price band (under $10, {amazonFba.priceBand}, over $50), with separate cards for apparel and dangerous goods. A {surcharge} fuel and logistics-related surcharge has applied to FBA fulfillment fees since {amazonFba.surchargeSince}.</li>
      </ul>
      <p className={body}>Size tier changes the FBA fee at the same weight. A small standard-size item weighs up to {amazonFba.smallStandard.maxWeightOz} oz and its shortest side is at most {amazonFba.smallStandard.maxShortestSideIn} inch; a thicker item of the same weight is large standard-size. The FBA rates below are for non-apparel items priced {amazonFba.priceBand}, before the surcharge:</p>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">FBA fulfillment fee per unit, non-apparel, item price {amazonFba.priceBand}, by period</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={th}>Size tier and shipping weight</th>{amazonFba.periods.map(period => <th key={period.key} scope="col" className={th}>{period.label}</th>)}</tr></thead>
        <tbody>{amazonFba.tiers.map(tier => <tr key={`${tier.sizeTier} ${tier.weight}`} className="border-b align-top last:border-0"><th scope="row" className={th}>{tier.sizeTier}, {tier.weight}</th>{amazonFba.periods.map(period => <td key={period.key} className={td}>{money(tier[period.key])}</td>)}</tr>)}</tbody>
      </table></div>
      <p className={body}>For FBT rates at every weight, and a comparison with shipping orders yourself, see <Link className={link} href="/tiktok-shop-shipping-fees">TikTok Shop shipping fees</Link>.</p>
      <p className={note}>Sources: <Source source={tiktokSources.fbt} />; <Source source={amazonSources.fbaFees} />; <Source source={amazonSources.sizeTiers} /> (size-tier limits effective through January 14, 2027).</p>
    </section>

    <section className={card} aria-labelledby="refund-heading">
      <h2 id="refund-heading" className="text-2xl font-bold">Refunds: the same rule on a different referral fee</h2>
      <p className={body}>When an order is refunded, neither platform returns the whole referral fee. TikTok Shop keeps a refund administration fee of {share} of the referral fee, capped at {cap} per SKU. Amazon keeps the lesser of {amazonCap} or {amazonShare} of the referral fee on non-media products.</p>
      <p className={body}>The rules are nearly the same, so the difference comes from the referral fee underneath. On the {money(price)} example the fee is {money(tiktok.refundAdmin)} on TikTok Shop and {money(amazon.refundAdmin)} on Amazon.</p>
      <p className={body}>TikTok Shop lists two refunds with no administration fee: {exemptA}, and {exemptB}. For the cap, monthly cost and who pays for return shipping, see <Link className={link} href="/tiktok-shop-refund-fee">TikTok Shop refund fee</Link>.</p>
      <p className={note}>Sources: <Source source={tiktokSources.refund} />, section &quot;Refunds and Returns&quot;; <Source source={amazonSources.refundAdmin} />.</p>
    </section>

    <section className={card} aria-labelledby="not-compared-heading">
      <h2 id="not-compared-heading" className="text-2xl font-bold">What this page does not compare</h2>
      <p className={body}>Some costs have no official rate to put in a table, so this page does not give a number for them:</p>
      <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
        <li><strong className="text-slate-900">Creator commission.</strong> On TikTok Shop the seller sets the affiliate commission rate; there is no platform rate. It stacks on the referral fee on creator-driven orders. See <Link className={link} href="/tiktok-shop-affiliate-commission">TikTok Shop affiliate commission</Link>.</li>
        <li><strong className="text-slate-900">Advertising.</strong> Ad spend on either platform is your own choice and is not a platform fee rate.</li>
        <li><strong className="text-slate-900">Sales volume.</strong> A lower fee does not help if the product does not sell there. Fee tables say nothing about demand.</li>
      </ul>
      <p className={body}>To model a catalog rather than one item, use the <Link className={link} href="/tools/batch-sku-profit">batch SKU profit calculator</Link>, or start with the <Link className={link} href="/">TikTok Shop profit calculator</Link> using your real commission and ad numbers.</p>
    </section>

    <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>

    <p className="mt-12 text-sm text-slate-500">Every rate on this page was checked against the linked TikTok Shop and Amazon pages on {amazonChecked}. Both platforms change fees; confirm on the linked pages before you price.</p>
    <p className="mt-3 text-sm text-slate-500">FeeFact is an independent tool, not affiliated with TikTok, ByteDance or Amazon. <Link className={link} href="/">All FeeFact tools</Link></p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
