import { z } from "zod";

export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().regex(/^(0|\+255)[67]\d{8}$/, "Enter a valid Tanzanian phone number"),
  email: z.string().email("Enter a valid email"),
  region: z.string().min(2, "Region is required"),
  district: z.string().min(2, "District is required"),
  streetLine: z.string().min(3, "Street / house details are required"),
  paymentMethod: z.enum(["mpesa", "tigopesa", "airtelmoney", "halopesa", "crdb_bank", "nmb_bank"], {
    errorMap: () => ({ message: "Choose a payment method" }),
  }),
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

// The customer picks a payment METHOD (SRS §6); which processor handles it
// is a backend/business routing decision, not something to ask a shopper —
// mobile money routes through Selcom (the dominant TZ mobile money
// aggregator), bank transfers route through Flutterwave.
export const PAYMENT_METHOD_PROVIDER: Record<CheckoutFormInput["paymentMethod"], "selcom" | "flutterwave" | "dpo"> = {
  mpesa: "selcom",
  tigopesa: "selcom",
  airtelmoney: "selcom",
  halopesa: "selcom",
  crdb_bank: "flutterwave",
  nmb_bank: "flutterwave",
};

export const PAYMENT_METHOD_LABELS: Record<CheckoutFormInput["paymentMethod"], string> = {
  mpesa: "M-Pesa",
  tigopesa: "Tigo Pesa",
  airtelmoney: "Airtel Money",
  halopesa: "HaloPesa",
  crdb_bank: "CRDB Bank",
  nmb_bank: "NMB Bank",
};
