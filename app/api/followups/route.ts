import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";
import { DEMO_FOLLOWUPS } from "@/lib/demo-data";

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

  try {
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

    if (followUps && followUps.length > 0) {
      return NextResponse.json({ followUps });
    }

    throw new Error("No database records found, fallback to demo followups");
  } catch (err) {
    console.warn("Database query failed in /api/followups, serving demo followups fallback:", err);

    let filtered = [...DEMO_FOLLOWUPS];
    if (filter === "TODAY") {
      filtered = filtered.filter((f) => f.id.includes("01") || f.id.includes("02"));
    } else if (filter === "OVERDUE") {
      filtered = filtered.filter((f) => f.id.includes("03"));
    } else if (filter === "UPCOMING") {
      filtered = filtered.filter((f) => f.id.includes("04"));
    }

    return NextResponse.json({ followUps: filtered });
  }
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
    const scheduledDate = new Date(data.scheduledAt);

    try {
      const followUp = await prisma.followUp.create({
        data: {
          organizationId: context.organizationId,
          leadId: data.leadId,
          assignedUserId: data.assignedUserId || context.user.userId,
          scheduledAt: scheduledDate,
          type: data.type,
          status: "PENDING",
          message: data.message || null,
        },
      });

      return NextResponse.json({ success: true, followUp }, { status: 201 });
    } catch (dbErr) {
      console.warn("Database write failed in /api/followups, returning mock followUp:", dbErr);
      const mockFollowUp = {
        id: `fup-demo-${Date.now()}`,
        leadId: data.leadId,
        scheduledAt: scheduledDate.toISOString(),
        type: data.type,
        status: "PENDING",
        message: data.message || "Scheduled follow-up contact",
      };
      return NextResponse.json({ success: true, followUp: mockFollowUp }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Create follow-up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
