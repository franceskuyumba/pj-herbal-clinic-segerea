import { describe, it, expect, beforeAll } from "vitest";
import crypto from "node:crypto";

// Selcom/Flutterwave both read config from process.env at call time via
// env.ts, so the test-only credentials are set here before importing the
// providers — same reasoning as tests/setup.ts, scoped to this file since
// these are provider-specific secrets not needed by every test.
beforeAll(() => {
  process.env.SELCOM_API_KEY = "test-api-key";
  process.env.SELCOM_API_SECRET = "test-api-secret";
  process.env.SELCOM_VENDOR_ID = "test-vendor";
  process.env.SELCOM_BASE_URL = "https://sandbox.selcom.example";
  process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH = "test-webhook-hash";
});

describe("Selcom webhook signature verification", () => {
  it("accepts a correctly signed payload", async () => {
    const { selcomProvider } = await import("../../src/modules/payments/providers/selcom");

    const payload = { order_id: "order_123", payment_status: "COMPLETED" };
    // Recreate exactly what selcomProvider signs internally: HMAC-SHA256
    // over "key=value&key2=value2", base64-encoded — this test would fail
    // if that recipe ever changed without a matching webhook-side update.
    const signedString = Object.entries(payload).map(([k, v]) => `${k}=${v}`).join("&");
    const validDigest = crypto.createHmac("sha256", "test-api-secret").update(signedString).digest("base64");

    const verified = selcomProvider.verifyWebhookSignature({ digest: validDigest }, payload);
    expect(verified).toBe(true);
  });

  it("rejects a tampered payload (digest no longer matches)", async () => {
    const { selcomProvider } = await import("../../src/modules/payments/providers/selcom");

    const originalPayload = { order_id: "order_123", payment_status: "COMPLETED" };
    const signedString = Object.entries(originalPayload).map(([k, v]) => `${k}=${v}`).join("&");
    const digestForOriginal = crypto.createHmac("sha256", "test-api-secret").update(signedString).digest("base64");

    // Attacker flips a completed payment to look the same but the digest
    // was computed for different field values — this must fail.
    const tamperedPayload = { order_id: "order_123", payment_status: "FAILED" };
    const verified = selcomProvider.verifyWebhookSignature({ digest: digestForOriginal }, tamperedPayload);
    expect(verified).toBe(false);
  });

  it("rejects a missing digest header", async () => {
    const { selcomProvider } = await import("../../src/modules/payments/providers/selcom");
    const verified = selcomProvider.verifyWebhookSignature({}, { order_id: "order_123" });
    expect(verified).toBe(false);
  });

  it("rejects a digest signed with the wrong secret", async () => {
    const { selcomProvider } = await import("../../src/modules/payments/providers/selcom");

    const payload = { order_id: "order_123", payment_status: "COMPLETED" };
    const signedString = Object.entries(payload).map(([k, v]) => `${k}=${v}`).join("&");
    const digestWithWrongSecret = crypto.createHmac("sha256", "wrong-secret").update(signedString).digest("base64");

    const verified = selcomProvider.verifyWebhookSignature({ digest: digestWithWrongSecret }, payload);
    expect(verified).toBe(false);
  });
});

describe("Flutterwave webhook signature verification", () => {
  it("accepts the correct shared-secret header", async () => {
    const { flutterwaveProvider } = await import("../../src/modules/payments/providers/flutterwave");
    const verified = flutterwaveProvider.verifyWebhookSignature({ "verif-hash": "test-webhook-hash" });
    expect(verified).toBe(true);
  });

  it("rejects an incorrect header value", async () => {
    const { flutterwaveProvider } = await import("../../src/modules/payments/providers/flutterwave");
    const verified = flutterwaveProvider.verifyWebhookSignature({ "verif-hash": "wrong-hash" });
    expect(verified).toBe(false);
  });

  it("rejects a missing header entirely", async () => {
    const { flutterwaveProvider } = await import("../../src/modules/payments/providers/flutterwave");
    const verified = flutterwaveProvider.verifyWebhookSignature({});
    expect(verified).toBe(false);
  });
});
