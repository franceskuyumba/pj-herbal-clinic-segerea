import { describe, it, expect } from "vitest";
import { generateOrderNumber } from "../../src/utils/orderNumber";

describe("generateOrderNumber", () => {
  it("pads to 6 digits with the PJH- prefix", () => {
    expect(generateOrderNumber(1)).toBe("PJH-000001");
    expect(generateOrderNumber(42)).toBe("PJH-000042");
  });

  it("does not truncate a sequence larger than 6 digits", () => {
    expect(generateOrderNumber(1234567)).toBe("PJH-1234567");
  });
});
