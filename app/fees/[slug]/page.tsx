import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Calculator from "../../components/Calculator";
import { calcProcessingFee } from "../../../lib/calc";
import { describeFee, fees, formatMoney } from "../../../lib/fees";

export const dynamicParams = false;

export function generateStaticParams() {
  return fees.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const fee = fees.find(entry => entry.slug === params.slug);
  return { title: fee ? `${fee.name} Fees & Calculator | FeeFact` : "Fee not found" };
}

export default function FeePage({ params }: { params: { slug: string } }) {
  const fee = fees.find(entry => entry.slug === params.slug);
  if (!fee) notFound();
  const faqs = [
    { question: `How much does ${fee.name} charge per transaction?`, answer: `${fee.name} charges ${describeFee(fee)} per transaction for ${fee.scope.toLowerCase()}. Other payment methods and international cards may cost more.` },
    { question: `How do I calculate my net after ${fee.name} fees?`, answer: `Multiply your sale price by ${Number((fee.rate * 100).toFixed(4))}%, add ${formatMoney(fee.fixed, fee.currency)}, then subtract that processing fee from your sale price. This excludes other business costs.` },
  ];
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

  return <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-700">Payment fees, made clear</p>
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{fee.name} fees & calculator</h1>
    <p className="mt-5 max-w-2xl text-lg text-slate-600">Understand what each sale costs, and see exactly what you keep.</p>
    <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
      <section className="rounded-2xl border bg-white p-6 sm:p-8" aria-labelledby="rates-heading">
        <h2 id="rates-heading" className="text-xl font-semibold">A simple rate per transaction</h2>
        <p className="mt-4 text-3xl font-bold text-indigo-700">{describeFee(fee)}</p>
        <p className="mt-3 text-sm text-slate-500">{fee.scope}. All amounts in {fee.currency}.</p>
        <table className="mt-8 w-full text-left text-sm">
          <caption className="mb-3 text-left font-semibold">What that looks like per sale</caption>
          <thead><tr className="border-b text-slate-500"><th scope="col" className="py-3">Sale</th><th scope="col">Fee</th><th scope="col" className="text-right">You keep</th></tr></thead>
          <tbody>{[10, 25, 100].map(sale => {
            const result = calcProcessingFee(sale, fee);
            return <tr key={sale} className="border-b last:border-0"><td className="py-4">{formatMoney(sale, fee.currency)}</td><td>{formatMoney(result.processingFee, fee.currency)}</td><td className="text-right font-semibold">{formatMoney(result.net, fee.currency)}</td></tr>;
          })}</tbody>
        </table>
      </section>
      <section className="rounded-2xl border bg-white p-6 sm:p-8" aria-labelledby="calculator-heading">
        <h2 id="calculator-heading" className="mb-6 text-xl font-semibold">Calculate your take-home</h2>
        <Suspense fallback={<p className="min-h-64 text-slate-500">Loading calculator…</p>}><Calculator fee={fee} /></Suspense>
      </section>
    </div>
    <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-bold">Frequently asked questions</h2>{faqs.map(faq => <div key={faq.question} className="mt-6"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p></div>)}</section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </main>;
}
