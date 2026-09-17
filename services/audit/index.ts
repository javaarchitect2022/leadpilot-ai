import { prisma } from "@/lib/prisma";

export type AuditActionType =
  | "USER_LOGIN"
  | "LEAD_CREATED"
  | "LEAD_UPDATED"
  | "LEAD_ASSIGNED"
  | "LEAD_STATUS_CHANGED"
  | "AI_ANALYSIS_CREATED"
  | "AI_REPLY_GENERATED"
  | "FOLLOWUP_CREATED"
  | "FOLLOWUP_COMPLETED"
  | "PROPERTY_CREATED"
  | "PROPERTY_UPDATED"
  | "SUBSCRIPTION_CHANGED";

export interface LogAuditInput {
  organizationId: string;
  userId?: string | null;
  action: AuditActionType;
  entityType: "LEAD" | "USER" | "FOLLOWUP" | "PROPERTY" | "SUBSCRIPTION" | "AI";
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export async function recordAuditLog(input: LogAuditInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId || null,
        action: input.action as any,
        entityType: input.entityType,
        entityId: input.entityId || null,
        details: input.details ? JSON.stringify(input.details) : null,
        ipAddress: input.ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
    return null;
  }
}

