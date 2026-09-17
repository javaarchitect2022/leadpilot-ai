import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import {
  getTamilNaduLandRecordsFetcher,
  TamilNaduLandRecordsFetcher,
} from "@/services/govt-connectors/tn-land-fetcher";
import { getMallasamudram322Entries } from "@/services/govt-connectors/tnreginet-ec-template";
import { prisma } from "@/lib/prisma";

describe("Tamil Nadu Government Land Records Automation Engine", () => {
  const fetcher = getTamilNaduLandRecordsFetcher();
  const testOutputDir = path.join(process.cwd(), "public", "documents", "properties", "test-prop-001");

  beforeEach(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a singleton instance of TamilNaduLandRecordsFetcher", () => {
    expect(fetcher).toBeInstanceOf(TamilNaduLandRecordsFetcher);
    const secondInstance = getTamilNaduLandRecordsFetcher();
    expect(secondInstance).toBe(fetcher);
  });

  describe("CAPTCHA Solver Engine", () => {
    it("should resolve optical 5-character alphanumeric CAPTCHA", async () => {
      const captchaText = await fetcher.solveCaptchaWithGemini("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
      expect(captchaText).toBeDefined();
      expect(typeof captchaText).toBe("string");
      expect(captchaText.length).toBeGreaterThanOrEqual(4);
      expect(captchaText).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe("e-Services Patta / Chitta Generation", () => {
    it("should produce authentic Tamil Nadu Revenue Department Patta/Chitta", async () => {
      const result = await fetcher.fetchPattaChitta(
        {
          district: "Chengalpattu",
          taluk: "Tambaram",
          village: "Padappai",
          surveyNumber: "142",
          subDivision: "2B",
        },
        testOutputDir
      );

      expect(result.filename).toContain("patta_chitta_142_2B.html");
      expect(result.pattadhar).toBeDefined();
      expect(result.classification).toContain("Punjai");

      const createdFile = path.join(testOutputDir, result.filename);
      expect(fs.existsSync(createdFile)).toBe(true);

      const content = fs.readFileSync(createdFile, "utf-8");
      expect(content).toContain("தமிழ்நாடு அரசு");
      expect(content).toContain("வருவாய்த்துறை");
      expect(content).toContain("நில உரிமை ஆவணம்");
      expect(content).toContain("புஞ்சை");
      expect(content).toContain("142");
      expect(content).toContain("2B");
      expect(content).toContain("Chengalpattu");
      expect(content).toContain("Tambaram");
      expect(content).toContain("Padappai");
    });
  });

  describe("Field Measurement Book (FMB) Sketch Generation", () => {
    it("should produce official vector SVG FMB boundary survey sketch", async () => {
      const result = await fetcher.fetchFmbSketch(
        {
          district: "Chengalpattu",
          taluk: "Tambaram",
          village: "Padappai",
          surveyNumber: "142",
          subDivision: "2B",
        },
        testOutputDir
      );

      expect(result.filename).toContain("fmb_sketch_142_2B.svg");

      const createdFile = path.join(testOutputDir, result.filename);
      expect(fs.existsSync(createdFile)).toBe(true);

      const content = fs.readFileSync(createdFile, "utf-8");
      expect(content).toContain("<svg");
      expect(content).toContain("FMB SKETCH (புல வரைபடம்)");
      expect(content).toContain("142/2B");
      expect(content).toContain("<polygon points=");
      expect(content).toContain("G-Line");
      expect(content).toContain("FMB BOUNDARY CERTIFIED");
    });
  });

  describe("TNREGINET 30-Year Encumbrance Certificate (EC) Generation", () => {
    it("should produce 30-year Nil Encumbrance Certificate with SRO authentication", async () => {
      const result = await fetcher.fetchEncumbranceCertificate(
        {
          district: "Chengalpattu",
          taluk: "Tambaram",
          village: "Padappai",
          surveyNumber: "142",
          subDivision: "2B",
        },
        testOutputDir
      );

      expect(result.filename).toContain("encumbrance_certificate_30yr_142_2B.html");
      expect(result.isNil).toBe(true);
      expect(result.ecPeriod).toContain("30 Years Nil EC");

      const createdFile = path.join(testOutputDir, result.filename);
      expect(fs.existsSync(createdFile)).toBe(true);

      const content = fs.readFileSync(createdFile, "utf-8");
      expect(content).toContain("REGISTRATION DEPARTMENT");
      expect(content).toContain("ENCUMBRANCE CERTIFICATE");
      expect(content).toContain("NIL ENCUMBRANCE");
      expect(content).toContain("142/2B");
    }, 20000);
  });

  describe("Modular Granular Fetching (fetchAndStoreEC & fetchAndStorePatta)", () => {
    it("fetchAndStoreEC should tick ONLY Check #1 (ec30Years) and store PDF in table", async () => {
      const mockPropId = "test-prop-modular-001";
      const mockOrgId = "test-org-modular-001";

      const propFindSpy = vi.spyOn(prisma.property, "findUnique").mockResolvedValue({
        id: mockPropId,
        legalVerification: JSON.stringify({ ec30Years: false, pattaChitta: false, score: 0 }),
        legalStatus: "PENDING_VERIFICATION",
      } as any);

      const docCreateSpy = vi.spyOn(prisma.propertyDocument, "create").mockResolvedValue({
        id: "doc-ec-001",
        documentType: "ENCUMBRANCE_CERTIFICATE",
        title: "30-Year Nil EC",
        fileName: "encumbrance_certificate_30yr_142_2B.pdf",
        fileUrl: `/documents/properties/${mockPropId}/encumbrance_certificate_30yr_142_2B.pdf`,
        fileSize: 85000,
        mimeType: "application/pdf",
        status: "VERIFIED",
        verifiedAt: new Date(),
        extractedData: JSON.stringify({ sro: "SRO Tambaram", isNil: true }),
      } as any);

      const propUpdateSpy = vi.spyOn(prisma.property, "update").mockResolvedValue({} as any);

      const ecResult = await fetcher.fetchAndStoreEC(mockPropId, mockOrgId, {
        district: "Chengalpattu",
        taluk: "Tambaram",
        village: "Padappai",
        surveyNumber: "142",
        subDivision: "2B",
      });

      expect(ecResult.success).toBe(true);
      expect(ecResult.action).toBe("EC");
      expect(ecResult.checklistUpdates.score).toBe(1);
      expect(ecResult.checklistUpdates.allChecks.ec30Years).toBe(true);
      expect(ecResult.checklistUpdates.allChecks.pattaChitta).toBe(false);

      propFindSpy.mockRestore();
      docCreateSpy.mockRestore();
      propUpdateSpy.mockRestore();

      // Clean up test documents
      const generatedDir = path.join(process.cwd(), "public", "documents", "properties", mockPropId);
      if (fs.existsSync(generatedDir)) {
        fs.rmSync(generatedDir, { recursive: true, force: true });
      }
    }, 20000);

    it("fetchAndStorePatta should tick ONLY Check #2 (pattaChitta) and store PDF in table", async () => {
      const mockPropId = "test-prop-modular-002";
      const mockOrgId = "test-org-modular-002";

      const propFindSpy = vi.spyOn(prisma.property, "findUnique").mockResolvedValue({
        id: mockPropId,
        legalVerification: JSON.stringify({ ec30Years: true, pattaChitta: false, score: 1 }),
        legalStatus: "PENDING_VERIFICATION",
      } as any);

      const docCreateSpy = vi.spyOn(prisma.propertyDocument, "create").mockResolvedValue({
        id: "doc-patta-001",
        documentType: "PATTA_CHITTA",
        title: "Online Patta / Chitta",
        fileName: "patta_chitta_142_2B.pdf",
        fileUrl: `/documents/properties/${mockPropId}/patta_chitta_142_2B.pdf`,
        fileSize: 84000,
        mimeType: "application/pdf",
        status: "VERIFIED",
        verifiedAt: new Date(),
        extractedData: JSON.stringify({ pattaNumber: "4820", pattadharNames: ["S. Ramanathan"] }),
      } as any);

      const propUpdateSpy = vi.spyOn(prisma.property, "update").mockResolvedValue({} as any);

      const pattaResult = await fetcher.fetchAndStorePatta(mockPropId, mockOrgId, {
        district: "Chengalpattu",
        taluk: "Tambaram",
        village: "Padappai",
        surveyNumber: "142",
        subDivision: "2B",
      });

      expect(pattaResult.success).toBe(true);
      expect(pattaResult.action).toBe("PATTA");
      expect(pattaResult.checklistUpdates.score).toBe(2);
      expect(pattaResult.checklistUpdates.allChecks.ec30Years).toBe(true);
      expect(pattaResult.checklistUpdates.allChecks.pattaChitta).toBe(true);
      expect(pattaResult.checklistUpdates.allChecks.dtcpCmdaApproval).toBe(false);

      propFindSpy.mockRestore();
      docCreateSpy.mockRestore();
      propUpdateSpy.mockRestore();

      // Clean up test documents
      const generatedDir = path.join(process.cwd(), "public", "documents", "properties", mockPropId);
      if (fs.existsSync(generatedDir)) {
        fs.rmSync(generatedDir, { recursive: true, force: true });
      }
    }, 20000);
  });

  describe("fetchAndReconcileAll Pipeline", () => {
    it("should execute full automated fetch and update database record", async () => {
      const mockPropertyId = "mock-prop-tn-100";
      const mockOrgId = "mock-org-100";

      const updateSpy = vi.spyOn(prisma.property, "update").mockResolvedValue({
        id: mockPropertyId,
        legalStatus: "VERIFIED_CLEAR_TITLE",
      } as any);
      const docSpy = vi.spyOn(prisma.propertyDocument, "createMany").mockResolvedValue({ count: 2 });

      const result = await fetcher.fetchAndReconcileAll(mockPropertyId, mockOrgId, {
        district: "Chengalpattu",
        taluk: "Tambaram",
        village: "Padappai",
        surveyNumber: "142",
        subDivision: "2B",
      });

      expect(result.success).toBe(true);
      expect(result.propertyId).toBe(mockPropertyId);
      expect(result.documents.pattaUrl).toContain(`/documents/properties/${mockPropertyId}/patta_chitta_142_2B.html`);
      expect(result.documents.fmbUrl).toContain(`/documents/properties/${mockPropertyId}/fmb_sketch_142_2B.svg`);
      expect(result.documents.ecUrl).toContain(`/documents/properties/${mockPropertyId}/encumbrance_certificate_30yr_142_2B.html`);

      expect(result.checklistUpdates.score).toBe(10);
      expect(result.checklistUpdates.status).toBe("VERIFIED_CLEAR_TITLE");
      expect(result.extractedData.district).toBe("Chengalpattu");
      expect(result.extractedData.isNilEncumbrance).toBe(true);
      expect(result.extractedData.fmbBoundaryDemarcated).toBe(true);

      updateSpy.mockRestore();
      docSpy.mockRestore();

      // Clean up test documents
      const generatedDir = path.join(process.cwd(), "public", "documents", "properties", mockPropertyId);
      if (fs.existsSync(generatedDir)) {
        fs.rmSync(generatedDir, { recursive: true, force: true });
      }
      if (fs.existsSync(testOutputDir)) {
        fs.rmSync(testOutputDir, { recursive: true, force: true });
      }
    }, 20000);
  });

  describe("Subdivision Resolution Engine (Survey 322: 1B1A vs 1B1B)", () => {
    it("should resolve Schedule 2 with 3270 sq.ft and Rs. 4,38,456 for Subdivision 1B1B", () => {
      const entries = getMallasamudram322Entries("1B1B");
      expect(entries.length).toBe(22);

      const entry22 = entries[21];
      expect(entry22.docNo).toBe("2157/2021");
      expect(entry22.marketValue).toBe("Rs. 4,38,456/-");
      expect(entry22.consideration).toBe("Rs. 7,89,000/-");
      expect(entry22.schedules).toBeDefined();
      expect(entry22.schedules!.length).toBe(1);

      const sched = entry22.schedules![0];
      expect(sched.scheduleTitle).toBe("Schedule 2 Details:");
      expect(sched.extent).toBe("3270.0 SQUARE FEET");
      expect(sched.surveyNo).toBe("322/1B1B");
      expect(sched.scheduleRemarks).toBeDefined();
      expect(sched.scheduleRemarks).toContain("5886");
      expect(sched.boundary).toContain("முனியன்");
    });

    it("should resolve Schedule 1 with 2616 sq.ft and Rs. 3,50,544 for Subdivision 1B1A", () => {
      const entries = getMallasamudram322Entries("1B1A");
      expect(entries.length).toBe(22);

      const entry22 = entries[21];
      expect(entry22.docNo).toBe("2157/2021");
      expect(entry22.marketValue).toBe("Rs. 3,50,544/-");
      expect(entry22.schedules).toBeDefined();
      expect(entry22.schedules!.length).toBe(1);

      const sched = entry22.schedules![0];
      expect(sched.scheduleTitle).toBe("Schedule 1 Details:");
      expect(sched.extent).toBe("2616.0 SQUARE FEET");
      expect(sched.surveyNo).toBe("322/1B1A");
      expect(sched.boundary).toContain("சீரங்கன்");
    });

    it("should include both schedules when querying parent subdivision 1B", () => {
      const entries = getMallasamudram322Entries("1B");
      expect(entries.length).toBe(22);

      const entry22 = entries[21];
      expect(entry22.docNo).toBe("2157/2021");
      expect(entry22.marketValue).toBe("Rs. 7,89,000/-");
      expect(entry22.schedules!.length).toBe(2);
      expect(entry22.schedules![0].scheduleTitle).toBe("Schedule 1 Details:");
      expect(entry22.schedules![1].scheduleTitle).toBe("Schedule 2 Details:");
    });
  });
});
