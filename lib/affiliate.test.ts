import { describe, expect, it } from "vitest";
import { affiliate, calcAffiliateStack, categoryBenchmarks } from "./affiliate";

describe("calcAffiliateStack", () => {
  it("matches the live page's $40 worked example", () => {
    expect(calcAffiliateStack(40, 0.15)).toMatchObject({ referral: 2.4, commission: 6, total: 8.4, payout: 31.6 });
    expect(calcAffiliateStack(40, 0.15, 0.08)).toMatchObject({ total: 9.2, payout: 30.8 });
    expect(calcAffiliateStack(40, 0)).toMatchObject({ commission: 0, payout: 37.6 });
  });
  it("matches the live commission ladder", () => {
    expect(affiliate.ladder.map(rate => calcAffiliateStack(40, rate).payout)).toEqual([35.6, 33.6, 31.6, 29.6, 27.6]);
  });
  it("rejects invalid input", () => {
    expect(() => calcAffiliateStack(-1, 0.1)).toThrow(RangeError);
  });
});

describe("categoryBenchmarks", () => {
  it("only uses wide bands whose edges are ladder steps from the live page", () => {
    const steps: readonly number[] = affiliate.ladder;
    for (const row of categoryBenchmarks) {
      expect(steps).toContain(row.low);
      expect(steps).toContain(row.high);
      expect(row.high - row.low).toBeGreaterThanOrEqual(0.1 - 1e-9);
    }
  });
});
