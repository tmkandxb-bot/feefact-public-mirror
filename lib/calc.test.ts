import { describe, expect, it } from "vitest";
import { calcNetProfit, calcProcessingFee, parseSale } from "./calc";
import { fees } from "./fees";
import { calcNetProfit as legacy } from "../src/calculator.js";

describe("calcNetProfit", () => {
  it("preserves the actual legacy defaults", () => {
    expect(calcNetProfit({})).toEqual(legacy({}));
    expect(calcNetProfit({}).net).toBeCloseTo(14.4);
  });
  it("preserves custom inputs, zero sales and negative profit", () => {
    for (const input of [{ sale: 0 }, { sale: 10, cogs: 30 }, { sale: 100, referralRate: 0.1, creatorRate: 0, adsRate: 0, shipping: 0 }]) {
      expect(calcNetProfit(input)).toEqual(legacy(input));
    }
  });
});

describe("calcProcessingFee", () => {
  it.each([[10, 0.59, 9.41], [25, 1.03, 23.97], [100, 3.2, 96.8], [0, 0.3, -0.3]])("calculates sale %s", (sale, processingFee, net) => {
    expect(calcProcessingFee(sale, fees[0])).toEqual({ processingFee, net });
  });
  it("supports a zero fee", () => {
    expect(calcProcessingFee(25, { rate: 0, fixed: 0 })).toEqual({ processingFee: 0, net: 25 });
  });
  it.each([-1, NaN, Infinity])("rejects invalid sale %s", sale => {
    expect(() => calcProcessingFee(sale, fees[0])).toThrow(RangeError);
  });
  it("rejects invalid fee data", () => {
    expect(() => calcProcessingFee(10, { rate: -1, fixed: 0 })).toThrow(RangeError);
    expect(() => calcProcessingFee(10, { rate: 0, fixed: NaN })).toThrow(RangeError);
  });
});

describe("parseSale", () => {
  it.each([null, "", " ", "oops", "Infinity", "-1"])("defaults invalid or absent input %s", value => {
    expect(parseSale(value)).toBe(35);
  });
  it.each(["0", "25.50", "100"])("accepts %s", value => {
    expect(parseSale(value)).toBe(Number(value));
  });
});
