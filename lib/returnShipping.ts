// TikTok Shop US return-shipping rules. Every entry is taken from the official
// TikTok Shop Academy (Seller Center) page named in `sources`; nothing here is estimated.

import { tiktokShopRefund } from "./fees";

export type PolicySource = { title: string; url: string; updated: string };

export const returnShippingChecked = "November 21, 2026";

export const returnShippingSources = {
  policy: {
    title: "Customer Order Cancellation, Return, and Refund Policy",
    url: "https://seller-us.tiktok.com/university/essay?knowledge_id=3253210454181634&lang=en",
    updated: "October 21, 2026",
  },
  finance: {
    title: "Finance & Settlement 101",
    url: "https://seller-us.tiktok.com/university/essay?knowledge_id=1167036928444174&lang=en",
    updated: "August 10, 2026",
  },
  protection: {
    title: "How to Join the Return Shipping Protection Program",
    url: "https://seller-us.tiktok.com/university/essay?knowledge_id=3869201543218957&lang=en",
    updated: "November 17, 2026",
  },
  protectionGuide: {
    title: "A Guide to the Return Shipping Protection Program",
    url: "https://seller-us.tiktok.com/university/essay?knowledge_id=616831178131201&lang=en",
    updated: "July 1, 2026",
  },
} as const satisfies Record<string, PolicySource>;

export type ReturnShippingRow = {
  situation: string;
  reasons: string;
  platformDropOff: "Seller" | "Customer";
  selfArranged: "Seller" | "Customer";
};

// From the policy's "Refund Responsibility - Return Shipping Cost" table.
export const returnShippingRows: readonly ReturnShippingRow[] = [
  {
    situation: "Buyer changed their mind",
    reasons: "No longer needed; item does not fit, or fabric, material or style is not as expected (fashion)",
    platformDropOff: "Seller",
    selfArranged: "Customer",
  },
  {
    situation: "Defective, damaged or wrong item",
    reasons: "Item defective or does not work; item damaged but shipping box in good condition; wrong item was sent; missing or broken parts; inaccurate item description",
    platformDropOff: "Seller",
    selfArranged: "Customer",
  },
  {
    situation: "Late delivery",
    reasons: "Product wouldn't arrive on time; item arrived too late",
    platformDropOff: "Seller",
    selfArranged: "Customer",
  },
];

export const returnShippingFaqs = [
  {
    question: "Does the refund administration fee cover return shipping?",
    answer: `No. The refund administration fee is ${tiktokShopRefund.adminShareOfReferral * 100}% of the referral fee, capped at $${tiktokShopRefund.capPerSku} per SKU, and it is only about the referral fee. Return shipping is a separate cost, and TikTok Shop's US return policy decides who pays it.`,
  },
  {
    question: "Who pays return shipping when a buyer simply changes their mind?",
    answer: "It depends on how the item comes back. Under TikTok Shop's US policy, if the customer drops the return off with TikTok Shop's preferred logistics, the return shipping cost is the seller's responsibility, even for reasons like \"no longer needed\" or \"does not fit\". If the customer arranges their own return shipping, the customer pays.",
  },
  {
    question: "Who pays return shipping for a defective or wrong item?",
    answer: "The seller, when the customer uses TikTok Shop's drop-off return. TikTok Shop says the seller bears the full cost of return shipping and handling on seller-fault returns such as a wrong item, a defective product or an inaccurate listing.",
  },
] as const;
