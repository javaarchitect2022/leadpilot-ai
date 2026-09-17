import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "LeadPilot AI - Real Estate CRM & TN Land Records Automation API",
      version: "1.0.0",
      description: `
### LeadPilot AI API Documentation

Welcome to the **LeadPilot AI** interactive API reference.

This API allows you to test:
1. **Tamil Nadu Government Automation (TNREGINET & AnySurvey)**:
   - Automated 30-Year Nil Encumbrance Certificate (EC) generation and storage.
   - Patta/Chitta extraction and verification.
   - Live cascading jurisdiction query (**Zone → District → SRO → Registration Village**) matching the official TNREGINET government website.
2. **Document Management & Rejection**:
   - Stored document retrieval.
   - Document rejection (unlinks physical PDF, removes DB record, recalibrates checklist score).
3. **10-Point Legal Due Diligence**:
   - Checklist management, advocate clearance, and automated risk scoring.
4. **AI Vision Deed OCR & Property Management**:
   - Title deed analysis, property CRUD, and lead qualification.

#### Authentication
Most endpoints require authentication. You can authenticate in Swagger UI by:
1. Calling \`POST /api/auth/login\` with your credentials.
2. Copying the returned JWT \`token\`.
3. Clicking the green **Authorize** button at the top right, entering \`Bearer <your-token>\` (or just your token), and clicking **Authorize**.
4. Alternatively, if you are logged into LeadPilot AI in your browser, the session cookie (\`leadpilot_session\`) is automatically forwarded.
      `,
      contact: {
        name: "LeadPilot AI Engineering",
        email: "support@leadpilot.ai",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current Host (Relative)",
      },
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    tags: [
      {
        name: "Tamil Nadu Government Land Automation",
        description: "TNREGINET 30-year EC and AnySurvey Patta/Chitta automated fetching and jurisdiction cascade.",
      },
      {
        name: "Document Management & Rejection",
        description: "Retrieve stored official government PDFs or reject/delete erroneous documents with automatic checklist reconciliation.",
      },
      {
        name: "Legal Due Diligence",
        description: "10-point statutory legal verification checklist, advocate clearance, and title risk scoring.",
      },
      {
        name: "Properties",
        description: "Property portfolio management and AI Vision Deed OCR scanner.",
      },
      {
        name: "Leads & Pipeline",
        description: "Lead capture, qualification, CSV import, and AI outreach automation.",
      },
      {
        name: "Authentication",
        description: "Session management, user authentication, and tenant authorization.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your LeadPilot JWT token. Obtain it from POST /api/auth/login.",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "leadpilot_session",
          description: "Browser session cookie set automatically on login.",
        },
      },
      schemas: {
        FetchGovtDocsRequest: {
          type: "object",
          required: ["zone", "district", "sro", "village", "surveyNumber"],
          properties: {
            action: {
              type: "string",
              enum: ["EC", "PATTA", "ALL"],
              default: "ALL",
              description: "Select which document to fetch. 'EC' fetches TNREGINET Encumbrance Certificate. 'PATTA' fetches AnySurvey Patta/Chitta. 'ALL' fetches both.",
            },
            villageType: {
              type: "string",
              enum: ["registration", "revenue"],
              default: "registration",
              description: "Village search type as required by TNREGINET View EC form.",
            },
            zone: {
              type: "string",
              example: "Salem",
              description: "Administrative zone (e.g. Salem, Chennai, Coimbatore).",
            },
            district: {
              type: "string",
              example: "Namakkal",
              description: "Revenue/Registration district.",
            },
            taluk: {
              type: "string",
              example: "Mallasamuthiram",
              description: "Taluk name.",
            },
            sro: {
              type: "string",
              example: "Mallasamuthiram",
              description: "Sub Registrar Office name matching TNREGINET jurisdiction.",
            },
            village: {
              type: "string",
              example: "Malla Samuthiram Kil mugam",
              description: "Exact registration village name from TNREGINET.",
            },
            surveyNumber: {
              type: "string",
              example: "142",
              description: "Land survey number.",
            },
            subDivision: {
              type: "string",
              example: "2B",
              description: "Survey sub-division number.",
            },
            startDate: {
              type: "string",
              example: "01/01/1994",
              description: "EC start date in DD/MM/YYYY format (defaults to 30 years ago).",
            },
            endDate: {
              type: "string",
              example: "14/09/2026",
              description: "EC end date in DD/MM/YYYY format (defaults to today).",
            },
          },
        },
        RejectDocumentRequest: {
          type: "object",
          required: ["documentId"],
          properties: {
            documentId: {
              type: "string",
              description: "Unique ID of the PropertyDocument to be rejected and deleted.",
              example: "cm1a2b3c4d5e6f7g8h9",
            },
          },
        },
        LegalChecklistUpdate: {
          type: "object",
          properties: {
            ec30Years: { type: "boolean", description: "30-Year Encumbrance Certificate verified nil" },
            pattaChitta: { type: "boolean", description: "Patta/Chitta in seller name verified" },
            dtcpCmdaApproval: { type: "boolean", description: "DTCP / CMDA layout planning approval" },
            reraRegistered: { type: "boolean", description: "TN RERA registration verified" },
            landClassification: { type: "boolean", description: "Zoning conversion verified (e.g. Agricultural to Residential)" },
            taxReceipts: { type: "boolean", description: "Property tax / land revenue receipts up to date" },
            unbrokenTitleFlow: { type: "boolean", description: "30-year unbroken chain of title deeds" },
            poaVerified: { type: "boolean", description: "Power of Attorney genuine and non-revoked" },
            physicalDemarcation: { type: "boolean", description: "Physical boundary demarcation matches FMB" },
            advocateClearance: { type: "boolean", description: "Formal legal opinion issued by panel advocate" },
            dtcpCmdaNumber: { type: "string", example: "DTCP/LP/2022/418" },
            pattaNumber: { type: "string", example: "PATTA-2024-8842" },
            reraNumber: { type: "string", example: "TN/01/Layout/1234/2023" },
            ecPeriod: { type: "string", example: "1994 - 2024 (30 Years Nil EC)" },
            advocateName: { type: "string", example: "Advocate A.K. Saravanan (AKSPCL)" },
            legalNotes: { type: "string", example: "Clear marketable title confirmed after physical and registry verification." },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@leadpilot.internal" },
            password: { type: "string", format: "password", example: "AdminPassword123!" },
          },
        },
      },
    },
    security: [
      { bearerAuth: [] },
      { cookieAuth: [] },
    ],
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Authenticate User & Obtain JWT Token",
          description: "Logs in with email and password. Returns a session JWT token and sets the session cookie.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful. Returns user details and session token.",
              content: {
                "application/json": {
                  example: {
                    user: {
                      id: "usr_123",
                      email: "admin@leadpilot.internal",
                      name: "Platform Admin",
                      role: "ADMIN",
                      organizationId: "org_123",
                    },
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                },
              },
            },
            401: { description: "Invalid email or password." },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get Current Authenticated Session",
          description: "Returns the currently authenticated user and organization.",
          responses: {
            200: {
              description: "Current session user profile.",
            },
            401: { description: "Not authenticated." },
          },
        },
      },
      "/api/govt/tn/jurisdiction": {
        get: {
          tags: ["Tamil Nadu Government Land Automation"],
          summary: "TNREGINET Cascading Jurisdictions (Zones, Districts, SROs, Registration Villages)",
          description: `
Returns official Tamil Nadu registration jurisdiction data matching the official **TNREGINET** portal as-is:
- \`?action=zones\`: Returns all 9 administrative zones.
- \`?action=districts&zone=Salem\`: Returns revenue districts under the selected zone.
- \`?action=sros&zone=Salem&district=Namakkal\`: Returns Sub Registrar Offices.
- \`?action=villages&district=Namakkal&sro=Mallasamuthiram\`: Returns all 41 exact official registration villages (e.g. \`Malla Samuthiram Kil mugam\`, \`Mangalam\`, \`Avanasi patti\`, etc.).
- \`?action=all\`: Returns complete jurisdiction hierarchy tree.
          `,
          parameters: [
            {
              name: "action",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: ["all", "zones", "districts", "sros", "villages"],
                default: "all",
              },
              description: "Hierarchy depth filter.",
            },
            {
              name: "zone",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "Salem",
              description: "Filter by administrative zone.",
            },
            {
              name: "district",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "Namakkal",
              description: "Filter by revenue district.",
            },
            {
              name: "sro",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "Mallasamuthiram",
              description: "Filter by Sub Registrar Office (SRO).",
            },
          ],
          responses: {
            200: {
              description: "Jurisdiction records or arrays matching query parameters.",
              content: {
                "application/json": {
                  examples: {
                    zones: {
                      summary: "Action: zones",
                      value: {
                        zones: ["Chennai", "Coimbatore", "Cuddalore", "Madurai", "Salem", "Thanjavur", "Tirunelveli", "Trichy", "Vellore"],
                      },
                    },
                    villages: {
                      summary: "Action: villages (Mallasamuthiram)",
                      value: {
                        villages: [
                          "Akkarai patti",
                          "Anantha Goundampalayam",
                          "Attyam patti",
                          "Avanasi patti",
                          "Ballakkuli",
                          "Malla Samuthiram Kil mugam",
                          "Malla Samuthiram mel mugam",
                          "Mangalam",
                          "Paruthi palli",
                          "Ramapuram",
                          "Vandinatham",
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/properties/{id}/legal/fetch-govt-docs": {
        post: {
          tags: ["Tamil Nadu Government Land Automation"],
          summary: "Automated Fetch & Store for TNREGINET EC and Patta/Chitta",
          description: `
Executes the government automation pipeline for a property:
1. **TNREGINET Encumbrance Certificate (EC)**: Automatically queries the TNREGINET portal, performs 30-year nil EC verification, produces a watermarked official PDF certificate, and attaches it as a \`PropertyDocument\`.
2. **AnySurvey / e-Services Patta/Chitta**: Automatically extracts ownership and land classification records, produces a verified Patta PDF, and attaches it.
3. Automatically updates Check #1 (\`ec30Years\`) and/or Check #2 (\`pattaChitta\`) in the property's 10-point legal checklist, and recalculates the legal risk score.
          `,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "The unique ID of the property to fetch documents for.",
              example: "cm1property123",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FetchGovtDocsRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Government documents successfully retrieved, stored, and verified.",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    message: "Government documents successfully retrieved and stored.",
                    results: {
                      ec: {
                        success: true,
                        docType: "ENCUMBRANCE_CERTIFICATE",
                        documentId: "cm1doc_ec_001",
                        fileName: "EC_142_2B_Mallasamuthiram.pdf",
                        fileUrl: "/uploads/properties/cm1prop/EC_142_2B_Mallasamuthiram.pdf",
                        checklistUpdated: true,
                        extractedData: {
                          applicationNo: "EC-2026-TN-98124",
                          zone: "Salem",
                          district: "Namakkal",
                          sro: "Mallasamuthiram",
                          village: "Malla Samuthiram Kil mugam",
                          surveyNumber: "142",
                          subDivision: "2B",
                          period: "01/01/1994 - 14/09/2026",
                          status: "NIL_ENCUMBRANCE",
                        },
                      },
                      patta: {
                        success: true,
                        docType: "PATTA_CHITTA",
                        documentId: "cm1doc_patta_001",
                        fileName: "Patta_142_2B_Mallasamuthiram.pdf",
                        fileUrl: "/uploads/properties/cm1prop/Patta_142_2B_Mallasamuthiram.pdf",
                        checklistUpdated: true,
                        extractedData: {
                          pattaNumber: "PATTA-2024-8842",
                          ownerName: "Selvaraj K.",
                          district: "Namakkal",
                          taluk: "Mallasamuthiram",
                          village: "Malla Samuthiram Kil mugam",
                          landClassification: "Ryotwari Nanja",
                        },
                      },
                    },
                    checklist: {
                      ec30Years: true,
                      pattaChitta: true,
                      pattaNumber: "PATTA-2024-8842",
                      ecPeriod: "01/01/1994 - 14/09/2026",
                    },
                    metrics: {
                      passedChecks: 2,
                      totalChecks: 10,
                      completionPercentage: 20,
                      legalStatus: "IN_REVIEW",
                    },
                  },
                },
              },
            },
            400: { description: "Missing required inputs (zone, district, sro, village, surveyNumber)." },
            404: { description: "Property not found or unauthorized." },
          },
        },
      },
      "/api/properties/{id}/documents": {
        get: {
          tags: ["Document Management & Rejection"],
          summary: "List Stored Government Documents for Property",
          description: "Returns all government PDFs (EC, Patta, DTCP layout, Title Deeds) stored for the specified property.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Property ID",
              example: "cm1property123",
            },
          ],
          responses: {
            200: {
              description: "List of stored property documents.",
              content: {
                "application/json": {
                  example: {
                    documents: [
                      {
                        id: "cm1doc_ec_001",
                        documentType: "ENCUMBRANCE_CERTIFICATE",
                        title: "Encumbrance Certificate (30-Year Nil EC)",
                        fileName: "EC_142_2B_Mallasamuthiram.pdf",
                        fileUrl: "/uploads/properties/cm1prop/EC_142_2B_Mallasamuthiram.pdf",
                        fileSize: 184520,
                        mimeType: "application/pdf",
                        status: "VERIFIED",
                        extractedData: { applicationNo: "EC-2026-TN-98124", status: "NIL_ENCUMBRANCE" },
                        createdAt: "2026-09-14T07:20:00.000Z",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Document Management & Rejection"],
          summary: "Reject and Delete Government Document",
          description: `
If an agent or legal reviewer finds that an attached government document is incorrect:
1. Deletes the physical PDF file from storage disk.
2. Removes the document row from the \`PropertyDocument\` database table.
3. Automatically recalibrates the legal checklist metrics and risk score (resetting \`ec30Years\` or \`pattaChitta\` if no other valid document exists).
4. Records an audit trail log entry.
          `,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Property ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RejectDocumentRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Document successfully rejected and deleted, checklist reconciled.",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    message: "Document rejected and deleted successfully.",
                    deletedDocumentId: "cm1doc_ec_001",
                    checklistUpdated: true,
                  },
                },
              },
            },
            400: { description: "documentId is required." },
            404: { description: "Document not found or access denied." },
          },
        },
      },
      "/api/properties/{id}/legal": {
        get: {
          tags: ["Legal Due Diligence"],
          summary: "Get 10-Point Legal Due Diligence Checklist",
          description: "Returns the 10 statutory verification checks, certificate numbers, legal risk score, and document attachments for a property.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Legal checklist and status metrics.",
            },
          },
        },
        put: {
          tags: ["Legal Due Diligence"],
          summary: "Update 10-Point Legal Due Diligence Checklist",
          description: "Updates manual checklist checks, certificate numbers, advocate comments, and recalculates risk score.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LegalChecklistUpdate" },
              },
            },
          },
          responses: {
            200: {
              description: "Legal checklist updated successfully.",
            },
          },
        },
      },
      "/api/properties": {
        get: {
          tags: ["Properties"],
          summary: "List Properties",
          description: "Retrieves properties scoped to the authenticated tenant organization.",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" }, description: "Filter by title, location, or city" },
            { name: "legalStatus", in: "query", schema: { type: "string" }, description: "Filter by legal status (VERIFIED, IN_REVIEW, REJECTED, PENDING)" },
          ],
          responses: {
            200: { description: "List of properties." },
          },
        },
        post: {
          tags: ["Properties"],
          summary: "Create New Property",
          description: "Creates a new property record.",
          responses: {
            201: { description: "Property created." },
          },
        },
      },
      "/api/properties/{id}": {
        get: {
          tags: ["Properties"],
          summary: "Get Property by ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Property found." },
            404: { description: "Property not found." },
          },
        },
      },
      "/api/properties/scan": {
        post: {
          tags: ["Properties"],
          summary: "AI Vision Scanner for Title Deeds & Land Documents",
          description: "Performs OCR and Gemini Vision extraction on uploaded sale deeds, patta images, or ECs to extract survey numbers, owner names, and boundaries.",
          responses: {
            200: { description: "Document extracted." },
          },
        },
      },
      "/api/leads": {
        get: {
          tags: ["Leads & Pipeline"],
          summary: "List Leads",
          description: "Retrieves CRM leads scoped to the tenant organization.",
          responses: {
            200: { description: "List of leads." },
          },
        },
        post: {
          tags: ["Leads & Pipeline"],
          summary: "Create Lead",
          responses: {
            201: { description: "Lead created." },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}

