import { describe, expect, it } from "vitest";
import { calcNetProfit, calcPreOwnedReferralFee, calcProcessingFee, calcRefundAdminFee, parseSale, refundCapSalePrice } from "./calc";
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
  it.each([[125, 3.93, 121.07], [625, 18.43, 606.57], [1125, 32.93, 1092.07]])("rounds half-cent fees up for sale %s", (sale, processingFee, net) => {
    expect(calcProcessingFee(sale, fees[0])).toEqual({ processingFee, net });
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

describe("calcRefundAdminFee", () => {
  it("charges 20% of the referral fee: $0.42 on a $35 sale at 6%", () => {
    expect(calcRefundAdminFee(35, 0.06)).toEqual({ fee: 0.42, atCap: false, capped: false });
  });
  it.each([[20, 0.03, 0.12], [35, 0.03, 0.21], [80, 0.05, 0.8], [200, 0.08, 3.2]])("sale %s at %s", (sale, rate, fee) => {
    expect(calcRefundAdminFee(sale, rate).fee).toBe(fee);
  });
  it("caps at $5 per SKU", () => {
    expect(calcRefundAdminFee(500, 0.05)).toEqual({ fee: 5, atCap: true, capped: false });
    expect(calcRefundAdminFee(500, 0.06)).toEqual({ fee: 5, atCap: true, capped: true });
    expect(calcRefundAdminFee(2000, 0.08).fee).toBe(5);
  });
  it("finds the sale price where the cap starts", () => {
    expect([0.03, 0.05, 0.06, 0.08].map(rate => refundCapSalePrice(rate))).toEqual([833.33, 500, 416.67, 312.5]);
  });
  it("rejects invalid inputs", () => {
    expect(() => calcRefundAdminFee(-1, 0.06)).toThrow(RangeError);
  });
});

describe("calcPreOwnedReferralFee", () => {
  it("charges 5% up to $10,000 and 3% on the portion above it", () => {
    expect(calcPreOwnedReferralFee(100)).toBe(5);
    expect(calcPreOwnedReferralFee(10000)).toBe(500);
    expect(calcPreOwnedReferralFee(12000)).toBe(560);
  });
  it("rejects invalid sales", () => {
    expect(() => calcPreOwnedReferralFee(-1)).toThrow(RangeError);
  });
});
