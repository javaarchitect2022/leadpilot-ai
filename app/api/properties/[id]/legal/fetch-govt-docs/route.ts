import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";
import { getTamilNaduLandRecordsFetcher } from "@/services/govt-connectors/tn-land-fetcher";
import { z } from "zod";

const FetchGovtDocsSchema = z.object({
  action: z.enum(["EC", "PATTA", "ALL"]).default("ALL"),
  zone: z.string().optional(),
  district: z.string().min(1, "District is required"),
  taluk: z.string().min(1, "Taluk is required"),
  sro: z.string().optional(),
  village: z.string().min(1, "Village is required"),
  surveyNumber: z.string().min(1, "Survey number is required"),
  subDivision: z.string().min(1, "Sub-division is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { context, errorResponse } = await requireTenant(req, "property:update");
  if (errorResponse) return errorResponse;

  const property = await prisma.property.findFirst({
    where: {
      id: params.id,
      organizationId: context.organizationId,
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  try {
    const rawBody = await req.json();
    const validated = FetchGovtDocsSchema.parse(rawBody);
    const fetcher = getTamilNaduLandRecordsFetcher();

    const fetchParams = {
      zone: validated.zone,
      district: validated.district,
      taluk: validated.taluk,
      sro: validated.sro,
      village: validated.village,
      surveyNumber: validated.surveyNumber,
      subDivision: validated.subDivision,
      startDate: validated.startDate,
      endDate: validated.endDate,
    };

    let result: any;

    if (validated.action === "EC") {
      result = await fetcher.fetchAndStoreEC(params.id, context.organizationId, fetchParams);
    } else if (validated.action === "PATTA") {
      result = await fetcher.fetchAndStorePatta(params.id, context.organizationId, fetchParams);
    } else {
      result = await fetcher.fetchAndReconcileAll(params.id, context.organizationId, fetchParams);
    }

    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "PROPERTY_UPDATED",
      entityType: "PROPERTY",
      entityId: params.id,
      details: {
        action: `GOVT_RECORD_FETCHED_${validated.action}`,
        district: validated.district,
        taluk: validated.taluk,
        surveyNumber: `${validated.surveyNumber}/${validated.subDivision}`,
        score: result.checklistUpdates.score,
        status: result.checklistUpdates.status,
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Fetch Govt Records Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch government land records" },
      { status: 400 }
    );
  }
}

