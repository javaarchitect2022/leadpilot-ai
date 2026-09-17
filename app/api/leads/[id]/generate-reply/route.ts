import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { getAiProvider } from "@/services/ai";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "ai:use");
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const customInstructions = body.customInstructions || "";

  // 1. Fetch Lead
  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
    include: {
      organization: { include: { settings: true } },
      activities: {
        where: { type: { in: ["CALL", "WHATSAPP", "NOTE", "AI_REPLY"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // 2. Fetch Verified Available Properties from Database for this organization
  const availableProperties = await prisma.property.findMany({
    where: {
      organizationId: context.organizationId,
      status: "AVAILABLE",
    },
    take: 10,
    select: {
      id: true,
      title: true,
      location: true,
      city: true,
      price: true,
      propertyType: true,
      bedrooms: true,
      area: true,
      status: true,
      legalStatus: true,
    },
  });

  const previousMessages = lead.activities.map((a) => a.description);

  const startTime = Date.now();
  const ai = getAiProvider(lead.organization.settings?.preferredAiProvider);

  const result = await ai.generateReply({
    lead: {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      requirement: lead.requirement,
      location: lead.location,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      propertyType: lead.propertyType,
      bedrooms: lead.bedrooms,
      leadScore: lead.leadScore,
      urgency: lead.urgency,
      purchaseIntent: lead.purchaseIntent,
    },
    previousMessages,
    businessInfo: {
      name: lead.organization.name,
      city: lead.organization.city,
      description: lead.organization.settings?.businessDescription || undefined,
      agentName: context.user.name,
    },
    availableProperties,
    customInstructions,
  });

  const durationMs = Date.now() - startTime;

  // Store in AiAudit table
  await prisma.aiAudit.create({
    data: {
      organizationId: context.organizationId,
      userId: context.user.userId,
      leadId: lead.id,
      prompt: `Generate reply for ${lead.name} (${lead.requirement || 'No req'}). Grounded against ${availableProperties.length} available properties.`,
      model: result.model,
      response: result.reply,
      durationMs,
      tokenCount: result.tokenUsage?.totalTokens || null,
    },
  });

  // Record Audit Log
  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "AI_REPLY_GENERATED",
    entityType: "AI",
    entityId: lead.id,
    details: { model: result.model, length: result.reply.length },
  });

  return NextResponse.json({
    success: true,
    reply: result.reply,
    isDraft: true,
    model: result.model,
    matchedPropertyIds: result.matchedPropertyIds,
    verifiedInventoryCount: availableProperties.length,
  });
}

