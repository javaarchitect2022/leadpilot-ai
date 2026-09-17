import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "lead:update");
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { status, note } = body;

  const validStatuses = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "FOLLOW_UP",
    "SITE_VISIT",
    "NEGOTIATION",
    "CONVERTED",
    "LOST",
  ];

  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const oldStatus = lead.status;
  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: {
      status: status as any,
      lastContactedAt: new Date(),
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      organizationId: context.organizationId,
      leadId: lead.id,
      userId: context.user.userId,
      type: "STATUS_CHANGE",
      description: `Status changed from ${oldStatus} to ${status}${note ? `: "${note}"` : ""}`,
      metadata: JSON.stringify({ oldStatus, newStatus: status }),
    },
  });

  // Record audit log
  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "LEAD_STATUS_CHANGED",
    entityType: "LEAD",
    entityId: lead.id,
    details: { oldStatus, newStatus: status, note },
  });

  return NextResponse.json({ success: true, lead: updated });
}

