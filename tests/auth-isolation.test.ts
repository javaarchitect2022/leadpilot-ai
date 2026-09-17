import { describe, it, expect } from "vitest";
import { hasPermission, canManageBilling, canManageTeam } from "../lib/rbac";
import { tenantFilter } from "../lib/tenant";

describe("Tenant Isolation & Role Authorization", () => {
  it("tenantFilter should enforce organizationId on all query scopes", () => {
    const orgId = "org_chennai_123";
    const filter = tenantFilter(orgId, { status: "NEW" });

    expect(filter.organizationId).toBe(orgId);
    expect(filter.status).toBe("NEW");
  });

  it("tenantFilter must throw if organizationId is missing", () => {
    expect(() => tenantFilter("", { status: "NEW" })).toThrow(
      "Tenant isolation violation: organizationId is required"
    );
  });

  it("RBAC: SALES_USER can view leads and followups, but cannot manage team or billing", () => {
    const role = "SALES_USER";

    expect(hasPermission(role, "lead:view")).toBe(true);
    expect(hasPermission(role, "lead:create")).toBe(true);
    expect(hasPermission(role, "followup:complete")).toBe(true);

    // Forbidden actions
    expect(hasPermission(role, "lead:delete")).toBe(false);
    expect(hasPermission(role, "team:invite")).toBe(false);
    expect(hasPermission(role, "subscription:manage")).toBe(false);
    expect(hasPermission(role, "settings:update")).toBe(false);

    expect(canManageBilling(role)).toBe(false);
    expect(canManageTeam(role)).toBe(false);
  });

  it("RBAC: MANAGER can view and assign leads, but cannot manage billing", () => {
    const role = "MANAGER";

    expect(hasPermission(role, "lead:view")).toBe(true);
    expect(hasPermission(role, "lead:assign")).toBe(true);
    expect(hasPermission(role, "analytics:view")).toBe(true);

    expect(hasPermission(role, "subscription:manage")).toBe(false);
    expect(canManageBilling(role)).toBe(false);
  });

  it("RBAC: OWNER has full access including team, settings, and subscription management", () => {
    const role = "OWNER";

    expect(hasPermission(role, "lead:view")).toBe(true);
    expect(hasPermission(role, "lead:delete")).toBe(true);
    expect(hasPermission(role, "team:invite")).toBe(true);
    expect(hasPermission(role, "team:remove")).toBe(true);
    expect(hasPermission(role, "subscription:manage")).toBe(true);
    expect(hasPermission(role, "settings:update")).toBe(true);

    expect(canManageBilling(role)).toBe(true);
    expect(canManageTeam(role)).toBe(true);
  });
});

