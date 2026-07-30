import { describe, it, expect } from "vitest";
import { checkoutFormSchema, PAYMENT_METHOD_PROVIDER, PAYMENT_METHOD_LABELS } from "@/lib/validators/checkout";

const validInput = {
  fullName: "Amina Juma",
  phone: "0712345678",
  email: "amina@example.com",
  region: "Dar es Salaam",
  district: "Kinondoni",
  streetLine: "Plot 12, Msasani",
  paymentMethod: "mpesa" as const,
};

describe("checkoutFormSchema", () => {
  it("accepts a fully valid checkout form", () => {
    expect(checkoutFormSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects an invalid phone number", () => {
    expect(checkoutFormSchema.safeParse({ ...validInput, phone: "12345" }).success).toBe(false);
  });

  it("rejects a missing payment method", () => {
    const { paymentMethod, ...withoutMethod } = validInput;
    expect(checkoutFormSchema.safeParse(withoutMethod).success).toBe(false);
  });
});

describe("PAYMENT_METHOD_PROVIDER mapping", () => {
  it("has a provider entry for every payment method label", () => {
    const methodKeys = Object.keys(PAYMENT_METHOD_LABELS);
    const providerKeys = Object.keys(PAYMENT_METHOD_PROVIDER);
    expect(providerKeys.sort()).toEqual(methodKeys.sort());
  });

  it("routes all mobile money methods through Selcom", () => {
    expect(PAYMENT_METHOD_PROVIDER.mpesa).toBe("selcom");
    expect(PAYMENT_METHOD_PROVIDER.tigopesa).toBe("selcom");
    expect(PAYMENT_METHOD_PROVIDER.airtelmoney).toBe("selcom");
    expect(PAYMENT_METHOD_PROVIDER.halopesa).toBe("selcom");
  });

  it("routes bank transfers through Flutterwave", () => {
    expect(PAYMENT_METHOD_PROVIDER.crdb_bank).toBe("flutterwave");
    expect(PAYMENT_METHOD_PROVIDER.nmb_bank).toBe("flutterwave");
  });
});
