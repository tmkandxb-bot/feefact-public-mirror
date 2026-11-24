import type { Metadata } from "next";
import { changes, examples, feeAtRates, rates, sources, verifiedOn, type SourceKey } from "../../lib/feeChanges";
import { formatMoney } from "../../lib/fees";

const description = "A dated log of TikTok Shop fee changes and reported changes, verified against official tables. US referral 6% vs reported 8%, UK/EU 9% — what changed and when.";

export const metadata: Metadata = {
  title: "TikTok Shop Fee Changes — Verified Change Log & Alerts | FeeFact",
  description,
  alternates: { canonical: "https://feefact.com/tiktok-shop-fee-changes/" },
};

const link = "font-semibold text-indigo-700 underline";
const card = "mt-8 rounded-2xl border bg-white p-6 sm:p-8";
const body = "mt-4 leading-relaxed text-slate-700";
const note = "mt-4 text-sm leading-relaxed text-slate-500";
const cell = "py-2 pr-4";
const num = "py-2 pl-4 text-right tabular-nums";
const percent = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;
const euro = (amount: number) => `€${amount.toFixed(2)}`;

function Source({ id, children }: { id: SourceKey; children?: React.ReactNode }) {
  return <a className="underline" href={sources[id].url} rel="noopener noreferrer" target="_blank">{children ?? sources[id].title}</a>;
}

