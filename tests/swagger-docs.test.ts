import { describe, it, expect } from "vitest";
import { GET as getOpenApiSpec } from "@/app/api/openapi-spec/route";

describe("OpenAPI 3.0 Specification & Swagger Documentation", () => {
  it("should serve a valid OpenAPI 3.0.3 specification", async () => {
    const res = await getOpenApiSpec();
    expect(res.status).toBe(200);

    const spec = await res.json();
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toContain("LeadPilot AI");
    expect(spec.paths).toBeDefined();
  });

  it("should include Tamil Nadu government automation endpoints", async () => {
    const res = await getOpenApiSpec();
    const spec = await res.json();

    // 1. Fetch Govt Docs (TNREGINET EC & Patta)
    expect(spec.paths["/api/properties/{id}/legal/fetch-govt-docs"]).toBeDefined();
    const fetchGovtDocs = spec.paths["/api/properties/{id}/legal/fetch-govt-docs"].post;
    expect(fetchGovtDocs).toBeDefined();
    expect(fetchGovtDocs.summary).toContain("TNREGINET");

    // 2. TNREGINET Jurisdiction
    expect(spec.paths["/api/govt/tn/jurisdiction"]).toBeDefined();
    const jurisdiction = spec.paths["/api/govt/tn/jurisdiction"].get;
    expect(jurisdiction).toBeDefined();
    expect(jurisdiction.parameters.some((p: any) => p.name === "action")).toBe(true);
  });

  it("should include document rejection and legal checklist endpoints", async () => {
    const res = await getOpenApiSpec();
    const spec = await res.json();

    // Documents (List & Reject/Delete)
    expect(spec.paths["/api/properties/{id}/documents"]).toBeDefined();
    expect(spec.paths["/api/properties/{id}/documents"].get).toBeDefined();
    expect(spec.paths["/api/properties/{id}/documents"].delete).toBeDefined();

    // Legal Checklist
    expect(spec.paths["/api/properties/{id}/legal"]).toBeDefined();
    expect(spec.paths["/api/properties/{id}/legal"].get).toBeDefined();
    expect(spec.paths["/api/properties/{id}/legal"].put).toBeDefined();
  });

  it("should configure security schemes for JWT Bearer and Session Cookie", async () => {
    const res = await getOpenApiSpec();
    const spec = await res.json();

    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
    expect(spec.components.securitySchemes.bearerAuth.type).toBe("http");
    expect(spec.components.securitySchemes.bearerAuth.scheme).toBe("bearer");

    expect(spec.components.securitySchemes.cookieAuth).toBeDefined();
    expect(spec.components.securitySchemes.cookieAuth.type).toBe("apiKey");
  });
});

