import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "team:view");
  if (errorResponse) return errorResponse;

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

  return NextResponse.json({ users });
}

