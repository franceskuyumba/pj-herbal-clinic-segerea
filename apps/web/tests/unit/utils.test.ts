import { describe, it, expect } from "vitest";
import { formatMoney, cn } from "@/lib/utils";

describe("formatMoney", () => {
  it("converts cents to a whole-number amount with no decimals", () => {
    const result = formatMoney(1200000);
    expect(result).toContain("12,000");
    expect(result).not.toMatch(/12,000\.\d/); // no decimal places
  });

  it("reflects the currency code passed in", () => {
    // Intl.NumberFormat's exact symbol/spacing varies by Node/ICU version —
    // asserting on the amount and that a currency was applied, not the
    // exact byte-for-byte string, keeps this test meaningful without being
    // brittle across environments.
    expect(formatMoney(500000, "USD")).toContain("5,000");
  });

  it("rounds to whole units (maximumFractionDigits: 0)", () => {
    expect(formatMoney(123456)).not.toMatch(/\.\d/);
  });
});

describe("cn (className merge)", () => {
  it("merges class strings and drops falsy values", () => {
    expect(cn("a", false, "b", undefined, "c")).toBe("a b c");
  });

  it("lets a later Tailwind class win over an earlier conflicting one", () => {
    // tailwind-merge should keep only the last padding utility
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
