import { NextRequest, NextResponse } from "next/server";
import { getPaymentService } from "@/services/payment";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "default_webhook_secret";

    const paymentService = getPaymentService();
    const isValid = paymentService.verifyWebhookSignature(rawBody, signature, secret);

    if (!isValid && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody || "{}");
    const event = payload.event;
    const subscriptionEntity = payload.payload?.subscription?.entity;

    if (subscriptionEntity?.id) {
      const sub = await prisma.subscription.findFirst({
        where: { razorpaySubscriptionId: subscriptionEntity.id },
      });

      if (sub) {
        if (event === "subscription.charged") {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "ACTIVE" },
          });

          await recordAuditLog({
            organizationId: sub.organizationId,
            action: "SUBSCRIPTION_CHANGED",
            entityType: "SUBSCRIPTION",
            entityId: sub.id,
            details: { event, status: "ACTIVE" },
          });
        } else if (event === "subscription.cancelled") {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "CANCELLED" },
          });

          await recordAuditLog({
            organizationId: sub.organizationId,
            action: "SUBSCRIPTION_CHANGED",
            entityType: "SUBSCRIPTION",
            entityId: sub.id,
            details: { event, status: "CANCELLED" },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

