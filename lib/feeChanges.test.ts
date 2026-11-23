import { describe, expect, it } from "vitest";
import { changes, examples, feeAtRates, rates, sources } from "./feeChanges";

describe("fee change log", () => {
  it("cites a source for every Official entry", () => {
    for (const entry of changes) {
      if (entry.status === "Official") expect(entry.source && sources[entry.source]).toBeTruthy();
      else expect(entry.source).toBeUndefined();
    }
  });

  it("works the page examples to the cent", () => {
    expect(feeAtRates(examples.usOrder, [rates.us.standard, rates.us.reported])).toEqual([2.1, 2.8]);
    expect(feeAtRates(examples.auctionOrder, [rates.us.standard, rates.auction.newSeller, rates.auction.existingSellerHighValue])).toEqual([36, 24, 18]);
    expect(feeAtRates(examples.euOrder, [rates.eu.standard, rates.eu.newSellerTierOne, rates.eu.newSellerTierTwo])).toEqual([9, 4, 2]);
  });
});
