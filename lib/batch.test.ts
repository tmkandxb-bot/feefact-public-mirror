import { describe, expect, it } from "vitest";
import { calcRow, DEFAULT_RATES, parseCells, SAMPLE_ROWS, SAMPLE_TEXT, serializeCells, summarize } from "./batch";
import { calcNetProfit as legacy } from "../src/calculator.js";

describe("batch SKU profit", () => {
  it("reads default rates from the calculator", () => {
    expect(DEFAULT_RATES).toEqual({ referral: 6, creator: 5, ads: 15 });
  });
  it("ships 5 sample rows that round-trip through the textarea", () => {
    expect(SAMPLE_ROWS).toHaveLength(5);
    expect(parseCells(SAMPLE_TEXT)).toEqual(SAMPLE_ROWS);
    expect(serializeCells(parseCells(SAMPLE_TEXT))).toBe(SAMPLE_TEXT);
  });
  it("matches the single-item calculator for a pasted row", () => {
    const [cells] = parseCells("TEE-1, 35, 8, 3.5, 6, 5, 15");
    expect(calcRow(cells).result).toMatchObject(legacy({}));
    expect(calcRow(cells).result?.net).toBeCloseTo(14.4);
  });
  it("hand-checked rows", () => {
    const mug = calcRow(parseCells("MUG, 20, 9, 4, 8, 10, 12")[0]).result!;
    expect(mug.totalFees).toBeCloseTo(6);
    expect(mug.net).toBeCloseTo(1);
    expect(mug.margin).toBeCloseTo(0.05);
    const loss = calcRow(parseCells("CASE, 12, 7, 3.5, 6, 5, 15")[0]).result!;
    expect(loss.net).toBeCloseTo(-1.62);
    expect(loss.margin).toBeCloseTo(-0.135);
  });
  it("uses calculator defaults for blank rates, skips a header, accepts $ and %", () => {
    const rows = parseCells("sku, price, product cost, shipping, referral %, creator %, ads %\nA, $35, 8, 3.5\nB\t35\t8\t3.5\t6%\t5%\t15%");
    expect(rows).toHaveLength(2);
    expect(calcRow(rows[0]).result).toMatchObject(legacy({}));
    expect(calcRow(rows[1]).result).toMatchObject(legacy({}));
  });
  it("flags bad rows instead of guessing", () => {
    expect(calcRow(parseCells("A, abc, 1, 1")[0]).error).toBeDefined();
    expect(calcRow(parseCells("A, -5, 1, 1")[0]).error).toBeDefined();
    expect(calcRow(parseCells("A, 10")[0]).error).toBeDefined();
  });
  it("summarizes totals, average margin and losing SKUs", () => {
    const summary = summarize(parseCells("A, 20, 9, 4, 8, 10, 12\nB, 12, 7, 3.5, 6, 5, 15\nC, oops, 1, 1").map(calcRow));
    expect(summary).toMatchObject({ count: 2, skipped: 1, losing: 1, sale: 32 });
    expect(summary.totalFees).toBeCloseTo(9.12);
    expect(summary.net).toBeCloseTo(-0.62);
    expect(summary.averageMargin).toBeCloseTo((0.05 - 0.135) / 2);
  });
});
