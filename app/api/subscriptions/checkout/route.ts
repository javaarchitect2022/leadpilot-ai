import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { getPaymentService } from "@/services/payment";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "subscription:manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { planTier, billingCycle } = body;

    const validPlans = ["STARTER", "GROWTH", "BUSINESS"];
    if (!validPlans.includes(planTier)) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    const paymentService = getPaymentService();
    const subResult = await paymentService.createSubscription({
      organizationId: context.organizationId,
      planTier,
      billingCycle: billingCycle || "MONTHLY",
      customerEmail: context.user.email,
      customerName: context.user.name,
    });

    const leadLimits = {
      STARTER: 500,
      GROWTH: 5000,
      BUSINESS: 100000,
    };

    const newPeriodEnd = new Date();
    if (billingCycle === "ANNUAL") {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    } else {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    }

    // Upsert subscription record in database
    const updatedSub = await prisma.subscription.upsert({
      where: { organizationId: context.organizationId },
      create: {
        organizationId: context.organizationId,
        plan: planTier as any,
        status: "ACTIVE",
        billingCycle: billingCycle || "MONTHLY",
        razorpaySubscriptionId: subResult.subscriptionId,
        leadLimit: leadLimits[planTier as keyof typeof leadLimits] || 500,
        currentPeriodStart: new Date(),
        currentPeriodEnd: newPeriodEnd,
      },
      update: {
        plan: planTier as any,
        status: "ACTIVE",
        billingCycle: billingCycle || "MONTHLY",
        razorpaySubscriptionId: subResult.subscriptionId,
        leadLimit: leadLimits[planTier as keyof typeof leadLimits] || 500,
        currentPeriodStart: new Date(),
        currentPeriodEnd: newPeriodEnd,
      },
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "SUBSCRIPTION_CHANGED",
      entityType: "SUBSCRIPTION",
      entityId: updatedSub.id,
      details: { plan: planTier, billingCycle, subscriptionId: subResult.subscriptionId },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      checkoutUrl: subResult.checkoutUrl,
    });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

