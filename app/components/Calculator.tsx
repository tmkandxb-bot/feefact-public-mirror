"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { calcProcessingFee, parseSale } from "../../lib/calc";
import { formatMoney, type ProcessingFee } from "../../lib/fees";

export default function Calculator({ fee }: { fee: ProcessingFee }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSale = searchParams.get("sale");
  const [sale, setSale] = useState(() => String(parseSale(urlSale)));
  useEffect(() => { setSale(String(parseSale(urlSale))); }, [urlSale]);
  const result = useMemo(() => calcProcessingFee(parseSale(sale), fee), [sale, fee]);

  function updateSale(value: string) {
    setSale(value);
    const params = new URLSearchParams(window.location.search);
    params.set("sale", String(parseSale(value)));
    window.history.replaceState(null, "", `${pathname}?${params.toString()}${window.location.hash}`);
  }

  return <div>
    <label htmlFor="sale" className="mb-2 block text-sm font-semibold">Sale price (USD)</label>
    <input id="sale" type="number" min="0" step="0.01" value={sale} onChange={event => updateSale(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
    <p className="mt-2 text-xs text-slate-500">Share this page’s URL to share your calculation. Empty or invalid amounts use the default sale.</p>
    <dl aria-live="polite" className="mt-6 space-y-4">
      <div className="flex justify-between"><dt>{fee.name} fee</dt><dd>{formatMoney(result.processingFee, fee.currency)}</dd></div>
      <div className="flex justify-between border-t pt-4 text-xl font-bold"><dt>Net profit</dt><dd className="text-indigo-700">{formatMoney(result.net, fee.currency)}</dd></div>
    </dl>
    <p className="mt-4 text-sm text-slate-500">After processing fees only. Excludes product costs, shipping, taxes and other charges.</p>
  </div>;
}
