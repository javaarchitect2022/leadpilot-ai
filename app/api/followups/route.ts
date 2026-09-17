import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";

const CreateFollowUpSchema = z.object({
  leadId: z.string().min(1, "leadId is required"),
  scheduledAt: z.string(),
  type: z.enum(["CALL", "WHATSAPP", "EMAIL", "TASK"]).default("CALL"),
  message: z.string().optional(),
  assignedUserId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "followup:view");
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // PENDING, COMPLETED, etc.
  const filter = url.searchParams.get("filter"); // TODAY, OVERDUE, UPCOMING
  const leadId = url.searchParams.get("leadId");
  const assignedUserId = url.searchParams.get("assignedUserId");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const where: any = {
    organizationId: context.organizationId,
  };

  if (status) where.status = status;
  if (leadId) where.leadId = leadId;
  if (assignedUserId) where.assignedUserId = assignedUserId;

  if (filter === "TODAY") {
    where.scheduledAt = { gte: startOfToday, lte: endOfToday };
  } else if (filter === "OVERDUE") {
    where.scheduledAt = { lt: startOfToday };
    where.status = "PENDING";
  } else if (filter === "UPCOMING") {
    where.scheduledAt = { gt: endOfToday };
  }

  const followUps = await prisma.followUp.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          phone: true,
          leadScore: true,
          status: true,
          location: true,
        },
      },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ followUps });
}

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "followup:create");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = CreateFollowUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const lead = await prisma.lead.findFirst({
      where: { id: data.leadId, organizationId: context.organizationId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const scheduledDate = new Date(data.scheduledAt);

    const followUp = await prisma.followUp.create({
      data: {
        organizationId: context.organizationId,
        leadId: lead.id,
        assignedUserId: data.assignedUserId || context.user.userId,
        scheduledAt: scheduledDate,
        type: data.type,
        status: "PENDING",
        message: data.message || null,
      },
    });

    // Update lead's nextFollowUpAt field
    await prisma.lead.update({
      where: { id: lead.id },
      data: { nextFollowUpAt: scheduledDate },
    });

    // Record Activity
    await prisma.activity.create({
      data: {
        organizationId: context.organizationId,
        leadId: lead.id,
        userId: context.user.userId,
        type: data.type === "CALL" ? "CALL" : data.type === "WHATSAPP" ? "WHATSAPP" : "NOTE",
        description: `Follow-up (${data.type}) scheduled for ${scheduledDate.toLocaleDateString()}: ${data.message || 'General check-in'}`,
      },
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "FOLLOWUP_CREATED",
      entityType: "FOLLOWUP",
      entityId: followUp.id,
      details: { type: followUp.type, scheduledAt: followUp.scheduledAt },
    });

    return NextResponse.json({ success: true, followUp }, { status: 201 });
  } catch (error: any) {
    console.error("Create follow-up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

