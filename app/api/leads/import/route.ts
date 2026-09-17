import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant";
import {
  validateAndPreviewCsv,
  executeCsvImport,
  parseCsvContent,
} from "@/services/csv-import";

export async function POST(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "lead:create");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { action, csvContent, rows, columnMapping, validRecords, skipDuplicates } = body;

    if (action === "preview") {
      let parsedRows = rows;
      if (csvContent && !parsedRows) {
        const parsed = parseCsvContent(csvContent);
        parsedRows = parsed.data;
      }

      if (!parsedRows || !Array.isArray(parsedRows) || parsedRows.length === 0) {
        return NextResponse.json({ error: "No CSV records found" }, { status: 400 });
      }

      const preview = await validateAndPreviewCsv(
        context.organizationId,
        parsedRows,
        columnMapping || {
          name: "name",
          phone: "phone",
          email: "email",
          requirement: "requirement",
          budget: "budget",
          location: "location",
          source: "source",
        }
      );

      return NextResponse.json({ success: true, preview });
    }

    if (action === "execute") {
      if (!validRecords || !Array.isArray(validRecords) || validRecords.length === 0) {
        return NextResponse.json({ error: "No records to import" }, { status: 400 });
      }

      const result = await executeCsvImport(
        context.organizationId,
        context.user.userId,
        validRecords,
        skipDuplicates ?? true
      );

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

