import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "settings:view");
  if (errorResponse) return errorResponse;

  const org = await prisma.organization.findUnique({
    where: { id: context.organizationId },
    include: {
      settings: true,
      subscription: true,
    },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Also fetch plan configurations
  const plans = await prisma.planConfig.findMany({
    orderBy: { priceMonthly: "asc" },
  });

  return NextResponse.json({
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      businessType: org.businessType,
      city: org.city,
      country: org.country,
      phone: org.phone,
      email: org.email,
      currency: org.currency,
    },
    settings: org.settings,
    subscription: org.subscription,
    availablePlans: plans,
  });
}

export async function PATCH(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "settings:update");
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const {
    name,
    city,
    phone,
    email,
    businessType,
    preferredAiProvider,
    aiResponseTone,
    businessDescription,
    defaultLanguage,
    followUpRules,
  } = body;

  // Update organization profile
  const updatedOrg = await prisma.organization.update({
    where: { id: context.organizationId },
    data: {
      name: name !== undefined ? name : undefined,
      city: city !== undefined ? city : undefined,
      phone: phone !== undefined ? phone : undefined,
      email: email !== undefined ? email : undefined,
      businessType: businessType !== undefined ? businessType : undefined,
    },
  });

  // Upsert settings
  const updatedSettings = await prisma.organizationSettings.upsert({
    where: { organizationId: context.organizationId },
    create: {
      organizationId: context.organizationId,
      preferredAiProvider: preferredAiProvider || "GEMINI",
      aiResponseTone: aiResponseTone || "Professional real estate advisor",
      businessDescription: businessDescription || null,
      defaultLanguage: defaultLanguage || "English (Indian)",
      followUpRules: followUpRules ? JSON.stringify(followUpRules) : undefined,
    },
    update: {
      preferredAiProvider: preferredAiProvider !== undefined ? preferredAiProvider : undefined,
      aiResponseTone: aiResponseTone !== undefined ? aiResponseTone : undefined,
      businessDescription: businessDescription !== undefined ? businessDescription : undefined,
      defaultLanguage: defaultLanguage !== undefined ? defaultLanguage : undefined,
      followUpRules: followUpRules !== undefined ? JSON.stringify(followUpRules) : undefined,
    },
  });

  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "USER_LOGIN",
    entityType: "ORGANIZATION" as any,
    entityId: context.organizationId,
    details: { settingsUpdated: true },
  });

  return NextResponse.json({
    success: true,
    organization: updatedOrg,
    settings: updatedSettings,
  });
}

