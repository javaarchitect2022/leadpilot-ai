export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "SALES_USER";

export type ResourceAction =
  | "lead:view"
  | "lead:create"
  | "lead:update"
  | "lead:delete"
  | "lead:assign"
  | "property:view"
  | "property:create"
  | "property:update"
  | "property:delete"
  | "followup:view"
  | "followup:create"
  | "followup:update"
  | "followup:complete"
  | "team:view"
  | "team:invite"
  | "team:update"
  | "team:remove"
  | "settings:view"
  | "settings:update"
  | "subscription:view"
  | "subscription:manage"
  | "ai:use"
  | "ai:configure"
  | "analytics:view";

const ROLE_PERMISSIONS: Record<UserRole, ResourceAction[]> = {
  OWNER: [
    "lead:view", "lead:create", "lead:update", "lead:delete", "lead:assign",
    "property:view", "property:create", "property:update", "property:delete",
    "followup:view", "followup:create", "followup:update", "followup:complete",
    "team:view", "team:invite", "team:update", "team:remove",
    "settings:view", "settings:update",
    "subscription:view", "subscription:manage",
    "ai:use", "ai:configure",
    "analytics:view",
  ],
  ADMIN: [
    "lead:view", "lead:create", "lead:update", "lead:delete", "lead:assign",
    "property:view", "property:create", "property:update", "property:delete",
    "followup:view", "followup:create", "followup:update", "followup:complete",
    "team:view", "team:invite", "team:update",
    "settings:view", "settings:update",
    "subscription:view",
    "ai:use", "ai:configure",
    "analytics:view",
  ],
  MANAGER: [
    "lead:view", "lead:create", "lead:update", "lead:assign",
    "property:view", "property:create", "property:update",
    "followup:view", "followup:create", "followup:update", "followup:complete",
    "team:view",
    "settings:view",
    "ai:use",
    "analytics:view",
  ],
  SALES_USER: [
    "lead:view", "lead:create", "lead:update",
    "property:view",
    "followup:view", "followup:create", "followup:update", "followup:complete",
    "team:view",
    "ai:use",
  ],
};

export function hasPermission(role: string, action: ResourceAction): boolean {
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  return permissions.includes(action);
}

export function canManageTeam(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageBilling(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

