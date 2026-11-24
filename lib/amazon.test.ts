import { describe, expect, it } from "vitest";
import { amazonFba, amazonReferralCategories, calcAmazonReferralFee, calcAmazonRefundAdminFee, compareFeeStacks } from "./amazon";

const category = (name: string) => amazonReferralCategories.find(entry => entry.category === name)!;

describe("calcAmazonReferralFee", () => {
  it("applies the category rate", () => {
    expect(calcAmazonReferralFee(29.99, category("Home and Kitchen"))).toBe(4.5);
    expect(calcAmazonReferralFee(29.99, category("Consumer Electronics"))).toBe(2.4);
  });
  it("applies the price thresholds", () => {
    const clothing = category("Clothing and Accessories");
    expect([15, 15.01, 20, 20.01].map(price => clothing.rateAt(price))).toEqual([0.05, 0.1, 0.1, 0.17]);
    const beauty = category("Beauty, Health, and Personal Care");
    expect([10, 10.01].map(price => beauty.rateAt(price))).toEqual([0.08, 0.15]);
  });
  it("applies the $0.30 minimum", () => {
    expect(calcAmazonReferralFee(1.5, category("Home and Kitchen"))).toBe(0.3);
  });
  it("rejects invalid prices", () => {
    expect(() => calcAmazonReferralFee(-1, category("Home and Kitchen"))).toThrow(RangeError);
  });
});

describe("calcAmazonRefundAdminFee", () => {
  it("is the lesser of $5 or 20% of the referral fee", () => {
    // Amazon's own example: $10.00 at 15% is a $1.50 referral fee and a $0.30 administration fee.
    expect(calcAmazonRefundAdminFee(1.5)).toBe(0.3);
    expect(calcAmazonRefundAdminFee(40)).toBe(5);
  });
});

describe("compareFeeStacks", () => {
  it("matches the published rates on the page example", () => {
    const { tiktok, amazon, difference } = compareFeeStacks();
    expect(tiktok).toEqual({ referral: 1.8, fulfillment: 4.7, total: 6.5, kept: 23.49, refundAdmin: 0.36 });
    expect(amazon).toEqual({ referral: 4.5, referralRate: 0.15, fulfillment: 4.48, surcharge: 0.16, total: 9.14, kept: 20.85, refundAdmin: 0.9 });
    expect(difference).toBe(2.64);
  });
  it("uses the holiday peak FBA card", () => {
    expect(amazonFba.current).toBe("peak2026");
  });
});
