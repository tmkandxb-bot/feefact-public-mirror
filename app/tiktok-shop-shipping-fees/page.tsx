import type { Metadata } from "next";
import { fbtFeePerUnit, fbtRateCard, findFbtTier } from "../../lib/fbt";
import { formatMoney } from "../../lib/fees";
import { compareSellerShippedWithFbt, keptAfterShipping, priceToKeep, referralRates, shippingExample } from "../../lib/shipping";

export const metadata: Metadata = {
  title: "TikTok Shop Shipping Fees — Who Pays for Shipping? | FeeFact",
  description: "Who pays for shipping on TikTok Shop — buyer, seller or FBT — and what each setup does to your profit. Includes the Fulfilled by TikTok (FBT) rate card effective November 1, 2026.",
  alternates: { canonical: "https://feefact.com/tiktok-shop-shipping-fees/" },
};

const referralVerifiedOn = "October 30, 2026";
const percent = (rate: number, digits = 0) => `${(rate * 100).toFixed(digits).replace(/\.0$/, "")}%`;
const longDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const card = "mt-8 rounded-2xl border bg-white p-6 sm:p-8";
const body = "mt-4 leading-relaxed text-slate-700";
const num = "py-2 pl-4 text-right tabular-nums";

function MoneyTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: { label: string; values: string[]; total?: boolean }[] }) {
  return <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm">
    <caption className="sr-only">{caption}</caption>
    <thead><tr className="border-b text-slate-500"><td />{columns.map(column => <th key={column} scope="col" className={num}>{column}</th>)}</tr></thead>
    <tbody>{rows.map(row => <tr key={row.label} className={`border-b last:border-0 ${row.total ? "font-semibold" : ""}`}>
      <th scope="row" className="py-2 font-normal">{row.label}</th>
      {row.values.map((value, index) => <td key={index} className={num}>{value}</td>)}
    </tr>)}</tbody>
  </table></div>;
}

