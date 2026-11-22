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

export const tiktokShopRefund = {
  slug: "tiktok-shop-refund-fee",
  currency: "USD",
  adminShareOfReferral: 0.2,
  capPerSku: 5,
  verified: "October 30, 2026",
  referralRates: [
    { rate: 0.03, label: "new seller", capLabel: "new seller promo" },
    { rate: 0.05, label: "jewelry / pre-owned", capLabel: "fine jewelry / pre-owned" },
    { rate: 0.06, label: "standard", capLabel: "standard US rate" },
    { rate: 0.08, label: "reported", capLabel: "widely reported effective rate" },
  ],
  standardReferralRate: 0.06,
  exampleSales: [20, 35, 80, 200, 500],
  monthly: { orders: 100, returnRates: [0.05, 0.1, 0.2, 0.3], sales: [35, 80] },
} as const;

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function describeFee(fee: ProcessingFee) {
  return `${Number((fee.rate * 100).toFixed(4))}% + ${formatMoney(fee.fixed, fee.currency)}`;
}
