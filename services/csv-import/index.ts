import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/services/audit";

export interface CsvLeadRow {
  name: string;
  phone: string;
  email?: string;
  requirement?: string;
  budget?: string | number;
  location?: string;
  source?: string;
}

export interface CsvPreviewRecord {
  rowNumber: number;
  data: CsvLeadRow;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
}

export interface CsvPreviewResult {
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  headers: string[];
  records: CsvPreviewRecord[];
}

export function parseCsvContent(csvString: string): { data: any[]; headers: string[] } {
  const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  return {
    data: parsed.data,
    headers: parsed.meta.fields || [],
  };
}

export async function validateAndPreviewCsv(
  organizationId: string,
  rows: any[],
  columnMapping: Record<string, string> // e.g. { name: "customer_name", phone: "mobile", ... }
): Promise<CsvPreviewResult> {
  const records: CsvPreviewRecord[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  // Pre-fetch all existing phones and emails in this tenant to prevent duplicate collisions
  const existingLeads = await prisma.lead.findMany({
    where: { organizationId },
    select: { phone: true, email: true },
  });

  const existingPhones = new Set(
    existingLeads.map((l) => l.phone.replace(/[^0-9]/g, "").slice(-10))
  );
  const existingEmails = new Set(
    existingLeads.map((l) => l.email?.toLowerCase().trim()).filter(Boolean)
  );

  const seenInBatchPhones = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];

    // Extract mapped values
    const name = (row[columnMapping.name || "name"] || "").toString().trim();
    const rawPhone = (row[columnMapping.phone || "phone"] || "").toString().trim();
    const rawEmail = (row[columnMapping.email || "email"] || "").toString().trim();
    const requirement = (row[columnMapping.requirement || "requirement"] || "").toString().trim();
    const rawBudget = (row[columnMapping.budget || "budget"] || "").toString().trim();
    const location = (row[columnMapping.location || "location"] || "").toString().trim();
    const source = (row[columnMapping.source || "source"] || "CSV").toString().trim().toUpperCase();

    // Clean phone
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    const normalizedPhone10 = cleanPhone.slice(-10);

    if (!name) {
      errors.push("Name is required");
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      errors.push("Valid phone number with at least 10 digits is required");
    }

    if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      errors.push("Invalid email format");
    }

    // Parse budget
    let budgetNum: number | undefined = undefined;
    if (rawBudget) {
      const parsedBudget = parseFloat(rawBudget.replace(/[^0-9.]/g, ""));
      if (!isNaN(parsedBudget)) {
        budgetNum = parsedBudget;
      }
    }

    // Check duplicate
    let isDuplicate = false;
    let duplicateReason = "";

    if (normalizedPhone10 && existingPhones.has(normalizedPhone10)) {
      isDuplicate = true;
      duplicateReason = `Phone number already exists in CRM`;
    } else if (rawEmail && existingEmails.has(rawEmail.toLowerCase())) {
      isDuplicate = true;
      duplicateReason = `Email already exists in CRM`;
    } else if (normalizedPhone10 && seenInBatchPhones.has(normalizedPhone10)) {
      isDuplicate = true;
      duplicateReason = `Duplicate phone number within this CSV file`;
    }

    if (normalizedPhone10) {
      seenInBatchPhones.add(normalizedPhone10);
    }

    const isValid = errors.length === 0;

    if (isValid && !isDuplicate) {
      validCount++;
    } else if (isDuplicate) {
      duplicateCount++;
    } else {
      invalidCount++;
    }

    records.push({
      rowNumber: i + 1,
      data: {
        name,
        phone: rawPhone,
        email: rawEmail || undefined,
        requirement: requirement || undefined,
        budget: budgetNum,
        location: location || undefined,
        source,
      },
      isValid,
      errors,
      isDuplicate,
      duplicateReason: duplicateReason || undefined,
    });
  }

  return {
    totalRows: rows.length,
    validRows: validCount,
    duplicateRows: duplicateCount,
    invalidRows: invalidCount,
    headers: Object.keys(rows[0] || {}),
    records,
  };
}

export async function executeCsvImport(
  organizationId: string,
  userId: string,
  validRecords: CsvLeadRow[],
  skipDuplicates: boolean = true
) {
  let importedCount = 0;
  const createdLeadIds: string[] = [];

  for (const record of validRecords) {
    const cleanPhone = record.phone.replace(/[^0-9]/g, "").slice(-10);

    // Final safety check against duplicates
    if (skipDuplicates) {
      const existing = await prisma.lead.findFirst({
        where: {
          organizationId,
          phone: { contains: cleanPhone },
        },
      });
      if (existing) continue;
    }

    const budget = typeof record.budget === "number" ? record.budget : undefined;

    const lead = await prisma.lead.create({
      data: {
        organizationId,
        name: record.name,
        phone: record.phone,
        email: record.email || null,
        requirement: record.requirement || null,
        location: record.location || null,
        budgetMax: budget || null,
        source: "CSV" as any,
        status: "NEW" as any,
        leadScore: 40,
      },
    });

    createdLeadIds.push(lead.id);
    importedCount++;
  }

  await recordAuditLog({
    organizationId,
    userId,
    action: "LEAD_CREATED",
    entityType: "LEAD",
    details: { count: importedCount, source: "CSV_IMPORT" },
  });

  return {
    success: true,
    importedCount,
    createdLeadIds,
  };
}

