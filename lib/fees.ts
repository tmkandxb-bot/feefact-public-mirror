export type ProcessingFee = {
  slug: string;
  name: string;
  currency: "USD";
  rate: number;
  fixed: number;
  scope: string;
};

export const fees: readonly ProcessingFee[] = [
  {
    slug: "stripe",
    name: "Stripe",
    currency: "USD",
    rate: 0.029,
    fixed: 0.3,
    scope: "Standard online payments with domestic US cards",
  },
];

// TikTok Shop US Academy, Category Referral Rates (rates effective October 31, 2024).
export const tiktokShopUsReferral = {
  source: "https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en",
  reducedJewelry: ["Diamond", "Gold", "Jade", "Platinum/Carat Gold", "Ruby/Sapphire/Emerald"],
  // Pre-owned: 5% up to the threshold, 3% on the portion of a sale above it.
  preOwned: { rate: 0.05, threshold: 10000, rateAboveThreshold: 0.03 },
} as const;

export const tiktokShopRefund = {
  slug: "tiktok-shop-refund-fee",
  currency: "USD",
  adminShareOfReferral: 0.2,
  capPerSku: 5,
  verified: "November 21, 2026",
  source: "https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en",
  // Refunds on which the policy charges no administration fee (Refunds and Returns section).
  exemptions: [
    "\"Buy now refund later\" creator sample orders",
    "refunds the buyer starts before the order ships that meet TikTok Shop's auto-canceling criteria",
  ],
  referralRates: [
    { rate: 0.03, label: "new seller", capLabel: "new seller promo" },
    { rate: 0.05, label: "listed jewelry / pre-owned", capLabel: "five listed jewelry sub-categories / pre-owned" },
    { rate: 0.06, label: "standard", capLabel: "standard US rate" },
    { rate: 0.08, label: "reported", capLabel: "widely reported effective rate" },
  ],
  standardReferralRate: 0.06,
  exampleSales: [20, 35, 80, 200, 500],
  monthly: { orders: 100, returnRates: [0.05, 0.1, 0.2, 0.3], sales: [35, 80] },
} as const;

// Official illustrations from the same Academy article (tiktokShopRefund.source), sections
// "Refunds and Returns" and "Referral Fees". Inputs only: the page computes every fee with
// lib/calc, and lib/calc.test.ts checks the results against the figures TikTok Shop prints.
export const tiktokShopRefundOfficial = {
  title: "TikTok Shop Referral Fee Updates - 2024",
  updated: "May 8, 2025",
  checked: "November 23, 2026",
  capEffective: "May 15, 2025",
  // "Referral Fee = Referral Fee Rate % * (Customer Payment + Platform Discount - Tax)"
  feeBase: "customer payment + platform discount − tax",
  // Scenarios A to D: SKU prices in one refunded order, at the 6% rate.
  scenarios: [
    { id: "A", order: "One SKU at $10", skus: [10] },
    { id: "B", order: "One SKU at $500", skus: [500] },
    { id: "C", order: "Two SKUs at $10 each", skus: [10, 10] },
    { id: "D", order: "Two SKUs: one at $500, one at $10", skus: [500, 10] },
  ],
  // "Sample computation - Referral Fee": one order, half refunded and fully refunded.
  partial: { customerPayment: 102, platformDiscount: 5, tax: 2, rate: 0.06, refundedShare: 0.5 },
} as const;

// Review and return deadlines from the Customer Order Cancellation, Return, and Refund Policy
// (returnShippingSources.policy in lib/returnShipping.ts).
export const tiktokShopRefundDeadlines = {
  defaultReturnWindowDays: 30,
  returnReviewBusinessDays: 4,
  refundOnlyReviewBusinessDays: 2,
  refundOnlyPriceLimit: 100,
  cancellationReviewHours: 24,
} as const;

// Optional Return Shipping Protection Program fee, per covered order, as a share of
// Total Covered Order Value (TCOV). Source: returnShippingSources.protectionGuide.
export const tiktokShopReturnProtection = { feeShareOfTcov: 0.015 } as const;

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function describeFee(fee: ProcessingFee) {
  return `${Number((fee.rate * 100).toFixed(4))}% + ${formatMoney(fee.fixed, fee.currency)}`;
}
