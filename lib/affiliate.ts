// Worked-example inputs from https://feefact.com/tiktok-shop-affiliate-commission/.
// Only referralRate is a TikTok Shop platform rate; every commission rate here is a seller-set example.
export const affiliate = {
  currency: "USD",
  verified: "October 30, 2026",
  referralRate: 0.06,
  exampleSale: 40,
  exampleCommission: 0.15,
  ladder: [0.05, 0.1, 0.15, 0.2, 0.25],
  breakEven: { cogs: 30, shipping: 4.5, ads: 3, commissions: [0.05, 0.1] },
} as const;

export type CategoryBenchmark = { category: string; low: number; high: number; note: string };

// Seller-set example bands, not TikTok Shop rates. Band edges are steps of the ladder above; the notes are reasoning, not data.
export const categoryBenchmarks: readonly CategoryBenchmark[] = [
  { category: "Beauty & personal care", low: 0.15, high: 0.25, note: "Product cost is often a small share of the price, and creator demos sell these products well, so sellers have room to bid higher for creators." },
  { category: "Health & wellness", low: 0.15, high: 0.25, note: "Similar to beauty: margins tend to be high and repeat orders can justify paying more for the first sale. Check your real margin before following the band." },
  { category: "Fashion & apparel", low: 0.1, high: 0.2, note: "Margins can be healthy, but size and fit returns are frequent, so sellers tend to leave room for the cost of returned orders." },
  { category: "Home & kitchen", low: 0.1, high: 0.2, note: "Mid-range margins, and bulky items cost more to ship, which leaves less of the price for commission." },
  { category: "Electronics & accessories", low: 0.05, high: 0.15, note: "Margins on electronics are usually thin, but higher prices mean a low percentage still pays the creator a meaningful dollar amount." },
];

const roundCents = (amount: number) => Math.round(Number((amount * 100).toPrecision(15))) / 100;

export function calcAffiliateStack(sale: number, commissionRate: number, referralRate: number = affiliate.referralRate) {
  if (![sale, commissionRate, referralRate].every(value => Number.isFinite(value) && value >= 0)) {
    throw new RangeError("Sale and rates must be finite non-negative numbers.");
  }
  const referral = roundCents(sale * referralRate);
  const commission = roundCents(sale * commissionRate);
  const total = roundCents(referral + commission);
  return { referral, commission, total, totalRate: commissionRate + referralRate, payout: roundCents(sale - total) };
}
