// Prices are fixed by the owner: $29 per export, $19 for a new customer's first export.
export const CURRENCY = 'USD';
export const PRICES = {
  standard: { amount: '29.00', cents: 2900 },
  first: { amount: '19.00', cents: 1900 },
};

export function tierFor(hasPaidBefore) {
  return hasPaidBefore ? 'standard' : 'first';
}

export function productIdFor(env, tier) {
  return tier === 'first' ? env.WAFFO_PRODUCT_ID_FIRST : env.WAFFO_PRODUCT_ID_STANDARD;
}

export function toCents(display) {
  if (typeof display !== 'string' || !/^\d+(\.\d{1,2})?$/.test(display)) return null;
  return Math.round(parseFloat(display) * 100);
}
