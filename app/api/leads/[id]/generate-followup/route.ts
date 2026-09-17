import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { getAiProvider } from "@/services/ai";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "ai:use");
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const followUpType = body.followUpType || "WHATSAPP";

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
    include: {
      organization: { include: { settings: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const ai = getAiProvider(lead.organization.settings?.preferredAiProvider);
  const result = await ai.generateFollowUp({
    lead: {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      location: lead.location,
      requirement: lead.requirement,
      budgetMax: lead.budgetMax,
    },
    conversationHistory: lead.activities.map((a) => a.description),
    businessInfo: {
      name: lead.organization.name,
      agentName: context.user.name,
    },
    followUpType,
  });

  return NextResponse.json({
    success: true,
    suggestedMessage: result.followUpMessage,
    suggestedScheduledDate: result.suggestedScheduledDate,
    model: result.model,
  });
}

