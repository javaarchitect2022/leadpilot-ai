import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { RazorpayPaymentService } from "../services/payment";
import { WhatsAppCloudService } from "../services/whatsapp";

describe("Webhook Signature Validation", () => {
  it("RazorpayPaymentService should correctly verify valid HMAC SHA256 signatures", () => {
    const service = new RazorpayPaymentService();
    const secret = "test_webhook_secret_key_123";
    const payload = JSON.stringify({
      event: "subscription.charged",
      payload: { subscription: { entity: { id: "sub_test_123" } } },
    });

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const isValid = service.verifyWebhookSignature(payload, validSignature, secret);
    expect(isValid).toBe(true);

    const isInvalid = service.verifyWebhookSignature(payload, "tampered_signature", secret);
    expect(isInvalid).toBe(false);
  });

  it("WhatsAppCloudService should verify webhook subscription handshake", () => {
    const service = new WhatsAppCloudService();
    const expectedToken = "leadpilot_verify_token_secure";

    expect(service.verifyWebhook("subscribe", expectedToken, expectedToken)).toBe(true);
    expect(service.verifyWebhook("subscribe", "wrong_token", expectedToken)).toBe(false);
    expect(service.verifyWebhook("unsubscribe", expectedToken, expectedToken)).toBe(false);
  });
});

