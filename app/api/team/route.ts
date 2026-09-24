import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { DEMO_TEAM_USERS } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "team:view");
  if (errorResponse) return errorResponse;

  try {
    const users = await prisma.user.findMany({
      where: { organizationId: context.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignedLeads: true, assignedFollowUps: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (users && users.length > 0) {
      return NextResponse.json({ users });
    }

    throw new Error("No database records found, fallback to demo team");
  } catch (err) {
    console.warn("Database query failed in /api/team, serving demo team fallback:", err);
    return NextResponse.json({ users: DEMO_TEAM_USERS });
  }
}
