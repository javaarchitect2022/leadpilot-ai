import { describe, it, expect } from "vitest";
import {
  LegalChecklistSchema,
  calculateLegalMetrics,
  CHECKLIST_ITEMS_META,
} from "@/lib/validations/legal";

describe("AKSPCL-Inspired 10-Point Legal Due-Diligence System", () => {
  it("should have exactly 10 comprehensive due diligence checkpoints", () => {
    expect(CHECKLIST_ITEMS_META).toHaveLength(10);
    const keys = CHECKLIST_ITEMS_META.map((item) => item.key);
    expect(keys).toContain("ec30Years");
    expect(keys).toContain("pattaChitta");
    expect(keys).toContain("dtcpCmdaApproval");
    expect(keys).toContain("reraRegistered");
    expect(keys).toContain("landClassification");
    expect(keys).toContain("taxReceipts");
    expect(keys).toContain("unbrokenTitleFlow");
    expect(keys).toContain("poaVerified");
    expect(keys).toContain("physicalDemarcation");
    expect(keys).toContain("advocateClearance");
  });

  describe("calculateLegalMetrics", () => {
    it("should compute VERIFIED_CLEAR_TITLE when score is 10/10", () => {
      const allPassed = {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: true,
        reraRegistered: true,
        landClassification: true,
        taxReceipts: true,
        unbrokenTitleFlow: true,
        poaVerified: true,
        physicalDemarcation: true,
        advocateClearance: true,
      };

      const metrics = calculateLegalMetrics(allPassed);
      expect(metrics.score).toBe(10);
      expect(metrics.status).toBe("VERIFIED_CLEAR_TITLE");
    });

    it("should compute VERIFIED_CLEAR_TITLE when score is 9/10", () => {
      const ninePassed = {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: true,
        reraRegistered: true,
        landClassification: true,
        taxReceipts: true,
        unbrokenTitleFlow: true,
        poaVerified: true,
        physicalDemarcation: true,
        advocateClearance: false,
      };

      const metrics = calculateLegalMetrics(ninePassed);
      expect(metrics.score).toBe(9);
      expect(metrics.status).toBe("VERIFIED_CLEAR_TITLE");
    });

    it("should compute IN_REVIEW when score is between 5 and 8", () => {
      const sixPassed = {
        ec30Years: true,
        pattaChitta: true,
        dtcpCmdaApproval: true,
        reraRegistered: true,
        landClassification: true,
        taxReceipts: true,
        unbrokenTitleFlow: false,
        poaVerified: false,
        physicalDemarcation: false,
        advocateClearance: false,
      };

      const metrics = calculateLegalMetrics(sixPassed);
      expect(metrics.score).toBe(6);
      expect(metrics.status).toBe("IN_REVIEW");
    });

    it("should compute PENDING_VERIFICATION when score is below 5", () => {
      const twoPassed = {
        ec30Years: true,
        pattaChitta: true,
      };

      const metrics = calculateLegalMetrics(twoPassed);
      expect(metrics.score).toBe(2);
      expect(metrics.status).toBe("PENDING_VERIFICATION");
    });
  });

  describe("LegalChecklistSchema", () => {
    it("should validate and apply default values cleanly", () => {
      const checklist = LegalChecklistSchema.parse({
        dtcpCmdaNumber: "CMDA/PPD/LO/2023/184",
        pattaNumber: "Patta 4120",
      });

      expect(checklist.score).toBe(0);
      expect(checklist.status).toBe("PENDING_VERIFICATION");
      expect(checklist.advocateName).toBe("Advocate A.K. Saravanan (AKSPCL)");
      expect(checklist.dtcpCmdaNumber).toBe("CMDA/PPD/LO/2023/184");
      expect(checklist.pattaNumber).toBe("Patta 4120");
    });
  });
});

