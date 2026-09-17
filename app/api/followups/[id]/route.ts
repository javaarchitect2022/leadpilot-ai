import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "followup:update");
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { status, message, scheduledAt } = body;

  const followUp = await prisma.followUp.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
    include: { lead: true },
  });

  if (!followUp) {
    return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
  }

  const isCompleted = status === "COMPLETED";

  const updated = await prisma.followUp.update({
    where: { id: params.id },
    data: {
      status: status || undefined,
      message: message !== undefined ? message : undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      completedAt: isCompleted ? new Date() : undefined,
    },
  });

  if (isCompleted) {
    // Record completion in activity log
    await prisma.activity.create({
      data: {
        organizationId: context.organizationId,
        leadId: followUp.leadId,
        userId: context.user.userId,
        type: followUp.type === "CALL" ? "CALL" : followUp.type === "WHATSAPP" ? "WHATSAPP" : "NOTE",
        description: `Completed follow-up (${followUp.type}): ${followUp.message || 'Check-in'}`,
      },
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "FOLLOWUP_COMPLETED",
      entityType: "FOLLOWUP",
      entityId: followUp.id,
      details: { type: followUp.type },
    });
  }

  return NextResponse.json({ success: true, followUp: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "followup:update");
  if (errorResponse) return errorResponse;

  const followUp = await prisma.followUp.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
  });

  if (!followUp) {
    return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
  }

  await prisma.followUp.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

