import { describe, expect, it } from "vitest";
import { fbtBillableWeightLb, fbtFeePerUnit, fbtRateCard, findFbtTier } from "./fbt";
import { compareSellerShippedWithFbt, keptAfterShipping, priceToKeep, shippingExample } from "./shipping";

const tier = (label: string) => fbtRateCard.tiers.find(entry => entry.label === label)?.perUnit;

describe("fbtRateCard", () => {
  it("has the 153 verified tiers up to 150 lb and no 150+ lb row", () => {
    expect(fbtRateCard.tiers).toHaveLength(153);
    expect(fbtRateCard.tiers.at(-1)).toMatchObject({ label: "149+ to 150 lb", maxOz: 2400 });
    expect(fbtRateCard.tiers.some(entry => entry.label.startsWith("150+"))).toBe(false);
    expect(fbtRateCard.effectiveDate).toBe("2026-11-01");
  });
  it("covers every weight once, in order", () => {
    const maxOz = fbtRateCard.tiers.map(entry => entry.maxOz);
    expect(maxOz.slice(0, 4)).toEqual([4, 8, 12, 16]);
    expect(maxOz.slice(4)).toEqual(Array.from({ length: 149 }, (_, index) => (index + 2) * 16));
  });
  it("matches the official card on spot-checked rows", () => {
    expect(tier("4 oz or less")).toEqual([4.28, 2.52, 1.91, 1.56]);
    expect(tier("3+ to 4 lb")).toEqual([6.92, 4.7, 3.55, 3.12]);
    expect(tier("14+ to 15 lb")).toEqual([11.85, 10.8, 10.8, 10.8]);
    expect(tier("69+ to 70 lb")).toEqual([28.01, 28.01, 28.01, 28.01]);
    expect(tier("70+ to 71 lb")).toEqual([43.92, 43.92, 43.92, 43.92]);
    expect(tier("149+ to 150 lb")).toEqual([98.98, 98.98, 98.98, 98.98]);
  });
  it("keeps the official rows where a heavier tier is not more expensive", () => {
    expect(tier("79+ to 80 lb")?.[0]).toBe(48.64);
    expect(tier("80+ to 81 lb")?.[0]).toBe(46.27);
    expect(tier("129+ to 130 lb")?.[0]).toBe(89.04);
    expect(tier("130+ to 131 lb")?.[0]).toBe(87.31);
    expect(tier("50+ to 51 lb")).toEqual(tier("51+ to 52 lb"));
  });
  it("charges one price for every order size from 15 lb up", () => {
    for (const entry of fbtRateCard.tiers.filter(candidate => candidate.maxOz > 15 * 16)) {
      expect(new Set(entry.perUnit).size).toBe(1);
    }
  });
});

describe("fbtFeePerUnit", () => {
  it.each([[0.25, 1, 4.28], [0.26, 1, 4.52], [0.75, 1, 4.7], [1, 1, 5.1], [1.01, 1, 5.71], [3.5, 3, 3.55], [3.5, 4, 3.12], [3.5, 9, 3.12], [150, 2, 98.98]])("%s lb in a %s-unit order costs %s per unit", (weight, units, fee) => {
    expect(fbtFeePerUnit(weight, units)).toBe(fee);
  });
  it("has no rate above the 150 lb item limit", () => {
    expect(findFbtTier(150.01)).toBeUndefined();
    expect(fbtFeePerUnit(151)).toBeUndefined();
  });
  it("rejects invalid input", () => {
    for (const weight of [0, -1, NaN, Infinity]) expect(() => fbtFeePerUnit(weight)).toThrow(RangeError);
    for (const units of [0, 1.5, -2]) expect(() => fbtFeePerUnit(1, units)).toThrow(RangeError);
  });
});

describe("fbtBillableWeightLb", () => {
  it("uses actual weight for small light items", () => {
    expect(fbtBillableWeightLb(2, 10, 8, 4)).toBe(2);
    expect(fbtBillableWeightLb(0.5, 332, 1, 1)).toBe(0.5);
  });
  it("uses the greater of actual and dimensional weight otherwise", () => {
    expect(fbtBillableWeightLb(1, 20, 10, 8.3)).toBeCloseTo(10);
    expect(fbtBillableWeightLb(3, 10, 8, 4)).toBe(3);
    expect(fbtBillableWeightLb(3, 20, 10, 8.3)).toBeCloseTo(10);
  });
  it("rejects invalid input", () => {
    expect(() => fbtBillableWeightLb(0, 1, 1, 1)).toThrow(RangeError);
    expect(() => fbtBillableWeightLb(1, 1, NaN, 1)).toThrow(RangeError);
  });
});

describe("shipping examples", () => {
  it("reproduces the live page's worked example", () => {
    const { price, carrierCost, buyerShippingCharge } = shippingExample;
    expect(keptAfterShipping({ price, shippingCost: carrierCost, buyerShippingCharge })).toEqual({ collected: 33.98, referralFee: 1.8, shippingCost: 4.8, kept: 27.38 });
    expect(keptAfterShipping({ price, shippingCost: carrierCost }).kept).toBe(23.39);
    expect(priceToKeep(27.38, carrierCost)).toBe(34.23);
  });
  it("compares the example item seller-shipped and with FBT", () => {
    const result = compareSellerShippedWithFbt();
    expect(result.sellerShipped.kept).toBe(23.39);
    expect(result.fbt).toMatchObject({ shippingCost: 4.7, kept: 23.49 });
    expect(result.difference).toBe(0.1);
  });
});
