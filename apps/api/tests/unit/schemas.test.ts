import { describe, it, expect } from "vitest";
import { checkoutSchema, updateOrderStatusSchema } from "../../src/modules/orders/order.schema";
import { createProductSchema } from "../../src/modules/products/product.schema";
import { addCartItemSchema } from "../../src/modules/cart/cart.schema";
import { createAddressSchema } from "../../src/modules/addresses/address.schema";
import { createCouponSchema } from "../../src/modules/coupons/coupon.schema";

describe("checkoutSchema", () => {
  const validInput = {
    fullName: "Amina Juma",
    phone: "0712345678",
    email: "amina@example.com",
    region: "Dar es Salaam",
    district: "Kinondoni",
    streetLine: "Plot 12, Msasani",
    paymentProvider: "selcom",
    paymentMethod: "mpesa",
  };

  it("accepts a fully valid checkout payload", () => {
    expect(checkoutSchema.safeParse(validInput).success).toBe(true);
  });

  it.each([
    ["0712345678", true],
    ["+255712345678", true],
    ["0512345678", false], // starts with 05, not 06/07 — invalid TZ mobile prefix
    ["712345678", false], // missing leading 0 or +255
    ["07123456", false], // too short
    ["not-a-phone", false],
  ])("phone %s → valid: %s", (phone, expected) => {
    const result = checkoutSchema.safeParse({ ...validInput, phone });
    expect(result.success).toBe(expected);
  });

  it("rejects an invalid email", () => {
    const result = checkoutSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported payment provider", () => {
    const result = checkoutSchema.safeParse({ ...validInput, paymentProvider: "paypal" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { region, ...missingRegion } = validInput;
    const result = checkoutSchema.safeParse(missingRegion);
    expect(result.success).toBe(false);
  });
});

describe("updateOrderStatusSchema", () => {
  it("accepts every valid order status", () => {
    for (const status of ["pending", "paid", "processing", "dispatched", "delivered", "cancelled"]) {
      expect(updateOrderStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an invalid status", () => {
    expect(updateOrderStatusSchema.safeParse({ status: "shipped" }).success).toBe(false);
  });
});

describe("createProductSchema", () => {
  const validProduct = {
    name: "Moringa Capsules",
    slug: "moringa-capsules",
    shortBenefits: "Daily energy support",
    description: "A supplement made from moringa leaf extract, taken daily.",
    ingredients: "Moringa oleifera leaf powder",
    usageInstructions: "Take 2 capsules daily",
    benefits: "Supports energy and immunity",
    warnings: "Consult a doctor if pregnant",
    categoryId: "clx0000000000000000000000",
    priceCents: 1200000,
    stock: 42,
    imageUrls: ["https://res.cloudinary.com/demo/moringa.jpg"],
  };

  it("accepts a fully valid product", () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects a slug with uppercase or spaces", () => {
    expect(createProductSchema.safeParse({ ...validProduct, slug: "Moringa Capsules" }).success).toBe(false);
  });

  it("rejects a negative price", () => {
    expect(createProductSchema.safeParse({ ...validProduct, priceCents: -100 }).success).toBe(false);
  });

  it("rejects zero images", () => {
    expect(createProductSchema.safeParse({ ...validProduct, imageUrls: [] }).success).toBe(false);
  });

  it("rejects a non-URL image entry", () => {
    expect(createProductSchema.safeParse({ ...validProduct, imageUrls: ["not-a-url"] }).success).toBe(false);
  });
});

describe("addCartItemSchema", () => {
  it("rejects a quantity of zero", () => {
    expect(addCartItemSchema.safeParse({ productId: "clx0000000000000000000000", quantity: 0 }).success).toBe(false);
  });

  it("rejects a quantity above the cap", () => {
    expect(addCartItemSchema.safeParse({ productId: "clx0000000000000000000000", quantity: 51 }).success).toBe(false);
  });

  it("accepts a valid quantity", () => {
    expect(addCartItemSchema.safeParse({ productId: "clx0000000000000000000000", quantity: 3 }).success).toBe(true);
  });
});

describe("createAddressSchema", () => {
  it("rejects an invalid Tanzanian phone number", () => {
    const result = createAddressSchema.safeParse({
      fullName: "Juma Said",
      phone: "12345",
      region: "Dar es Salaam",
      district: "Ilala",
      streetLine: "Uhuru St",
    });
    expect(result.success).toBe(false);
  });
});

describe("createCouponSchema", () => {
  it("rejects a coupon with neither percentOff nor amountOffCents", () => {
    const result = createCouponSchema.safeParse({ code: "SAVE10" });
    expect(result.success).toBe(false);
  });

  it("accepts a coupon with percentOff set", () => {
    const result = createCouponSchema.safeParse({ code: "SAVE10", percentOff: 10 });
    expect(result.success).toBe(true);
  });

  it("rejects a lowercase coupon code", () => {
    const result = createCouponSchema.safeParse({ code: "save10", percentOff: 10 });
    expect(result.success).toBe(false);
  });
});
