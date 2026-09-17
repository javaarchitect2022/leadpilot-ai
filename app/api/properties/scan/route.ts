import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTenant } from "@/lib/tenant";
import { getVisionScannerService } from "@/services/ai/vision-scanner";
import { recordAuditLog } from "@/services/audit";

const ScanRequestSchema = z.object({
  image: z.string().min(10, "Image base64 data is required"),
  mimeType: z.string().optional().default("image/jpeg"),
});

export async function POST(req: NextRequest) {
  try {
    const { context, errorResponse } = await requireTenant(req, "property:create");
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = ScanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const scanner = getVisionScannerService();
    const result = await scanner.scanImage(parsed.data.image, parsed.data.mimeType);

    // Record audit event
    await recordAuditLog({
      organizationId: context.organizationId,
      userId: context.user.userId,
      action: "AI_ANALYSIS_CREATED",
      entityType: "PROPERTY",
      entityId: "vision_scan",
      details: {
        detectedType: result.detectedType,
        confidence: result.confidenceScore,
        location: result.location,
        hasPhone: !!result.contactPhone,
      },
    });

    return NextResponse.json({
      success: true,
      scanResult: result,
    });
  } catch (err: any) {
    console.error("Property Vision Scan Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to scan property image" },
      { status: 500 }
    );
  }
}

