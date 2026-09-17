import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "lead:assign");
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { assignedUserId } = body;

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  let assignedUser = null;
  if (assignedUserId) {
    assignedUser = await prisma.user.findFirst({
      where: { id: assignedUserId, organizationId: context.organizationId },
    });
    if (!assignedUser) {
      return NextResponse.json({ error: "Assigned user not found in organization" }, { status: 400 });
    }
  }

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: { assignedUserId: assignedUserId || null },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      organizationId: context.organizationId,
      leadId: lead.id,
      userId: context.user.userId,
      type: "ASSIGNMENT",
      description: assignedUser
        ? `Lead assigned to ${assignedUser.name}`
        : "Lead unassigned",
    },
  });

  // Notification for assigned salesperson
  if (assignedUser && assignedUser.id !== context.user.userId) {
    await prisma.notification.create({
      data: {
        organizationId: context.organizationId,
        userId: assignedUser.id,
        title: "New Lead Assigned",
        message: `${lead.name} has been assigned to you. Lead Score: ${lead.leadScore}`,
        type: "NEW_LEAD",
        linkUrl: `/leads/${lead.id}`,
      },
    });
  }

  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "LEAD_ASSIGNED",
    entityType: "LEAD",
    entityId: lead.id,
    details: { assignedUserId, assignedUserName: assignedUser?.name },
  });

  return NextResponse.json({ success: true, lead: updated });
}

