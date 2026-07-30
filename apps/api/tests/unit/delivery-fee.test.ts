import { describe, it, expect } from "vitest";
import { computeDeliveryFee } from "../../src/modules/orders/order.service";

describe("computeDeliveryFee", () => {
  it("charges the Dar es Salaam rate for Dar es Salaam", () => {
    expect(computeDeliveryFee("Dar es Salaam")).toBe(300000);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(computeDeliveryFee("  dar ES salaam  ")).toBe(300000);
  });

  it("charges the other-regions rate for anywhere else", () => {
    expect(computeDeliveryFee("Mwanza")).toBe(700000);
    expect(computeDeliveryFee("Arusha")).toBe(700000);
  });
});
