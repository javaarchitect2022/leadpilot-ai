import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { findMatchingProperties } from "@/services/property-matching";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { context, errorResponse } = await requireTenant(req, "lead:view");
  if (errorResponse) return errorResponse;

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: context.organizationId },
    include: { aiAnalysis: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const matches = await findMatchingProperties({
    organizationId: context.organizationId,
    location: lead.location || lead.aiAnalysis?.location,
    budgetMin: lead.budgetMin || lead.aiAnalysis?.budgetMin,
    budgetMax: lead.budgetMax || lead.aiAnalysis?.budgetMax,
    propertyType: lead.propertyType || lead.aiAnalysis?.propertyType,
    bedrooms: lead.bedrooms || lead.aiAnalysis?.bedrooms,
    requirement: lead.requirement,
  });

  return NextResponse.json({
    matches,
    totalMatches: matches.length,
  });
}

