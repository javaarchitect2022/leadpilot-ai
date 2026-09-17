import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { getAiProvider } from "@/services/ai";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "ai:use");
  if (errorResponse) return errorResponse;

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
    include: { organization: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const textToAnalyze = lead.requirement || `Customer ${lead.name} inquiring about properties in ${lead.location || "the city"}.`;

  const startTime = Date.now();
  const ai = getAiProvider();
  const analysis = await ai.analyzeLead(textToAnalyze, `${lead.organization.name} - ${lead.organization.city}`);
  const durationMs = Date.now() - startTime;

  // Upsert AiAnalysis
  const aiRecord = await prisma.aiAnalysis.upsert({
    where: { leadId: lead.id },
    create: {
      organizationId: context.organizationId,
      leadId: lead.id,
      summary: analysis.summary,
      intent: analysis.intent,
      location: analysis.location || lead.location || null,
      propertyType: analysis.propertyType || lead.propertyType || null,
      bedrooms: analysis.bedrooms ?? lead.bedrooms ?? null,
      budgetMin: analysis.budgetMin ?? lead.budgetMin ?? null,
      budgetMax: analysis.budgetMax ?? lead.budgetMax ?? null,
      urgency: analysis.urgency,
      leadScore: analysis.leadScore,
      missingInformation: JSON.stringify(analysis.missingInformation),
      recommendedNextAction: analysis.recommendedNextAction,
      modelUsed: ai.defaultModel,
    },
    update: {
      summary: analysis.summary,
      intent: analysis.intent,
      location: analysis.location || lead.location || null,
      propertyType: analysis.propertyType || lead.propertyType || null,
      bedrooms: analysis.bedrooms ?? lead.bedrooms ?? null,
      budgetMin: analysis.budgetMin ?? lead.budgetMin ?? null,
      budgetMax: analysis.budgetMax ?? lead.budgetMax ?? null,
      urgency: analysis.urgency,
      leadScore: analysis.leadScore,
      missingInformation: JSON.stringify(analysis.missingInformation),
      recommendedNextAction: analysis.recommendedNextAction,
      modelUsed: ai.defaultModel,
    },
  });

  // Update lead with AI scoring
  const updatedLead = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      leadScore: analysis.leadScore,
      priority: analysis.leadScore >= 80 ? "URGENT" : analysis.leadScore >= 60 ? "HIGH" : "MEDIUM",
      purchaseIntent: analysis.intent as any,
      urgency: analysis.urgency as any,
      location: analysis.location || lead.location,
      bedrooms: analysis.bedrooms ?? lead.bedrooms,
      budgetMin: analysis.budgetMin ?? lead.budgetMin,
      budgetMax: analysis.budgetMax ?? lead.budgetMax,
    },
  });

  // Record AI Audit record
  await prisma.aiAudit.create({
    data: {
      organizationId: context.organizationId,
      userId: context.user.userId,
      leadId: lead.id,
      prompt: textToAnalyze,
      model: ai.defaultModel,
      response: JSON.stringify(analysis),
      durationMs,
    },
  });

  // Record Activity
  await prisma.activity.create({
    data: {
      organizationId: context.organizationId,
      leadId: lead.id,
      userId: context.user.userId,
      type: "NOTE",
      description: `AI Analysis completed. Score: ${analysis.leadScore}/100. Intent: ${analysis.intent}.`,
      metadata: JSON.stringify({ leadScore: analysis.leadScore, summary: analysis.summary }),
    },
  });

  // Hot lead notification
  if (analysis.leadScore >= 80 && lead.assignedUserId) {
    await prisma.notification.create({
      data: {
        organizationId: context.organizationId,
        userId: lead.assignedUserId,
        title: "🔥 Hot Lead Detected!",
        message: `${lead.name} has a lead score of ${analysis.leadScore}. ${analysis.recommendedNextAction}`,
        type: "HOT_LEAD",
        linkUrl: `/leads/${lead.id}`,
      },
    });
  }

  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "AI_ANALYSIS_CREATED",
    entityType: "AI",
    entityId: aiRecord.id,
    details: { leadScore: analysis.leadScore, intent: analysis.intent },
  });

  return NextResponse.json({
    success: true,
    analysis: {
      ...aiRecord,
      missingInformation: analysis.missingInformation,
    },
    lead: updatedLead,
  });
}

