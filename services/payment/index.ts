import crypto from "crypto";

export interface CreateSubscriptionInput {
  organizationId: string;
  planTier: "STARTER" | "GROWTH" | "BUSINESS";
  billingCycle: "MONTHLY" | "ANNUAL";
  customerEmail: string;
  customerName: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: string;
  checkoutUrl?: string;
}

export interface IPaymentService {
  createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}

export class RazorpayPaymentService implements IPaymentService {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult> {
    if (!this.keyId || !this.keySecret) {
      // Fallback to mock if keys not present
      return new MockPaymentService().createSubscription(input);
    }

    // In production, invoke Razorpay Subscriptions API
    const amount = input.planTier === "STARTER" ? 99900 : input.planTier === "GROWTH" ? 249900 : 499900;
    return {
      subscriptionId: `sub_${Date.now()}`,
      amount,
      currency: "INR",
      status: "created",
      checkoutUrl: `https://api.razorpay.com/v1/checkout/mock`,
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  }

  async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    return true;
  }
}

export class MockPaymentService implements IPaymentService {
  async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult> {
    const planPrices = {
      STARTER: 999,
      GROWTH: 2499,
      BUSINESS: 4999,
    };
    const multiplier = input.billingCycle === "ANNUAL" ? 10 : 1; // 2 months discount on annual
    const amount = (planPrices[input.planTier] || 999) * multiplier;

    return {
      subscriptionId: `mock_sub_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      currency: "INR",
      status: "active",
      checkoutUrl: "/settings?tab=subscription&mock_success=true",
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  }

  async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    return true;
  }
}

export function getPaymentService(): IPaymentService {
  if (process.env.PAYMENT_PROVIDER === "RAZORPAY" && process.env.RAZORPAY_KEY_ID) {
    return new RazorpayPaymentService();
  }
  return new MockPaymentService();
}

