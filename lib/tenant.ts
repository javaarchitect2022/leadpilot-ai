import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, SessionUser } from "./auth";
import { hasPermission, ResourceAction } from "./rbac";

export interface TenantContext {
  user: SessionUser;
  organizationId: string;
}

/**
 * Enforces authentication and extracts the user's organization context.
 * Returns TenantContext or throws a response error if unauthenticated.
 */
export async function requireTenant(
  req: NextRequest,
  requiredAction?: ResourceAction
): Promise<{ context: TenantContext; errorResponse?: NextResponse }> {
  const user = await getSessionFromRequest(req);

  if (!user || !user.organizationId) {
    return {
      context: null as unknown as TenantContext,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (requiredAction && !hasPermission(user.role, requiredAction)) {
    return {
      context: null as unknown as TenantContext,
      errorResponse: NextResponse.json(
        { error: `Forbidden. Role '${user.role}' lacks permission for '${requiredAction}'.` },
        { status: 403 }
      ),
    };
  }

  return {
    context: {
      user,
      organizationId: user.organizationId,
    },
  };
}

/**
 * Returns a strictly scoped WHERE clause object for Prisma queries.
 * Guarantees that no query executes without the tenant's organizationId filter.
 */
export function tenantFilter<T extends Record<string, any> = Record<string, any>>(
  organizationId: string,
  additionalWhere: T = {} as T
): T & { organizationId: string } {
  if (!organizationId) {
    throw new Error("Tenant isolation violation: organizationId is required");
  }
  return {
    ...additionalWhere,
    organizationId,
  };
}

