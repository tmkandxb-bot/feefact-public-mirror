import { fbtFeePerUnit } from "./fbt";

const roundCents = (amount: number) => Math.round(Number((amount * 100).toPrecision(15))) / 100;

// Verified TikTok Shop US baseline referral fee, plus the widely reported 8% shown alongside it.
export const referralRates = { verified: 0.06, reported: 0.08 } as const;

// Everything in `shippingExample` is an illustration, not a published rate.
export const shippingExample = {
  price: 29.99,
  carrierCost: 4.8,
  buyerShippingCharge: 3.99,
  productCost: 10,
  affiliateRate: 0.1,
  itemWeightOz: 12,
  pricePoints: [9.99, 19.99, 29.99, 49.99],
  orderVolume: 500,
} as const;

/** What is left of one order after the referral fee and the shipping or fulfillment cost, before product cost. */
export function keptAfterShipping({ price, shippingCost, buyerShippingCharge = 0, referralRate = referralRates.verified }: { price: number; shippingCost: number; buyerShippingCharge?: number; referralRate?: number }) {
  const collected = roundCents(price + buyerShippingCharge);
  const referralFee = roundCents(price * referralRate);
  return { collected, referralFee, shippingCost, kept: roundCents(collected - referralFee - shippingCost) };
}

/** Item price that keeps `targetKept` when the seller absorbs shipping and the referral fee applies to the item price. */
export function priceToKeep(targetKept: number, shippingCost: number, referralRate: number = referralRates.verified) {
  return roundCents((targetKept + shippingCost) / (1 - referralRate));
}

/** Seller-shipped (example carrier cost) vs FBT for the same single-unit order. */
export function compareSellerShippedWithFbt({ price, carrierCost, itemWeightOz } = shippingExample) {
  const fbtFee = fbtFeePerUnit(itemWeightOz / 16);
  if (fbtFee === undefined) throw new RangeError("Item is above the FBT weight limit.");
  const sellerShipped = keptAfterShipping({ price, shippingCost: carrierCost });
  const fbt = keptAfterShipping({ price, shippingCost: fbtFee });
  return { sellerShipped, fbt, difference: roundCents(fbt.kept - sellerShipped.kept) };
}
