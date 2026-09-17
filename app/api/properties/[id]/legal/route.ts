import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";
import {
  LegalChecklistSchema,
  calculateLegalMetrics,
} from "@/lib/validations/legal";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { context, errorResponse } = await requireTenant(req, "property:view");
  if (errorResponse) return errorResponse;

  const property = await prisma.property.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
    select: {
      id: true,
      title: true,
      location: true,
      city: true,
      price: true,
      status: true,
      legalStatus: true,
      legalVerification: true,
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let checklist = LegalChecklistSchema.parse({});
  if (property.legalVerification) {
    try {
      const parsed = JSON.parse(property.legalVerification);
      checklist = LegalChecklistSchema.parse({
        ...parsed,
        status: (property.legalStatus as any) || parsed.status,
      });
    } catch {
      // Use defaults if corrupted or empty
    }
  }

  return NextResponse.json({
    property: {
      ...property,
      legalChecklist: checklist,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { context, errorResponse } = await requireTenant(req, "property:update");
  if (errorResponse) return errorResponse;

  const existing = await prisma.property.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  try {
    const body = await req.json();

    // Compute updated score and status
    const metrics = calculateLegalMetrics(body);

    const fullChecklist = {
      ...body,
      score: metrics.score,
      status: metrics.status,
      verifiedDate: new Date().toISOString(),
    };

    const validated = LegalChecklistSchema.parse(fullChecklist);

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        legalStatus: (metrics.status as any),
        legalVerification: JSON.stringify(validated),
      },
    });

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "PROPERTY_UPDATED",
      entityType: "PROPERTY",
      entityId: params.id,
      details: {
        legalScore: metrics.score,
        legalStatus: metrics.status,
        advocate: validated.advocateName,
      },
    });

    return NextResponse.json({
      success: true,
      legalStatus: updated.legalStatus,
      legalChecklist: validated,
    });
  } catch (err: any) {
    console.error("Legal Due Diligence update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update legal verification" },
      { status: 400 }
    );
  }
}

