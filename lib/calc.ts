import { tiktokShopRefund, type ProcessingFee } from "./fees";

type ProfitInput = {
  sale?: number;
  referralRate?: number;
  creatorRate?: number;
  adsRate?: number;
  cogs?: number;
  shipping?: number;
};

export function calcNetProfit({ sale = 35, referralRate = 0.06, creatorRate = 0.05, adsRate = 0.15, cogs = 8, shipping = 3.5 }: ProfitInput) {
  const referral = sale * referralRate;
  const creator = sale * creatorRate;
  const ads = sale * adsRate;
  const totalFees = referral + creator + ads;
  const net = sale - totalFees - cogs - shipping;
  return { sale, referral, creator, ads, totalFees, net, margin: net / sale };
}

const roundCents = (amount: number) => Math.round(Number((amount * 100).toPrecision(15))) / 100;

export function calcProcessingFee(sale: number, fee: Pick<ProcessingFee, "rate" | "fixed">) {
  if (![sale, fee.rate, fee.fixed].every(value => Number.isFinite(value) && value >= 0)) {
    throw new RangeError("Sale, rate and fixed fee must be finite non-negative numbers.");
  }
  const processingFee = roundCents(sale * fee.rate + fee.fixed);
  return { processingFee, net: roundCents(sale - processingFee) };
}

export function calcRefundAdminFee(sale: number, referralRate: number, rule: { adminShareOfReferral: number; capPerSku: number } = tiktokShopRefund) {
  if (![sale, referralRate].every(value => Number.isFinite(value) && value >= 0)) {
    throw new RangeError("Sale and referral rate must be finite non-negative numbers.");
  }
  const uncapped = roundCents(sale * referralRate * rule.adminShareOfReferral);
  return { fee: Math.min(uncapped, rule.capPerSku), atCap: uncapped >= rule.capPerSku, capped: uncapped > rule.capPerSku };
}

export function refundCapSalePrice(referralRate: number, rule: { adminShareOfReferral: number; capPerSku: number } = tiktokShopRefund) {
  return roundCents(rule.capPerSku / (referralRate * rule.adminShareOfReferral));
}

export function parseSale(value: string | null) {
  if (value === null || value.trim() === "") return 35;
  const sale = Number(value);
  return Number.isFinite(sale) && sale >= 0 ? sale : 35;
}
