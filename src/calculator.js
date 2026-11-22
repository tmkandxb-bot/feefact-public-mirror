// Real code from feefact.com - TikTok Shop calculator core
export function calcNetProfit({ sale = 35, referralRate = 0.06, creatorRate = 0.05, adsRate = 0.15, cogs = 8, shipping = 3.5 }) {
  const referral = sale * referralRate;
  const creator = sale * creatorRate;
  const ads = sale * adsRate;
  const totalFees = referral + creator + ads;
  const net = sale - totalFees - cogs - shipping;
  return { sale, referral, creator, ads, totalFees, net, margin: net / sale };
}
// Example: calcNetProfit({}) -> net 14.40, margin 0.411
