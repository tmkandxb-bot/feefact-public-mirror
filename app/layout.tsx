import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeeFact | Clear fees, confident decisions",
  description: "Understand payment processing fees and calculate what you keep.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased">
    <header className="border-b bg-white"><nav aria-label="Main" className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-xl font-bold tracking-tight">Fee<span className="text-indigo-700">Fact</span></Link>
      <div className="flex gap-6"><Link href="/tools/batch-sku-profit" className="text-sm font-medium text-slate-600">Batch SKU profit</Link>
      <Link href="/fees/stripe" className="text-sm font-medium text-slate-600">Stripe fees</Link>
      <Link href="/tiktok-shop-refund-fee" className="text-sm font-medium text-slate-600">TikTok Shop refund fee</Link></div>
    </nav></header>
    {children}
    <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500">Estimates for planning. Confirm current pricing with your payment provider.</footer>
  </body></html>;
}
