import { calcNetProfit } from "./calc";

export const COLUMNS = ["sku", "price", "product cost", "shipping", "referral %", "creator %", "ads %"] as const;

// Percentages the single-item calculator uses when a rate is left blank, read from calcNetProfit itself.
const perHundred = calcNetProfit({ sale: 100 });
const percent = (value: number) => Number(value.toPrecision(12));
export const DEFAULT_RATES = { referral: percent(perHundred.referral), creator: percent(perHundred.creator), ads: percent(perHundred.ads) };

// Example rows only. Prices and costs are made up for illustration; the rates are the calculator defaults.
export const SAMPLE_ROWS: readonly string[][] = [
  ["SAMPLE-TEE", 35, 8, 3.5],
  ["SAMPLE-MUG", 18, 6, 4],
  ["SAMPLE-CASE", 12, 7, 3.5],
  ["SAMPLE-LAMP", 60, 22, 7],
  ["SAMPLE-SOCKS", 9.99, 2.5, 3],
].map(row => [...row, DEFAULT_RATES.referral, DEFAULT_RATES.creator, DEFAULT_RATES.ads].map(String));

// Tab-separated lines (spreadsheet paste) split on tabs only, so "1,200" stays one cell; CSV lines honor double quotes.
const splitCsv = (line: string) => {
  const cells: string[] = [];
  let cell = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char !== '"') cell += char;
      else if (line[i + 1] === '"') { cell += '"'; i++; }
      else quoted = false;
    } else if (char === '"' && cell.trim() === "") { cell = ""; quoted = true; }
    else if (char === ",") { cells.push(cell); cell = ""; }
    else cell += char;
  }
  return [...cells, cell];
};
const splitLine = (line: string) => line.includes("\t") ? line.split("\t") : splitCsv(line);

export const parseCells = (text: string) => text.split(/\r?\n/).filter(line => line.trim() !== "").map(line => {
  const cells = splitLine(line).map(cell => cell.trim());
  return [...cells, ...COLUMNS.slice(cells.length).map(() => "")];
}).filter((cells, index) => !(index === 0 && cells[0].toLowerCase() === COLUMNS[0] && cells[1].toLowerCase() === COLUMNS[1]));

const serializeCell = (cell: string) => {
  const clean = cell.replace(/[\t\r\n]/g, " ");
  return /[,"]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
};
export const serializeCells = (rows: readonly string[][]) => rows.map(cells => cells.map(serializeCell).join(", ")).join("\n");

export const SAMPLE_TEXT = serializeCells(SAMPLE_ROWS);

const toNumber = (cell: string) => {
  const cleaned = cell.replace(/[$%,\s]/g, "");
  if (cleaned === "") return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : NaN;
};

export type SkuResult = { sku: string; error?: string; result?: ReturnType<typeof calcNetProfit> & { cogs: number; shipping: number } };

export function calcRow(cells: readonly string[]): SkuResult {
  const sku = cells[0] ?? "";
  if (cells.length > COLUMNS.length) return { sku, error: `Too many columns: expected ${COLUMNS.length}. Remove commas inside numbers` };
  const [sale, cogs, shipping, referral, creator, ads] = cells.slice(1, 7).map(cell => toNumber(cell ?? ""));
  if ([sale, cogs, shipping, referral, creator, ads].some(Number.isNaN)) return { sku, error: "Numbers must be 0 or more" };
  if (sale === undefined || cogs === undefined || shipping === undefined) return { sku, error: "Price, product cost and shipping are required" };
  const rate = (value: number | undefined) => value === undefined ? undefined : value / 100;
  const result = calcNetProfit({ sale, cogs, shipping, referralRate: rate(referral), creatorRate: rate(creator), adsRate: rate(ads) });
  return { sku, result: { ...result, cogs, shipping } };
}

export function summarize(rows: readonly SkuResult[]) {
  const results = rows.flatMap(row => row.result ? [row.result] : []);
  const sum = (pick: (result: NonNullable<SkuResult["result"]>) => number) => results.reduce((total, result) => total + pick(result), 0);
  const margins = results.map(result => result.margin).filter(Number.isFinite);
  return {
    count: results.length,
    skipped: rows.length - results.length,
    losing: results.filter(result => result.net < 0).length,
    sale: sum(r => r.sale), cogs: sum(r => r.cogs), shipping: sum(r => r.shipping),
    referral: sum(r => r.referral), creator: sum(r => r.creator), ads: sum(r => r.ads),
    totalFees: sum(r => r.totalFees), net: sum(r => r.net),
    averageMargin: margins.length ? margins.reduce((total, margin) => total + margin, 0) / margins.length : NaN,
  };
}
