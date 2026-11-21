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

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function describeFee(fee: ProcessingFee) {
  return `${Number((fee.rate * 100).toFixed(4))}% + ${formatMoney(fee.fixed, fee.currency)}`;
}
