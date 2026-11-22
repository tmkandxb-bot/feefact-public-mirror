"use client";

import { useMemo, useState } from "react";
import { calcRow, COLUMNS, DEFAULT_RATES, parseCells, SAMPLE_TEXT, serializeCells, summarize } from "../../lib/batch";
import { formatMoney } from "../../lib/fees";

const formatPercent = (value: number) => Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—";
const placeholders = ["SKU", "0.00", "0.00", "0.00", String(DEFAULT_RATES.referral), String(DEFAULT_RATES.creator), String(DEFAULT_RATES.ads)];
const emptyRow = COLUMNS.map(() => "");

export default function BatchSkuProfit() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const rows = useMemo(() => parseCells(text), [text]);
  const results = useMemo(() => rows.map(calcRow), [rows]);
  const summary = useMemo(() => summarize(results), [results]);
  const isSample = text === SAMPLE_TEXT;
  const setRows = (next: string[][]) => setText(serializeCells(next));
  const cell = "px-2 py-2 text-right tabular-nums";

  return <div>
    <label htmlFor="rows" className="mb-2 block text-sm font-semibold">Paste your SKUs, one per line</label>
    <p className="mb-2 text-sm text-slate-500">Format: <code>{COLUMNS.join(", ")}</code>. Leave a rate blank to use the single-item calculator default ({DEFAULT_RATES.referral}% referral, {DEFAULT_RATES.creator}% creator, {DEFAULT_RATES.ads}% ads).</p>
    {isSample && <p role="note" className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">These 5 rows are SAMPLE examples, not real products or fee quotes. Paste your own rows to replace them.</p>}
    <textarea id="rows" rows={7} spellCheck={false} value={text} onChange={event => setText(event.target.value)}
      onPaste={event => { if (isSample) { event.preventDefault(); setText(event.clipboardData.getData("text")); } }}
      className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
    <div className="mt-3 flex flex-wrap gap-3 text-sm">
      <button type="button" onClick={() => setRows([...rows, emptyRow])} className="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white">Add row</button>
      <button type="button" onClick={() => setText("")} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">Clear all</button>
      <button type="button" onClick={() => setText(SAMPLE_TEXT)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">Load sample rows</button>
    </div>

    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[60rem] text-left text-sm">
        <caption className="mb-3 text-left font-semibold">Profit per SKU{isSample ? " (sample rows)" : ""}</caption>
        <thead><tr className="border-b text-slate-500">
          {COLUMNS.map(column => <th key={column} scope="col" className="px-2 py-3 capitalize">{column}</th>)}
          {["Referral fee", "Creator commission", "Ads", "Total fees", "Net profit", "Margin"].map(column => <th key={column} scope="col" className="px-2 py-3 text-right">{column}</th>)}
          <th scope="col"><span className="sr-only">Remove</span></th>
        </tr></thead>
        <tbody aria-live="polite">{rows.map((cells, rowIndex) => {
          const { result, error } = results[rowIndex];
          const losing = result !== undefined && result.net < 0;
          return <tr key={rowIndex} className={`border-b ${losing ? "bg-red-50" : ""}`}>
            {cells.map((value, columnIndex) => <td key={columnIndex} className="px-1 py-1">
              <input aria-label={`${COLUMNS[columnIndex]}, row ${rowIndex + 1}`} value={value} placeholder={placeholders[columnIndex]} inputMode={columnIndex === 0 ? "text" : "decimal"}
                onChange={event => setRows(rows.map((row, index) => index === rowIndex ? row.map((old, column) => column === columnIndex ? event.target.value.replace(/,/g, "") : old) : row))}
                className={`w-full rounded border border-slate-200 bg-white px-2 py-1 ${columnIndex === 0 ? "min-w-[7rem]" : "min-w-[4.5rem] text-right"}`} />
            </td>)}
            {result ? <>
              <td className={cell}>{formatMoney(result.referral)}</td>
              <td className={cell}>{formatMoney(result.creator)}</td>
              <td className={cell}>{formatMoney(result.ads)}</td>
              <td className={cell}>{formatMoney(result.totalFees)}</td>
              <td className={`${cell} font-semibold ${losing ? "text-red-700" : ""}`}>{formatMoney(result.net)}{losing && <span className="ml-2 rounded bg-red-700 px-1.5 py-0.5 text-xs font-semibold text-white">Losing money</span>}</td>
              <td className={`${cell} ${losing ? "text-red-700" : ""}`}>{formatPercent(result.margin)}</td>
            </> : <td colSpan={6} className="px-2 py-2 text-right text-amber-800">{error}</td>}
            <td className="px-1"><button type="button" aria-label={`Remove row ${rowIndex + 1}`} onClick={() => setRows(rows.filter((_, index) => index !== rowIndex))} className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button></td>
          </tr>;
        })}</tbody>
        <tfoot><tr className="border-t-2 font-bold">
          <th scope="row" className="px-2 py-3">Total ({summary.count} SKU{summary.count === 1 ? "" : "s"})</th>
          <td className={cell}>{formatMoney(summary.sale)}</td>
          <td className={cell}>{formatMoney(summary.cogs)}</td>
          <td className={cell}>{formatMoney(summary.shipping)}</td>
          <td colSpan={3} />
          <td className={cell}>{formatMoney(summary.referral)}</td>
          <td className={cell}>{formatMoney(summary.creator)}</td>
          <td className={cell}>{formatMoney(summary.ads)}</td>
          <td className={cell}>{formatMoney(summary.totalFees)}</td>
          <td className={`${cell} ${summary.net < 0 ? "text-red-700" : "text-indigo-700"}`}>{formatMoney(summary.net)}</td>
          <td className={cell}>{formatPercent(summary.averageMargin)}<span className="block text-xs font-normal text-slate-500">average margin</span></td>
          <td />
        </tr></tfoot>
      </table>
    </div>
    <p className="mt-3 text-sm text-slate-500">
      {summary.losing > 0 && <span className="font-semibold text-red-700">{summary.losing} SKU{summary.losing === 1 ? " is" : "s are"} losing money. </span>}
      {summary.skipped > 0 && <span className="text-amber-800">{summary.skipped} row{summary.skipped === 1 ? "" : "s"} skipped because of missing or invalid numbers. </span>}
      Each row is one unit sold. Average margin is the simple average of the per-SKU margins. Everything is calculated in your browser.
    </p>
  </div>;
}
