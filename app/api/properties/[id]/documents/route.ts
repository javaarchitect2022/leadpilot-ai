import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { recordAuditLog } from "@/services/audit";
import { calculateLegalMetrics, LegalChecklist, LegalChecklistSchema } from "@/lib/validations/legal";
import fs from "fs";
import path from "path";

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
    select: { id: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const documents = await prisma.propertyDocument.findMany({
    where: {
      propertyId: params.id,
      organizationId: context.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    documents: documents.map((doc) => ({
      id: doc.id,
      documentType: doc.documentType,
      title: doc.title,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      status: doc.status,
      extractedData: doc.extractedData ? JSON.parse(doc.extractedData) : {},
      verifiedAt: doc.verifiedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { context, errorResponse } = await requireTenant(req, "property:update");
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  let documentId = url.searchParams.get("documentId");
  if (!documentId) {
    try {
      const body = await req.json();
      documentId = body?.documentId;
    } catch {
      // Body parsing optional
    }
  }

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  const document = await prisma.propertyDocument.findFirst({
    where: {
      id: documentId,
      propertyId: params.id,
      organizationId: context.organizationId,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Attempt to delete physical PDF/HTML file from public folder if present
  if (document.fileUrl && document.fileUrl.startsWith("/")) {
    try {
      const physicalPath = path.join(process.cwd(), "public", document.fileUrl.replace(/^\//, ""));
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
    } catch (fsErr) {
      console.warn("Could not delete physical document file:", fsErr);
    }
  }

  // Delete from database
  await prisma.propertyDocument.delete({
    where: { id: documentId },
  });

  // Check remaining documents of same type to update checklist if necessary
  const remainingSameType = await prisma.propertyDocument.count({
    where: {
      propertyId: params.id,
      documentType: document.documentType,
    },
  });

  let updatedChecklist: Partial<LegalChecklist> | null = null;
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    select: { legalVerification: true, legalStatus: true },
  });

  if (property && property.legalVerification) {
    try {
      const parsedChecklist: Partial<LegalChecklist> = JSON.parse(property.legalVerification);
      let changed = false;

      if (document.documentType === "ENCUMBRANCE_CERTIFICATE" && remainingSameType === 0) {
        parsedChecklist.ec30Years = false;
        changed = true;
      } else if (document.documentType === "PATTA_CHITTA" && remainingSameType === 0) {
        parsedChecklist.pattaChitta = false;
        changed = true;
      }

      if (changed) {
        const metrics = calculateLegalMetrics(parsedChecklist);
        const fullChecklist = {
          ...parsedChecklist,
          score: metrics.score,
          status: metrics.status,
          verifiedDate: new Date().toISOString(),
        };
        const validated = LegalChecklistSchema.parse(fullChecklist);

        await prisma.property.update({
          where: { id: params.id },
          data: {
            legalStatus: metrics.status as any,
            legalVerification: JSON.stringify(validated),
          },
        });
        updatedChecklist = validated;
      }
    } catch (err) {
      console.warn("Checklist update error after doc deletion:", err);
    }
  }

  // Record audit log for rejection/deletion
  await recordAuditLog({
    organizationId: context.organizationId,
    userId: context.user.userId,
    action: "PROPERTY_UPDATED",
    entityType: "PROPERTY",
    entityId: params.id,
    details: {
      subAction: "PROPERTY_DOCUMENT_REJECTED",
      documentId,
      title: document.title,
      documentType: document.documentType,
      action: "REJECT_AND_DELETE",
      remainingCount: remainingSameType,
    },
  });

  return NextResponse.json({
    success: true,
    deletedId: documentId,
    documentType: document.documentType,
    remainingSameType,
    updatedChecklist,
    message: "Document successfully rejected and removed from database.",
  });
}
