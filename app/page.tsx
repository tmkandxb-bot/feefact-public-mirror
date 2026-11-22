import Link from "next/link";

export default function Home() {
  return <main className="mx-auto max-w-5xl px-6 py-16"><h1 className="text-4xl font-bold">Know your fees. Know your profit.</h1><p className="my-6 text-slate-600">Clear payment processing rates and calculators for online sellers.</p><Link className="font-semibold text-indigo-700 underline" href="/fees/stripe">Explore Stripe fees →</Link><Link className="ml-6 font-semibold text-indigo-700 underline" href="/tiktok-shop-refund-fee">TikTok Shop refund fee & return shipping →</Link></main>;
}