export default function ShippingFeesPage() {
  const { price, carrierCost, buyerShippingCharge, productCost, affiliateRate, itemWeightOz, pricePoints, orderVolume } = shippingExample;
  const rate = referralRates.verified;
  const buyerPaid = keptAfterShipping({ price, shippingCost: carrierCost, buyerShippingCharge });
  const freeShipping = keptAfterShipping({ price, shippingCost: carrierCost });
  const coveringPrice = priceToKeep(buyerPaid.kept, carrierCost);
  const affiliate = Math.round(price * affiliateRate * 100) / 100;
  const fullStack = (kept: number) => Math.round((kept - productCost - affiliate) * 100) / 100;
  const breakEvenLift = fullStack(buyerPaid.kept) / fullStack(freeShipping.kept) - 1;
  const lowest = pricePoints[0];
  const highest = pricePoints[pricePoints.length - 1];

  const fbt = compareSellerShippedWithFbt();
  const exampleTier = findFbtTier(itemWeightOz / 16)!;
  const effective = longDate(fbtRateCard.effectiveDate);
  const { actualWeightOnly, dimensionalDivisor, maxItemLb, maxSideInches } = fbtRateCard;
  const twoUnitFee = fbtFeePerUnit(itemWeightOz / 16, 2)!;

  const faqs = [
    { question: "Who pays for shipping on TikTok Shop?", answer: "It depends on how you set the listing up. With buyer-paid shipping, the buyer pays a shipping charge at checkout — but if your actual carrier cost is higher, you absorb the difference. With free shipping, you absorb the whole cost. Either way, your real shipping cost is a number from your carrier, not from TikTok." },
    { question: "Is free shipping worth offering?", answer: `Only if the price covers it. Free shipping shifts the full shipping charge onto your side of the order — in our example, ${formatMoney(buyerShippingCharge)} per order versus a ${formatMoney(carrierCost - buyerShippingCharge)} shortfall under buyer-paid shipping. If the conversion lift does not pay for that difference, it is a discount you did not mean to give.` },
    { question: "What changes if I use Fulfilled by TikTok (FBT)?", answer: `Your own carrier cost is replaced by FBT's per-unit fulfillment fee, which covers picking, packing, packaging materials and delivery to the buyer. On the rate card effective ${effective}, the fee starts at ${formatMoney(fbtRateCard.tiers[0].perUnit[0])} per unit for a single-unit order of ${fbtRateCard.tiers[0].label} and depends on billable weight and how many units are in the order. The line item changes; the discipline does not — the fulfillment cost still has to be inside your price.` },
    { question: "How is FBT billable weight worked out?", answer: `If the item weighs ${actualWeightOnly.maxLb} lb or less and its length × width × height is ${actualWeightOnly.maxCubicInches} cubic inches or less, FBT bills on actual weight. Otherwise it bills on the greater of actual weight and dimensional weight (length × width × height in inches ÷ ${dimensionalDivisor}).` },
    { question: "Why does free shipping hurt low-priced items more?", answer: `Because shipping is a fixed cost per order while the price is not. A ${formatMoney(carrierCost)} shipping cost is ${percent(carrierCost / lowest, 1)} of a ${formatMoney(lowest)} item but only ${percent(carrierCost / highest, 1)} of a ${formatMoney(highest)} item.` },
    { question: "How do I find my real average shipping cost per order?", answer: "Take what you actually paid carriers over a recent period — a month is a good window — and divide it by the number of orders shipped in that same period. That average is your number: it already reflects your real weights, zones and surcharges." },
  ];
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

  return <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">TikTok Shop US</p>
    <h1 className="text-4xl font-bold tracking-tight">TikTok Shop Shipping Fees: Who Pays, and What It Does to Your Profit</h1>
    <p className="mt-5 text-lg text-slate-600">Shipping is the fee that is not called a fee. Whether the buyer pays it at checkout or you bury it in the price, it comes out of the same order — here is the math.</p>
    <p className="mt-3 text-sm text-slate-500">Referral fee last verified: {referralVerifiedOn} · FBT rate card effective {effective}</p>
    <p className="mt-6 font-semibold leading-relaxed">The short answer: somebody always pays for shipping — if the buyer doesn&apos;t pay it at checkout, it comes out of your price. In the worked example on this page (a {formatMoney(price)} item with a {formatMoney(carrierCost)} actual shipping cost), charging the buyer leaves you {formatMoney(buyerPaid.kept)}; absorbing it yourself leaves {formatMoney(freeShipping.kept)}.</p>

    <section className={card} aria-labelledby="ways-heading">
      <h2 id="ways-heading" className="text-2xl font-bold">The three ways shipping gets paid</h2>
      <p className={body}><strong>1. Buyer-paid shipping.</strong> The buyer pays a shipping charge at checkout. But what the buyer pays and what the carrier charges you are two different numbers — if your actual cost is higher, the shortfall quietly comes out of your margin (see the example below).</p>
      <p className={body}><strong>2. Seller-funded free shipping.</strong> You absorb the full shipping cost. Listings with free shipping often convert better, which is a legitimate reason to offer it — but the cost has to live inside your price, not outside your math.</p>
      <p className={body}><strong>3. Fulfilled by TikTok (FBT).</strong> If you use FBT, per-unit fulfillment fees replace your own shipping cost in the profit math — one line item instead of another, not a free pass. The current rates are in the <a className="font-semibold text-indigo-700 underline" href="#fbt-heading">FBT rate table</a> below.</p>
    </section>

    <section className={card} aria-labelledby="example-heading">
      <h2 id="example-heading" className="text-2xl font-bold">Worked example: the same product, two shipping setups</h2>
      <p className={body}>Example product priced at <strong>{formatMoney(price)}</strong>, your actual carrier cost is <strong>{formatMoney(carrierCost)}</strong> per order (example — your cost is your number), and the referral fee is the verified US baseline of <strong>{percent(rate)}</strong> on the item price = <strong>{formatMoney(buyerPaid.referralFee)}</strong>.</p>
      <MoneyTable caption="Buyer-paid shipping compared with free shipping" columns={[`A: Buyer pays ${formatMoney(buyerShippingCharge)} shipping`, "B: Free shipping"]} rows={[
        { label: "Collected from buyer", values: [formatMoney(buyerPaid.collected), formatMoney(freeShipping.collected)] },
        { label: `− Referral fee (${percent(rate)})`, values: [formatMoney(buyerPaid.referralFee), formatMoney(freeShipping.referralFee)] },
        { label: "− Your actual shipping cost (example)", values: [formatMoney(carrierCost), formatMoney(carrierCost)] },
        { label: "Kept, before product cost", values: [formatMoney(buyerPaid.kept), formatMoney(freeShipping.kept)], total: true },
      ]} />
      <p className={body}>Two things to notice. First, in setup A the buyer &quot;paid for shipping&quot; but not all of it: the {formatMoney(carrierCost - buyerShippingCharge)} gap between the {formatMoney(buyerShippingCharge)} charge and your {formatMoney(carrierCost)} cost still came out of your side. Second, free shipping costs exactly the {formatMoney(buyerShippingCharge)} you stopped charging — <strong>{formatMoney(buyerShippingCharge)} per order, ${(buyerShippingCharge * orderVolume).toLocaleString("en-US")} across {orderVolume} orders</strong> — unless the price rises to cover it. To keep the same {formatMoney(buyerPaid.kept)} under free shipping you would need to price at about <strong>{formatMoney(coveringPrice)}</strong>, not {formatMoney(buyerPaid.collected)}, because the higher price also raises the {percent(rate)} referral fee a little.</p>
    </section>

    <section className={card} aria-labelledby="price-points-heading">
      <h2 id="price-points-heading" className="text-2xl font-bold">The same {formatMoney(carrierCost)} shipping cost at four price points</h2>
      <p className={body}>Shipping is a fixed cost per order, so it bites hardest where the price is lowest. Same example shipping cost of {formatMoney(carrierCost)} per order; referral fee at the verified US baseline of <strong>{percent(rate)}</strong>, with the widely reported {percent(referralRates.reported)} alongside it. &quot;Kept&quot; is price minus referral fee minus shipping, before product cost, affiliate commission and ads.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm">
        <caption className="sr-only">Shipping cost as a share of price at four example prices</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className="py-2">Item price</th>{[`Referral fee ${percent(rate)}`, `Referral fee ${percent(referralRates.reported)}`, `Kept at ${percent(rate)}`, `Kept at ${percent(referralRates.reported)}`, "Shipping as % of price"].map(column => <th key={column} scope="col" className={num}>{column}</th>)}</tr></thead>
        <tbody>{pricePoints.map(point => {
          const verified = keptAfterShipping({ price: point, shippingCost: carrierCost });
          const reported = keptAfterShipping({ price: point, shippingCost: carrierCost, referralRate: referralRates.reported });
          return <tr key={point} className="border-b last:border-0"><th scope="row" className="py-2 font-normal">{formatMoney(point)}</th><td className={num}>{formatMoney(verified.referralFee)}</td><td className={num}>{formatMoney(reported.referralFee)}</td><td className={num}>{formatMoney(verified.kept)}</td><td className={num}>{formatMoney(reported.kept)}</td><td className={num}>{percent(carrierCost / point, 1)}</td></tr>;
        })}</tbody>
      </table></div>
      <p className={body}>At {formatMoney(lowest)}, shipping alone is {percent(carrierCost / lowest)} of the price — before the referral fee, before the product itself. This is why low-ticket sellers feel shipping first, and why the per-sale breakdown matters most under $20.</p>
    </section>

    <section className={card} aria-labelledby="break-even-heading">
      <h2 id="break-even-heading" className="text-2xl font-bold">Free shipping break-even: how many more orders do you need?</h2>
      <p className={body}>Free shipping only pays if the extra orders it brings cover what it costs. Take the same {formatMoney(price)} item and run the full stack: product cost <strong>{formatMoney(productCost)}</strong> (example — your number), affiliate commission {percent(affiliateRate)} = <strong>{formatMoney(affiliate)}</strong> (example — your rate), referral fee {percent(rate)} = <strong>{formatMoney(buyerPaid.referralFee)}</strong>, shipping <strong>{formatMoney(carrierCost)}</strong> (example).</p>
      <MoneyTable caption="Full cost stack with buyer-paid shipping and with free shipping" columns={[`A: Buyer pays ${formatMoney(buyerShippingCharge)} shipping`, "B: Free shipping"]} rows={[
        { label: "Collected from buyer", values: [formatMoney(buyerPaid.collected), formatMoney(freeShipping.collected)] },
        { label: `− Referral fee (${percent(rate)})`, values: [formatMoney(buyerPaid.referralFee), formatMoney(freeShipping.referralFee)] },
        { label: "− Shipping cost (example)", values: [formatMoney(carrierCost), formatMoney(carrierCost)] },
        { label: "− Product cost (example)", values: [formatMoney(productCost), formatMoney(productCost)] },
        { label: `− Affiliate commission ${percent(affiliateRate)} (example)`, values: [formatMoney(affiliate), formatMoney(affiliate)] },
        { label: "Kept per order", values: [formatMoney(fullStack(buyerPaid.kept)), formatMoney(fullStack(freeShipping.kept))], total: true },
      ]} />
      <p className={body}>To break even, order volume has to rise by {formatMoney(fullStack(buyerPaid.kept))} ÷ {formatMoney(fullStack(freeShipping.kept))} − 1 = <strong>about {percent(breakEvenLift)}</strong>. If free shipping lifts your orders by less than that, it is a discount you did not mean to give; if it lifts them by more, it pays. Run the same division with your own numbers before you change a single listing.</p>
    </section>

    <section className={card} aria-labelledby="fbt-heading">
      <h2 id="fbt-heading" className="text-2xl font-bold">Fulfilled by TikTok (FBT) rates</h2>
      <p className="mt-2 text-sm text-slate-500">TikTok Shop US rate card effective {effective}. Source: <a className="underline" href={fbtRateCard.source.url} rel="noopener noreferrer">{fbtRateCard.source.title}</a>.</p>
      <h3 className="mt-6 font-semibold">What the FBT fulfillment fee covers</h3>
      <p className={body}>With FBT, TikTok stores your inventory and ships each order for you. The fulfillment fee is charged <strong>per unit</strong> and covers <strong>fulfillment</strong> (picking, packing and packaging materials) and <strong>delivery</strong> to the buyer. It takes the place of the carrier cost you would pay when you ship an order yourself. Storage is billed separately and is not part of this table.</p>
      <h3 className="mt-6 font-semibold">How to read the table</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
        <li><strong>Find your billable weight.</strong> If the item weighs {actualWeightOnly.maxLb} lb or less and its length × width × height is {actualWeightOnly.maxCubicInches} cubic inches or less, that is its actual weight. Otherwise it is the greater of actual weight and dimensional weight (length × width × height in inches ÷ {dimensionalDivisor}).</li>
        <li><strong>Pick the column for the number of units in the order.</strong> Every price is per unit. Under 15 lb, each unit costs less when the order holds more units; from 15 lb up, the price is the same for every order size.</li>
        <li><strong>Size limit.</strong> An item can weigh up to {maxItemLb} lb, with no side longer than {maxSideInches} inches.</li>
        <li>A few heavier tiers cost less than the tier just below them (for example {findFbtTier(81)!.label} at {formatMoney(fbtFeePerUnit(81)!)} versus {findFbtTier(80)!.label} at {formatMoney(fbtFeePerUnit(80)!)}). That is how the official card is published.</li>
      </ul>
      <div className="mt-6 max-h-[32rem] overflow-auto rounded-lg border" tabIndex={0} role="region" aria-label="FBT fulfillment fee rate table, scrollable">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">FBT fulfillment fee per unit by billable weight and units in the order, effective {effective}</caption>
          <thead className="sticky top-0 bg-slate-100"><tr><th scope="col" className="px-4 py-2">Billable weight</th>{fbtRateCard.orderSizes.map(size => <th key={size} scope="col" className={`${num} pr-4`}>{size}<span className="block text-xs font-normal text-slate-500">per unit</span></th>)}</tr></thead>
          <tbody>{fbtRateCard.tiers.map(tier => <tr key={tier.label} className="border-t"><th scope="row" className="whitespace-nowrap px-4 py-2 font-normal">{tier.label}</th>{tier.perUnit.map((fee, index) => <td key={index} className={`${num} pr-4`}>{formatMoney(fee)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <h3 className="mt-8 font-semibold">Worked comparison: the same item, seller-shipped vs FBT</h3>
      <p className={body}>Same {formatMoney(price)} item as above, sold one per order with free shipping for the buyer. Say it weighs {itemWeightOz} oz packed and is small enough to bill on actual weight (example — use your own item). Shipping it yourself costs the {formatMoney(carrierCost)} example carrier cost. With FBT it falls in the <strong>{exampleTier.label}</strong> tier: <strong>{formatMoney(fbt.fbt.shippingCost)}</strong> for a single-unit order, from the rate card above.</p>
      <MoneyTable caption="Seller-shipped example compared with FBT for one order" columns={["Seller-shipped (example)", "FBT"]} rows={[
        { label: "Collected from buyer", values: [formatMoney(fbt.sellerShipped.collected), formatMoney(fbt.fbt.collected)] },
        { label: `− Referral fee (${percent(rate)})`, values: [formatMoney(fbt.sellerShipped.referralFee), formatMoney(fbt.fbt.referralFee)] },
        { label: "− Carrier cost (example)", values: [formatMoney(carrierCost), "—"] },
        { label: `− FBT fulfillment fee (${exampleTier.label}, 1 unit order)`, values: ["—", formatMoney(fbt.fbt.shippingCost)] },
        { label: "Kept, before product cost", values: [formatMoney(fbt.sellerShipped.kept), formatMoney(fbt.fbt.kept)], total: true },
      ]} />
      <p className={body}>In this example FBT leaves {formatMoney(Math.abs(fbt.difference))} {fbt.difference >= 0 ? "more" : "less"} per order — but only the FBT figure is a published rate. The {formatMoney(carrierCost)} is an example: put your own average carrier cost, plus what you spend on boxes and packing, in the seller-shipped column. If the buyer orders two of the item, FBT charges {formatMoney(twoUnitFee)} per unit ({formatMoney(twoUnitFee * 2)} for the order). FBT storage is charged separately, so add it for stock that sits.</p>
    </section>

    <section className={card} aria-labelledby="margin-heading">
      <h2 id="margin-heading" className="text-2xl font-bold">Where shipping quietly eats the margin</h2>
      <p className={body}><strong>Pricing on referral fee alone.</strong> A {percent(rate)} fee sounds small; a {formatMoney(carrierCost)} shipping cost on a {formatMoney(price)} item is {percent(carrierCost / price)}. Sellers who price to cover &quot;the TikTok fee&quot; and treat shipping as an afterthought systematically underprice.</p>
      <p className={body}><strong>Returns.</strong> When an order is refunded, the outbound postage you already paid the carrier is generally gone. That is on top of TikTok&apos;s refund administration fee (20% of the referral fee, capped at $5 per SKU in the US).</p>
      <p className={body}><strong>Weight and distance.</strong> Your real per-order cost depends on your product&apos;s weight, dimensions and where your buyers live. Use your own average from your carrier invoices — a network-wide &quot;typical shipping cost&quot; would be a made-up number, and we do not publish those.</p>
    </section>

    <section className="mt-14" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
