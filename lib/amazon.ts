// Amazon US selling fees used by /tiktok-shop-vs-amazon-fees/. Every figure is from the
// official Amazon page named in `amazonSources` and was checked on `amazonChecked`.
// Do not edit a number without re-verifying it there.

import { fbtFeePerUnit } from "./fbt";
import { tiktokShopRefund } from "./fees";

export type FeeSource = { title: string; url: string };

export const amazonChecked = "November 23, 2026";

export const amazonSources = {
  pricing: { title: "Amazon: Pricing (selling plans and referral fees)", url: "https://sell.amazon.com/pricing" },
  feeSchedule: { title: "Amazon Seller Central: Selling on Amazon fee schedule", url: "https://sellercentral.amazon.com/help/hub/reference/external/G200336920" },
  refundAdmin: { title: "Amazon Seller Central: Refund administration fee", url: "https://sellercentral.amazon.com/help/hub/reference/external/GDC3U6FWF4JJJJC7" },
  fbaFees: { title: "Amazon Seller Central: US FBA fulfillment fees (2026 and 2027 rate cards)", url: "https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW" },
  sizeTiers: { title: "Amazon Seller Central: Product size tiers", url: "https://sellercentral.amazon.com/gp/help/external/GG5KW835AHDJCH8W" },
} as const satisfies Record<string, FeeSource>;

export const tiktokSources = {
  referral: { title: "TikTok Shop Academy: TikTok Shop Referral Fees in 2024 by Category", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en" },
  refund: { title: "TikTok Shop Academy: Referral Fee Updates", url: tiktokShopRefund.source },
  fbt: { title: "TikTok Shop Academy: FBT Rate Card & FAQ", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=3507056320268087&lang=en" },
} as const satisfies Record<string, FeeSource>;

export const amazonPlans = { professionalPerMonth: 39.99, individualPerItem: 0.99 } as const;

export const amazonMediaClosingFee = 1.8;

export const amazonRefundAdmin = { adminShareOfReferral: 0.2, cap: 5 } as const;

export type AmazonReferralCategory = { category: string; rule: string; rateAt: (price: number) => number; minimum: number };

// A selection of rows from Amazon's referral fee table, not the whole table.
export const amazonReferralCategories: readonly AmazonReferralCategory[] = [
  { category: "Home and Kitchen", rule: "15%", rateAt: () => 0.15, minimum: 0.3 },
  { category: "Toys and Games", rule: "15%", rateAt: () => 0.15, minimum: 0.3 },
  { category: "Beauty, Health, and Personal Care", rule: "8% at $10.00 or less, 15% above $10.00", rateAt: price => (price <= 10 ? 0.08 : 0.15), minimum: 0.3 },
  { category: "Clothing and Accessories", rule: "5% at $15.00 or less, 10% above $15.00 up to $20.00, 17% above $20.00", rateAt: price => (price <= 15 ? 0.05 : price <= 20 ? 0.1 : 0.17), minimum: 0.3 },
  { category: "Consumer Electronics", rule: "8%", rateAt: () => 0.08, minimum: 0.3 },
];

// FBA fulfillment fee per unit, non-apparel, item price $10 to $50. The fuel and
// logistics-related surcharge is not included in these rates.
export const amazonFba = {
  surchargeRate: 0.035,
  surchargeSince: "April 17, 2026",
  priceBand: "$10 to $50",
  periods: [
    { key: "nonPeak2026", label: "January 15 – October 14, 2026" },
    { key: "peak2026", label: "October 15, 2026 – January 14, 2027 (holiday peak)" },
    { key: "nonPeak2027", label: "January 15 – October 14, 2027" },
  ],
  current: "peak2026",
  tiers: [
    { sizeTier: "Small standard", weight: "10+ to 12 oz", nonPeak2026: 3.78, peak2026: 3.99, nonPeak2027: 4.16 },
    { sizeTier: "Large standard", weight: "8+ to 12 oz", nonPeak2026: 4.2, peak2026: 4.48, nonPeak2027: 4.26 },
    { sizeTier: "Large standard", weight: "12+ to 16 oz", nonPeak2026: 4.6, peak2026: 4.89, nonPeak2027: 4.67 },
    { sizeTier: "Large standard", weight: "1.75+ to 2 lb", nonPeak2026: 5.82, peak2026: 6.15, nonPeak2027: 5.98 },
  ],
  // Size-tier limits effective through January 14, 2027.
  smallStandard: { maxWeightOz: 16, maxShortestSideIn: 0.75 },
} as const;

// The item is an illustration; every rate applied to it is an official one.
export const vsAmazonExample = { price: 29.99, weightOz: 12, amazonCategory: "Home and Kitchen", fbaTier: { sizeTier: "Large standard", weight: "8+ to 12 oz" } } as const;

const roundCents = (amount: number) => Math.round(Number((amount * 100).toPrecision(15))) / 100;

export function calcAmazonReferralFee(price: number, category: Pick<AmazonReferralCategory, "rateAt" | "minimum">) {
  if (!Number.isFinite(price) || price < 0) throw new RangeError("Price must be a finite non-negative number.");
  return Math.max(roundCents(price * category.rateAt(price)), category.minimum);
}

export function calcAmazonRefundAdminFee(referralFee: number, rule: { adminShareOfReferral: number; cap: number } = amazonRefundAdmin) {
  if (!Number.isFinite(referralFee) || referralFee < 0) throw new RangeError("Referral fee must be a finite non-negative number.");
  return Math.min(roundCents(referralFee * rule.adminShareOfReferral), rule.cap);
}

/** One unit, platform-fulfilled, no buyer-paid shipping and no discount: what is left after the platform's referral and fulfillment fees. */
export function compareFeeStacks({ price, weightOz, amazonCategory, fbaTier } = vsAmazonExample, tiktokReferralRate: number = tiktokShopRefund.standardReferralRate) {
  const category = amazonReferralCategories.find(entry => entry.category === amazonCategory);
  const tier = amazonFba.tiers.find(entry => entry.sizeTier === fbaTier.sizeTier && entry.weight === fbaTier.weight);
  const fbt = fbtFeePerUnit(weightOz / 16);
  if (!category || !tier || fbt === undefined) throw new RangeError("No verified rate for this item.");
  const tiktokReferral = roundCents(price * tiktokReferralRate);
  const amazonReferral = calcAmazonReferralFee(price, category);
  const fba = tier[amazonFba.current];
  // Amazon does not publish how the surcharge is rounded per unit; this is rounded to the cent.
  const surcharge = roundCents(fba * amazonFba.surchargeRate);
  const tiktok = { referral: tiktokReferral, fulfillment: fbt, total: roundCents(tiktokReferral + fbt), kept: roundCents(price - tiktokReferral - fbt), refundAdmin: Math.min(roundCents(tiktokReferral * tiktokShopRefund.adminShareOfReferral), tiktokShopRefund.capPerSku) };
  const amazon = { referral: amazonReferral, referralRate: category.rateAt(price), fulfillment: fba, surcharge, total: roundCents(amazonReferral + fba + surcharge), kept: roundCents(price - amazonReferral - fba - surcharge), refundAdmin: calcAmazonRefundAdminFee(amazonReferral) };
  return { tiktok, amazon, difference: roundCents(tiktok.kept - amazon.kept) };
}
