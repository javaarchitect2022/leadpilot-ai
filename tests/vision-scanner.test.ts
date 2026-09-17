import { describe, it, expect } from "vitest";
import { VisionScannerService, PropertyScanResultSchema } from "@/services/ai/vision-scanner";
import { MockAiProvider } from "@/services/ai/mock-provider";

describe("NoBroker-Inspired Features: Vision Scanner & Infiltration Shield", () => {
  describe("VisionScannerService", () => {
    it("should successfully parse and validate a mock street board scan", async () => {
      const scanner = new VisionScannerService();
      // Dummy small base64 string
      const mockBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await scanner.scanImage(mockBase64, "image/png");

      expect(result).toBeDefined();
      expect(result.title).toContain("Apartment");
      expect(result.location).toBe("Medavakkam, Chennai");
      expect(result.price).toBe(11000000);
      expect(result.bedrooms).toBe(3);
      expect(result.contactPhone).toBe("+91 98401 23456");
      expect(result.detectedType).toBe("STREET_BOARD");
      expect(result.confidenceScore).toBeGreaterThanOrEqual(80);

      // Verify strict schema compliance
      const validated = PropertyScanResultSchema.safeParse(result);
      expect(validated.success).toBe(true);
    });

    it("should handle data URI prefixes cleanly without crashing", async () => {
      const scanner = new VisionScannerService();
      const dataUri = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await scanner.scanImage(dataUri, "image/jpeg");
      expect(result).toBeDefined();
      expect(result.confidenceScore).toBeGreaterThan(0);
    });
  });

  describe("Lead Infiltration & Spam Shield", () => {
    const ai = new MockAiProvider();

    it("should classify competitor brokers who ask about CP commission or co-broking", async () => {
      const brokerMessage = "Hi, is CP commission 2% or 3% on this project? Direct client available, need 50:50 sharing.";
      const analysis = await ai.analyzeLead(brokerMessage);

      expect(analysis.leadClassification).toBe("COMPETITOR_BROKER");
      expect(analysis.classificationReason).toContain("broker or channel partner");
    });

    it("should classify suspected bot or test submissions", async () => {
      const spamMessage = "test asdf fake inquiry";
      const analysis = await ai.analyzeLead(spamMessage);

      expect(analysis.leadClassification).toBe("SUSPECTED_SPAM");
      expect(analysis.classificationReason).toContain("Test or bot payload");
    });

    it("should classify genuine property buyers with high purchase intent", async () => {
      const buyerMessage = "Looking for an urgent 3BHK apartment in OMR or Medavakkam under 1.2 Crore ready to move.";
      const analysis = await ai.analyzeLead(buyerMessage);

      expect(analysis.leadClassification).toBe("GENUINE_BUYER");
      expect(analysis.intent).toBe("BUY");
      expect(analysis.bedrooms).toBe(3);
      expect(analysis.budgetMax).toBe(12000000);
      expect(analysis.urgency).toBe("HIGH");
    });
  });
});