export default function FeeChangesPage() {
  const { us, auction, uk, eu } = rates;
  const [usFee, usReportedFee] = feeAtRates(examples.usOrder, [us.standard, us.reported]);
  const usGap = Math.round((usReportedFee - usFee) * 100) / 100;
  const [auctionStandard, auctionNew, auctionExisting] = feeAtRates(examples.auctionOrder, [us.standard, auction.newSeller, auction.existingSellerHighValue]);
  const [euStandard, euTierOne, euTierTwo] = feeAtRates(examples.euOrder, [eu.standard, eu.newSellerTierOne, eu.newSellerTierTwo]);
  const usd0 = (amount: number) => `$${amount.toLocaleString("en-US")}`;

  const faqs = [
    { question: "What is the TikTok Shop referral fee in the US right now?", answer: `When we last checked on ${verifiedOn}, TikTok's published US table listed ${percent(us.standard)} for most categories, ${percent(us.jewelryAndPreOwned)} for five fine-jewelry sub-categories and for Pre-Owned, and ${percent(us.overTenThousand)} on the part of a Collectibles or Pre-Owned sale above ${usd0(us.highValueThreshold)}. Since August 2026 sellers have reported an effective ${percent(us.reported)} on settlement lines; that figure is not in the published table.` },
    { question: "What do Official and Reported mean in this log?", answer: "Official means we read the rate or change on a TikTok Shop Seller University page, which is linked in the entry. Reported means sellers say they are being charged it, but we could not find it on an official page. We never mark a number Official without a TikTok page to point to." },
    { question: "Did TikTok Shop raise the US referral fee to 8%?", answer: `TikTok's published table still lists ${percent(us.standard)} for most categories. The ${percent(us.reported)} figure comes from seller reports of settlement lines since August 2026, so it is logged here as Reported. The way to know what your account is charged is to check the referral fee line on your own settlement against the order amount.` },
    { question: "When does the Seller LIVE Auction fee reduction end?", answer: `It runs from October 1 to December 31, 2026 (Pacific Time). It covers auctions with a ${formatMoney(auction.startingBid)} starting bid: ${percent(auction.newSeller)} for qualifying new auction sellers and ${percent(auction.existingSellerHighValue)} for existing sellers on orders of ${usd0(auction.jewelryMinimum)} and up in jewelry or ${usd0(auction.otherMinimum)} and up in the other targeted categories, up to ${usd0(auction.weeklyCap)} of qualified auction sales per seller per week. Other orders stay at the standard rate.` },
    { question: "What changed in FBT fees on November 1, 2026?", answer: "TikTok lowered the fulfillment fee for single-unit items in the 70 lb to 150 lb tiers and changed the Exit Inventory Shipping Fee. The per-unit rate card is on our shipping fees page." },
    { question: "Is there a pre-order fee on TikTok Shop US?", answer: `We could not find one on an official US page, so none is listed here. What the US pages do confirm is that eligible sellers can now switch Pre-Order and Made-to-Order on themselves, and that Pre-Order handling time can be set from 3 to 60 calendar days. TikTok Shop Singapore publishes a 1.09% pre-order service fee; that is a Singapore rate.` },
    { question: "What is the TikTok Shop commission in the UK and EU?", answer: `${percent(uk.standard)} in the UK and ${percent(eu.standard)} in the EU, both including VAT. Lower rates exist: in the EU, ${percent(eu.electronics)} for listed Electronics categories, and ${percent(eu.newSellerTierOne)} for ${eu.newSellerTierOneDays} days or ${percent(eu.newSellerTierTwo)} for ${eu.newSellerTierTwoDays} days for eligible new sellers, depending on the country. The UK page also lists lower rates for new sellers and some categories.` },
    { question: "How often is this log updated?", answer: `We re-verify rates monthly and add an entry whenever a change can be confirmed. The last verification was ${verifiedOn}.` },
  ];
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

  return <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
    <h1 className="text-4xl font-bold tracking-tight">TikTok Shop Fee Change Log</h1>
    <p className="mt-5 text-lg text-slate-600">Every fee change we can verify, dated and labeled: <strong>Official</strong> means it is in TikTok&apos;s published tables; <strong>Reported</strong> means sellers are charged it but the table hasn&apos;t caught up.</p>
    <p className="mt-3 text-sm text-slate-500">Maintained by FeeFact · We re-verify rates monthly · Rates last verified: {verifiedOn}</p>
    <p className="mt-6 font-semibold leading-relaxed">The short answer: at the last verification on {verifiedOn}, the US published table still lists {percent(us.standard)} for most categories (sellers report an effective {percent(us.reported)} since August 2026) and UK/EU standard referral is {percent(uk.standard)}. Every change we verify is logged on this page.</p>

    <section className={card} aria-labelledby="log-heading">
      <h2 id="log-heading" className="text-2xl font-bold">Change log: what changed and when</h2>
      <p className={body}>Newest first. Each Official entry links to the TikTok Shop page it was read on.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm">
        <caption className="sr-only">Dated TikTok Shop fee changes with market, status and source</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={cell}>Date</th><th scope="col" className={cell}>Market</th><th scope="col" className={cell}>Change</th><th scope="col" className="py-2 text-right">Status</th></tr></thead>
        <tbody>{changes.map(entry => <tr key={entry.date + entry.change} className="border-b align-top last:border-0">
          <td className={`${cell} whitespace-nowrap`}>{entry.date}</td>
          <td className={cell}>{entry.market}</td>
          <td className={cell}>{entry.change}{entry.source && <> <Source id={entry.source}>Source</Source>.</>}</td>
          <td className="py-2 text-right">{entry.status}</td>
        </tr>)}</tbody>
      </table></div>
      <p className={note}>The full FBT rate card is on the <a className={link} href="/tiktok-shop-shipping-fees/">shipping fees page</a>. Think a rate changed? The fastest way to know for your account is to <a className={link} href="/tiktok-shop-settlement-checker/">audit your latest settlement</a> — it shows the rate you were actually charged, line by line.</p>
    </section>

    <section className={card} aria-labelledby="stack-heading">
      <h2 id="stack-heading" className="text-2xl font-bold">The TikTok Shop fee stack today</h2>
      <p className={body}>Where each fee stands after the changes above, as published on {verifiedOn}.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm">
        <caption className="sr-only">Current TikTok Shop fees by market with official source</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className={cell}>Fee</th><th scope="col" className={cell}>Market</th><th scope="col" className={cell}>Published rate</th><th scope="col" className="py-2">Source</th></tr></thead>
        <tbody className="[&>tr]:border-b [&>tr]:align-top [&>tr:last-child]:border-0">
          <tr><th scope="row" className={`${cell} font-normal`}>Referral fee, most categories</th><td className={cell}>US</td><td className={cell}>{percent(us.standard)} of customer payment + platform discount − tax (buyer-paid shipping is included)</td><td className="py-2"><Source id="usReferral">Referral Fees by Category</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Referral fee, five fine-jewelry sub-categories and Pre-Owned</th><td className={cell}>US</td><td className={cell}>{percent(us.jewelryAndPreOwned)}</td><td className="py-2"><Source id="usReferral">Referral Fees by Category</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Referral fee, Collectibles and Pre-Owned, part of a sale above {usd0(us.highValueThreshold)}</th><td className={cell}>US</td><td className={cell}>{percent(us.overTenThousand)}</td><td className="py-2"><Source id="usReferral">Referral Fees by Category</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Seller LIVE Auction referral fee (until December 31, 2026)</th><td className={cell}>US</td><td className={cell}>{percent(auction.newSeller)} for qualifying new auction sellers; {percent(auction.existingSellerHighValue)} for existing sellers on high-value orders</td><td className="py-2"><Source id="usAuction">Q4 auction policy</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>FBT fulfillment fee</th><td className={cell}>US</td><td className={cell}>Per unit, by billable weight and units in the order — see the <a className={link} href="/tiktok-shop-shipping-fees/">shipping fees page</a></td><td className="py-2"><Source id="usFbt">FBT Rate Card</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Package Signature Service (optional)</th><td className={cell}>US</td><td className={cell}>{formatMoney(rates.signatureService)} per package</td><td className="py-2"><Source id="usLogistics">Logistics &amp; Fulfillment</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Commission fee</th><td className={cell}>UK</td><td className={cell}>{percent(uk.standard)}, VAT included; lower rates for new sellers and some categories</td><td className="py-2"><Source id="ukCommission">UK commission rates</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Commission fee</th><td className={cell}>EU</td><td className={cell}>{percent(eu.standard)}, VAT included; {percent(eu.electronics)} for listed Electronics categories</td><td className="py-2"><Source id="euCommission">EU commission policy</Source></td></tr>
          <tr><th scope="row" className={`${cell} font-normal`}>Commission fee, eligible new sellers</th><td className={cell}>EU</td><td className={cell}>{percent(eu.newSellerTierOne)} for {eu.newSellerTierOneDays} days or {percent(eu.newSellerTierTwo)} for {eu.newSellerTierTwoDays} days, by country</td><td className="py-2"><Source id="euCommission">EU commission policy</Source></td></tr>
        </tbody>
      </table></div>
      <p className={note}>Related pages: <a className="underline" href="/tiktok-shop-refund-fee/">refund administration fee</a> · <a className="underline" href="/tiktok-shop-affiliate-commission/">affiliate commission</a> · <a className="underline" href="/tiktok-shop-fees/">all TikTok Shop fees</a>.</p>
    </section>

    <section className={card} aria-labelledby="examples-heading">
      <h2 id="examples-heading" className="text-2xl font-bold">Worked examples: what each change does to one order</h2>
      <p className={body}>The order amounts are examples; the rates are the published ones above. Each fee is the order amount times the rate.</p>

      <h3 className="mt-6 font-semibold">1. US referral fee: published {percent(us.standard)} vs reported {percent(us.reported)}</h3>
      <p className={body}>On a {formatMoney(examples.usOrder)} order, {percent(us.standard)} is <strong>{formatMoney(usFee)}</strong> and {percent(us.reported)} is <strong>{formatMoney(usReportedFee)}</strong>. The gap is {formatMoney(usGap)} per order, or {formatMoney(usGap * examples.usMonthlyOrders)} across {examples.usMonthlyOrders} orders. That is why it is worth checking which rate your settlement shows.</p>

      <h3 className="mt-6 font-semibold">2. Seller LIVE Auction: a {formatMoney(examples.auctionOrder)} qualifying auction order</h3>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
        <caption className="sr-only">Referral fee on an example auction order at the standard and reduced rates</caption>
        <thead><tr className="border-b text-slate-500"><th scope="col" className="py-2">Seller</th><th scope="col" className={num}>Rate</th><th scope="col" className={num}>Referral fee</th><th scope="col" className={num}>Saved</th></tr></thead>
        <tbody>
          <tr className="border-b"><th scope="row" className="py-2 font-normal">Standard rate (order does not qualify)</th><td className={num}>{percent(us.standard)}</td><td className={num}>{formatMoney(auctionStandard)}</td><td className={num}>—</td></tr>
          <tr className="border-b"><th scope="row" className="py-2 font-normal">Qualifying new auction seller</th><td className={num}>{percent(auction.newSeller)}</td><td className={num}>{formatMoney(auctionNew)}</td><td className={num}>{formatMoney(auctionStandard - auctionNew)}</td></tr>
          <tr><th scope="row" className="py-2 font-normal">Existing seller, high-value order in a targeted category other than jewelry</th><td className={num}>{percent(auction.existingSellerHighValue)}</td><td className={num}>{formatMoney(auctionExisting)}</td><td className={num}>{formatMoney(auctionStandard - auctionExisting)}</td></tr>
        </tbody>
      </table></div>
      <p className={body}>The example assumes a category whose standard rate is {percent(us.standard)} and an auction that started at {formatMoney(auction.startingBid)}. The reduction applies automatically, is not retroactive, and stops at {usd0(auction.weeklyCap)} of qualified auction sales per week.</p>

      <h3 className="mt-6 font-semibold">3. EU new seller: a {euro(examples.euOrder)} order</h3>
      <p className={body}>At the standard {percent(eu.standard)} the commission is <strong>{euro(euStandard)}</strong>. An eligible new seller who completed the mission pays <strong>{euro(euTierOne)}</strong> at {percent(eu.newSellerTierOne)} (France, Germany, Spain, Italy, Ireland; {eu.newSellerTierOneDays} days) or <strong>{euro(euTierTwo)}</strong> at {percent(eu.newSellerTierTwo)} (the other eight eligible countries; {eu.newSellerTierTwoDays} days). After that period the rate goes back to {percent(eu.standard)}.</p>
    </section>

    <section className={card} aria-labelledby="labels-heading">
      <h2 id="labels-heading" className="text-2xl font-bold">How we label and verify changes</h2>
      <p className={body}><strong>Official.</strong> We read it on a TikTok Shop Seller University page and link that page. If a page for another country states a rate, we log it for that country only.</p>
      <p className={body}><strong>Reported.</strong> Sellers say they are charged it, but no official page states it. We keep these in the log, clearly labeled, because they affect what you are paid.</p>
      <p className={body}><strong>Left out.</strong> If we cannot find a number on an official page and cannot label it honestly, it is not on this page. Example: TikTok Shop Singapore publishes a 1.09% pre-order service fee (<Source id="sgCommission">Singapore commission page</Source>); we found no US page stating a pre-order fee, so the log lists none for the US. The US pages confirm only that eligible sellers can activate Pre-Order and Made-to-Order themselves and that Pre-Order handling time can be 3 to 60 calendar days (<Source id="usLogistics">Logistics &amp; Fulfillment</Source>).</p>
    </section>

    <section className={card} aria-labelledby="check-heading">
      <h2 id="check-heading" className="text-2xl font-bold">How to check the rate you are actually charged</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-slate-700">
        <li>Open a recent settlement and pick one order.</li>
        <li>Work out the fee base: customer payment plus platform discount, minus tax. Include any shipping the buyer paid.</li>
        <li>Divide the referral fee on that line by the base. Compare the result with the rate for your category in the table above.</li>
        <li>If it does not match, check whether a temporary program applies to that order (for example the auction reduction) before raising it with TikTok Shop support.</li>
      </ol>
      <p className={note}>To do this for every line at once, use the <a className={link} href="/tiktok-shop-settlement-checker/">Settlement Checker</a>.</p>
    </section>

    <section className={card} aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-2xl font-bold">Official sources</h2>
      <p className={body}>All read on {verifiedOn}.</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">{Object.entries(sources).map(([id, source]) => <li key={id}><Source id={id as SourceKey} /> — page dated {source.pageDate}</li>)}</ul>
    </section>

    <section className="mt-14" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>

    <div className="mt-10 rounded-2xl bg-slate-900 p-6 text-white sm:p-8"><strong>Fee-change alerts</strong><p className="mt-2 leading-relaxed">When TikTok changes a rate, we re-verify every number on FeeFact and note it here first. The email alert list opens soon — bookmark this page and check back after each settlement cycle.</p></div>

    <div className={card}>
      <strong>Related FeeFact tools</strong>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <a className="block rounded-xl border p-4 hover:border-slate-900" href="/tiktok-shop-settlement-checker/"><h3 className="font-semibold">Settlement Checker</h3><p className="mt-1 text-sm text-slate-500">Audit your settlement CSV line by line for wrong referral rates.</p></a>
        <a className="block rounded-xl border p-4 hover:border-slate-900" href="/"><h3 className="font-semibold">Profit Calculator</h3><p className="mt-1 text-sm text-slate-500">Stack every fee and see what you keep — per sale and per month.</p></a>
        <a className="block rounded-xl border p-4 hover:border-slate-900" href="/tiktok-shop-referral-fee/"><h3 className="font-semibold">Referral Fee: 6% or 8%?</h3><p className="mt-1 text-sm text-slate-500">Why both numbers circulate, and how to model the gap.</p></a>
      </div>
      <p className={note}>All tools: <a className="underline" href="/">Profit Calculator + Settlement Checker</a> · <a className="underline" href="/tiktok-shop-settlement-checker/">Settlement Checker</a> · <a className="underline" href="/tiktok-shop-fee-calculator-uk/">UK Calculator</a> · <a className="underline" href="/tiktok-shop-fee-calculator-eu/">EU Calculator</a> · <a className="underline" href="/tiktok-shop-fees/">All TikTok Shop Fees</a> · <a className="underline" href="/tiktok-shop-fee-changes/">Fee Change Log</a> · <a className="underline" href="/tiktok-shop-affiliate-commission/">Affiliate Commission</a> · <a className="underline" href="/tiktok-shop-shipping-fees/">Shipping Fees</a></p>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
