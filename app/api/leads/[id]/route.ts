import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "lead:view");
  if (errorResponse) return errorResponse;

  const lead = await prisma.lead.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
    include: {
      assignedUser: { select: { id: true, name: true, email: true, phone: true } },
      aiAnalysis: true,
      followUps: {
        orderBy: { scheduledAt: "desc" },
        include: { assignedUser: { select: { id: true, name: true } } },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Parse missingInformation and classification safely
  let missingInfo: string[] = [];
  let leadClassification = "GENUINE_BUYER";
  let classificationReason = "Direct end-buyer inquiry";

  if (lead.aiAnalysis?.missingInformation) {
    try {
      missingInfo = JSON.parse(lead.aiAnalysis.missingInformation);
    } catch {
      missingInfo = [];
    }
  }

  if (lead.aiAnalysis?.rawOutput) {
    try {
      const parsed = JSON.parse(lead.aiAnalysis.rawOutput);
      if (parsed.leadClassification) leadClassification = parsed.leadClassification;
      if (parsed.classificationReason) classificationReason = parsed.classificationReason;
    } catch {}
  }

  return NextResponse.json({
    lead: {
      ...lead,
      leadClassification,
      classificationReason,
      aiAnalysis: lead.aiAnalysis
        ? {
            ...lead.aiAnalysis,
            missingInformation: missingInfo,
            leadClassification,
            classificationReason,
          }
        : null,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "lead:update");
  if (errorResponse) return errorResponse;

  const body = await req.json();

  // Validate tenant ownership
  const existing = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      phone: body.phone !== undefined ? body.phone : undefined,
      email: body.email !== undefined ? body.email : undefined,
      requirement: body.requirement !== undefined ? body.requirement : undefined,
      location: body.location !== undefined ? body.location : undefined,
      budgetMin: body.budgetMin !== undefined ? body.budgetMin : undefined,
      budgetMax: body.budgetMax !== undefined ? body.budgetMax : undefined,
      propertyType: body.propertyType !== undefined ? body.propertyType : undefined,
      bedrooms: body.bedrooms !== undefined ? body.bedrooms : undefined,
      priority: body.priority !== undefined ? body.priority : undefined,
      urgency: body.urgency !== undefined ? body.urgency : undefined,
      leadScore: body.leadScore !== undefined ? body.leadScore : undefined,
    },
  });

  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "LEAD_UPDATED",
    entityType: "LEAD",
    entityId: updated.id,
    details: body,
  });

  return NextResponse.json({ success: true, lead: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "lead:delete");
  if (errorResponse) return errorResponse;

  const existing = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  await prisma.lead.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

