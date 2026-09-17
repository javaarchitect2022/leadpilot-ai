import { describe, it, expect } from "vitest";
import { LeadAnalysisSchema } from "../lib/validations/ai";
import { MockAiProvider } from "../services/ai/mock-provider";

describe("AI Lead Analysis Schema & Validation", () => {
  it("should validate and parse correctly formatted AI lead qualification JSON", () => {
    const validJson = {
      summary: "Customer looking for 2BHK in Tambaram under 70 Lakhs",
      intent: "BUY",
      location: "Tambaram",
      propertyType: "Apartment",
      bedrooms: 2,
      budgetMin: 5600000,
      budgetMax: 7000000,
      urgency: "HIGH",
      leadScore: 88,
      missingInformation: ["Possession timeline", "Home loan pre-approval"],
      recommendedNextAction: "Call immediately to schedule site visit",
    };

    const parsed = LeadAnalysisSchema.parse(validJson);
    expect(parsed.intent).toBe("BUY");
    expect(parsed.bedrooms).toBe(2);
    expect(parsed.budgetMax).toBe(7000000);
    expect(parsed.leadScore).toBe(88);
  });

  it("should reject invalid intent in AI JSON", () => {
    const invalidJson = {
      summary: "Invalid intent test",
      intent: "INVEST_CRYPTO", // Not in enum
      location: "Chennai",
      propertyType: "Apartment",
      urgency: "HIGH",
      leadScore: 50,
      missingInformation: [],
      recommendedNextAction: "Call",
    };

    expect(() => LeadAnalysisSchema.parse(invalidJson)).toThrow();
  });

  it("should reject leadScore outside of 0 - 100", () => {
    const outOfBoundsJson = {
      summary: "Score too high",
      intent: "BUY",
      location: "Chennai",
      propertyType: "Apartment",
      urgency: "HIGH",
      leadScore: 150, // Invalid > 100
      missingInformation: [],
      recommendedNextAction: "Call",
    };

    expect(() => LeadAnalysisSchema.parse(outOfBoundsJson)).toThrow();
  });

  it("MockAiProvider should parse Indian real estate queries and return strictly validated schema", async () => {
    const provider = new MockAiProvider();
    const query = "I need a 2BHK near Tambaram under 70 lakhs urgently.";
    const result = await provider.analyzeLead(query);

    expect(result.intent).toBe("BUY");
    expect(result.bedrooms).toBe(2);
    expect(result.location).toBe("Tambaram");
    expect(result.budgetMax).toBe(7000000);
    expect(result.urgency).toBe("HIGH");
    expect(result.leadScore).toBeGreaterThanOrEqual(75);
    expect(result.missingInformation.length).toBeGreaterThan(0);
  });
});

