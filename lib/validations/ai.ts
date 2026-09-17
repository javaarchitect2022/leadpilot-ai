import { z } from "zod";

export const LeadIntentSchema = z.enum(["BUY", "RENT", "SELL", "UNKNOWN"]);
export const UrgencySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const LeadClassificationSchema = z.enum([
  "GENUINE_BUYER",
  "COMPETITOR_BROKER",
  "SUSPECTED_SPAM",
  "GENERAL_ENQUIRY",
]);

export const LeadAnalysisSchema = z.object({
  summary: z.string().describe("A concise 1-2 sentence executive summary of the lead's enquiry"),
  intent: LeadIntentSchema.describe("Primary intent: BUY, RENT, SELL, or UNKNOWN"),
  location: z.string().default("").describe("Preferred locality, neighborhood, or city mentioned in enquiry"),
  propertyType: z.string().default("").describe("Type of property e.g. Apartment, Villa, Plot, Commercial"),
  bedrooms: z.number().nullable().default(null).describe("Number of bedrooms desired, or null if unmentioned"),
  budgetMin: z.number().nullable().default(null).describe("Minimum budget in INR (e.g. 5000000 for 50L), or null"),
  budgetMax: z.number().nullable().default(null).describe("Maximum budget in INR (e.g. 7000000 for 70L), or null"),
  urgency: UrgencySchema.default("MEDIUM").describe("Urgency level: LOW, MEDIUM, HIGH"),
  leadScore: z.number().min(0).max(100).default(50).describe("Calculated lead qualification score between 0 and 100"),
  missingInformation: z.array(z.string()).default([]).describe("Key missing qualification questions to ask the lead"),
  recommendedNextAction: z.string().describe("Actionable next step for sales agent, e.g. 'Call immediately to schedule site visit'"),
  leadClassification: LeadClassificationSchema.default("GENUINE_BUYER").describe("Classification: GENUINE_BUYER, COMPETITOR_BROKER, SUSPECTED_SPAM, GENERAL_ENQUIRY"),
  classificationReason: z.string().default("Direct end-buyer inquiry with clear requirements").describe("Reason for the assigned classification"),
});

export type LeadAnalysisResult = z.infer<typeof LeadAnalysisSchema>;
export type LeadClassification = z.infer<typeof LeadClassificationSchema>;

export const AiReplyRequestSchema = z.object({
  leadId: z.string(),
  tone: z.string().optional(),
  additionalInstructions: z.string().optional(),
});

export const AiFollowUpRequestSchema = z.object({
  leadId: z.string(),
  followUpType: z.enum(["CALL", "WHATSAPP", "EMAIL"]).default("WHATSAPP"),
  goal: z.string().optional(),
});

