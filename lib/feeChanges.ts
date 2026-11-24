// TikTok Shop fee change log. Every rate, amount and date in an "Official" entry is from the
// TikTok Shop Seller University page cited in `sources`, read on `verifiedOn`.
// Do not edit a number without re-verifying it there; if no official page states it, leave it out.

export const verifiedOn = "November 23, 2026";

export const sources = {
  usReferral: { title: "TikTok Shop US: Referral Fees by Category", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=5988482086864682&lang=en", pageDate: "October 8, 2026" },
  usAuction: { title: "TikTok Shop US: 26Q4 Seller LIVE Auction Referral Fee Reduction Policy", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=6219480922474258", pageDate: "October 8, 2026" },
  usFbt: { title: "TikTok Shop US: FBT Rate Card & FAQ", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=3507056320268087&lang=en", pageDate: "November 10, 2026" },
  usPolicyPulse: { title: "TikTok Shop US: Policy Pulse (October 2026)", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=3634802985453313&lang=en", pageDate: "November 5, 2026" },
  usLogistics: { title: "TikTok Shop US: Logistics & Fulfillment", url: "https://seller-us.tiktok.com/university/essay?knowledge_id=7740101263378189&lang=en", pageDate: "September 9, 2026" },
  ukCommission: { title: "TikTok Shop UK: Commission Rate by Product Categories", url: "https://seller-uk.tiktok.com/university/essay?knowledge_id=3315312175236897", pageDate: "September 18, 2025" },
  euCommission: { title: "TikTok Shop EU: Commission Rate Policy", url: "https://seller-it.tiktok.com/university/essay?knowledge_id=1743723416618774", pageDate: "September 29, 2026" },
  sgCommission: { title: "TikTok Shop Singapore: Platform Commission Fee", url: "https://seller-sg.tiktok.com/university/essay?knowledge_id=2161524467910401&lang=en", pageDate: "August 17, 2026" },
} as const;

export type SourceKey = keyof typeof sources;

export const rates = {
  us: { standard: 0.06, reported: 0.08, jewelryAndPreOwned: 0.05, overTenThousand: 0.03, highValueThreshold: 10000 },
  auction: { newSeller: 0.04, existingSellerHighValue: 0.03, jewelryMinimum: 1500, otherMinimum: 500, weeklyCap: 400000, startingBid: 1 },
  uk: { standard: 0.09 },
  eu: { standard: 0.09, electronics: 0.07, newSellerTierOne: 0.04, newSellerTierOneDays: 60, newSellerTierTwo: 0.02, newSellerTierTwoDays: 90 },
  signatureService: 3.95,
} as const;

export type Change = { date: string; market: "US" | "UK" | "EU"; change: string; status: "Official" | "Reported"; source?: SourceKey };

// Newest first.
export const changes: readonly Change[] = [
  { date: "Nov 1, 2026", market: "US", change: "FBT: fulfillment fee reduced for single-unit items in the 70 lb to 150 lb tiers; Exit Inventory Shipping Fee changes.", status: "Official", source: "usFbt" },
  { date: "Oct 2026", market: "US", change: "Pre-Order and Made-to-Order: eligible sellers can switch the features on themselves in Seller Center, with no Account Manager submission, under refreshed eligibility criteria. No fee change is stated.", status: "Official", source: "usPolicyPulse" },
  { date: "Oct 1 – Dec 31, 2026", market: "US", change: "Seller LIVE Auction referral fee temporarily reduced on auctions with a $1 starting bid: 4% for qualifying new auction sellers, 3% for high-value orders from existing sellers (jewelry $1,500 and up, other targeted categories $500 and up). Capped at $400,000 of qualified auction sales per seller per week. Ends December 31, 2026.", status: "Official", source: "usAuction" },
  { date: "Aug 2026", market: "US", change: "Sellers widely report an effective referral rate of 8% on settlement lines, above the 6% table rate. TikTok's published table has not changed.", status: "Reported" },
  { date: "Jul 13, 2026", market: "US", change: "FBT: rate card extended to items over 50 lb, up to 150 lb.", status: "Official", source: "usFbt" },
  { date: "Jul 10, 2026", market: "US", change: "FBT: TX Hub Placement Fee introduced.", status: "Official", source: "usFbt" },
  { date: "Jun 18, 2026", market: "US", change: "FBT: multi-unit fulfillment fees increased by $0.10 to $3.00 per unit in the 5 lb to 20 lb tiers; Incident Fee changes.", status: "Official", source: "usFbt" },
  { date: "Jun 15, 2026", market: "EU", change: "New Seller Commission Reduction: eligible new sellers who complete the mission pay 4% for 60 days (France, Germany, Spain, Italy, Ireland) or 2% for 90 days (Poland, Netherlands, Belgium, Czechia, Austria, Greece, Portugal, Hungary) instead of the standard 9%.", status: "Official", source: "euCommission" },
  { date: "Jun 1, 2026", market: "US", change: "FBT: customer return handling fees introduced.", status: "Official", source: "usFbt" },
  { date: "May 20, 2026", market: "US", change: "FBT: single-unit fulfillment fees reduced by $0.10 to $5 per unit in the 16 lb to 50 lb tiers.", status: "Official", source: "usFbt" },
  { date: "May 15, 2026", market: "US", change: "FBT: Ships in Own Container (SIOC) discount of up to $0.80 per single-unit item, and Value-Add Service Fees introduced.", status: "Official", source: "usFbt" },
  { date: "May 1, 2026", market: "US", change: "FBT: units of 2 lb or less and 332 cubic inches or less are billed on actual weight only.", status: "Official", source: "usFbt" },
  { date: "Mar 12, 2026", market: "US", change: "TikTok Shipping: optional Package Signature Service launched at $3.95 per package.", status: "Official", source: "usLogistics" },
  { date: "Jan 12, 2026", market: "US", change: "FBT: multi-unit fulfillment fees reduced (up to 24% lower) for 2, 3 and 4+ unit orders in the 0 to 4 lb tiers.", status: "Official", source: "usFbt" },
  { date: "Dec 15, 2025", market: "US", change: "FBT: storage fees reduced by 14% to 43% for inventory stored up to 270 days; the first 60 days stay free.", status: "Official", source: "usFbt" },
];

const roundCents = (value: number) => Math.round(value * 100) / 100;

/** Referral fee on an order amount at each rate, in the order given. */
export function feeAtRates(amount: number, rateList: readonly number[]) {
  return rateList.map(rate => roundCents(amount * rate));
}

// Order amounts below are illustrations, not published figures.
export const examples = { usOrder: 35, usMonthlyOrders: 500, auctionOrder: 600, euOrder: 100 } as const;
