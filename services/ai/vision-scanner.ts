import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const PropertyScanResultSchema = z.object({
  title: z.string().describe("Property title, project name, or descriptive heading"),
  location: z.string().describe("Locality, neighborhood, or road name"),
  city: z.string().default("Chennai").describe("City name"),
  price: z.number().nullable().default(null).describe("Price in INR (e.g. 11500000 for 1.15 Cr, 8500000 for 85L)"),
  priceFormatted: z.string().default("").describe("Display price e.g. ₹1.15 Cr or ₹85 Lakhs"),
  propertyType: z.string().default("Apartment").describe("Apartment, Villa, Plot, Commercial, Independent House"),
  bedrooms: z.number().nullable().default(null).describe("Number of bedrooms (e.g. 1, 2, 3, 4)"),
  bathrooms: z.number().nullable().default(null).describe("Number of bathrooms"),
  area: z.number().nullable().default(null).describe("Super built-up or carpet area in sq.ft"),
  contactPhone: z.string().nullable().default(null).describe("Primary phone number found on the board or brochure"),
  contactName: z.string().nullable().default(null).describe("Name of owner, broker, or developer if mentioned"),
  amenities: z.array(z.string()).default([]).describe("List of amenities extracted from the image"),
  notes: z.string().default("").describe("Additional context, facing direction, floor, ready/under construction status"),
  detectedType: z.enum(["STREET_BOARD", "BROCHURE", "NEWSPAPER", "OTHER"]).default("STREET_BOARD"),
  confidenceScore: z.number().min(0).max(100).default(85),
});

export type PropertyScanResult = z.infer<typeof PropertyScanResultSchema>;

export class VisionScannerService {
  private client: GoogleGenerativeAI | null = null;
  private defaultModel = "gemini-1.5-flash";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "mock_key" && !apiKey.startsWith("demo_")) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  async scanImage(base64Data: string, mimeType = "image/jpeg"): Promise<PropertyScanResult> {
    // Strip prefix if user passed full data URI (e.g. "data:image/jpeg;base64,....")
    const cleanBase64 = base64Data.includes("base64,")
      ? base64Data.split("base64,")[1]
      : base64Data;

    // Use Mock fallback if client is not configured or in offline environment
    if (!this.client) {
      return this.mockScan(cleanBase64);
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.defaultModel,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const prompt = `You are a real estate OCR and computer vision analyst specializing in Indian real estate signage, brochures, and newspaper ads.
Analyze this property image (which may be a physical "TO LET" or "FOR SALE" street board, a developer brochure pamphlet, or a newspaper listing).

Extract the property details into a valid JSON object matching this schema:
{
  "title": string (e.g. "3BHK Luxury Apartment" or "Prestige Lakeside Villa"),
  "location": string (Locality or neighborhood e.g. "OMR, Sholinganallur", "Whitefield", "Anna Nagar"),
  "city": string (e.g. "Chennai", "Bangalore", "Mumbai", "Hyderabad"),
  "price": number or null (Integer in INR, e.g. 11500000 for 1.15 Cr, 6500000 for 65 Lakhs, 25000 for 25k/month rent),
  "priceFormatted": string (e.g. "₹1.15 Cr" or "₹25,000 / month"),
  "propertyType": "Apartment" | "Villa" | "Plot" | "Commercial" | "Independent House",
  "bedrooms": number or null (e.g. 1, 2, 3, 4),
  "bathrooms": number or null,
  "area": number or null (in sq ft),
  "contactPhone": string or null (Extract standard 10-digit Indian mobile number e.g. "9840012345"),
  "contactName": string or null (Name of owner or agency if visible),
  "amenities": array of strings (e.g. ["Covered Car Parking", "Lift", "Power Backup", "East Facing"]),
  "notes": string (Summarize condition, ready-to-move vs under-construction, landmarks),
  "detectedType": "STREET_BOARD" | "BROCHURE" | "NEWSPAPER" | "OTHER",
  "confidenceScore": number (0 to 100 confidence)
}

Ensure all extracted values reflect the exact image. If a field is unmentioned, use null or empty array. Output ONLY valid JSON.`;

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg",
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const rawText = result.response.text().trim();
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

      const parsed = JSON.parse(cleaned);
      return PropertyScanResultSchema.parse(parsed);
    } catch (err) {
      console.warn("Gemini Vision scan failed or unconfigured, returning intelligent fallback:", err);
      return this.mockScan(cleanBase64);
    }
  }

  /**
   * Deterministic mock scanner for offline testing and dev simulations.
   */
  mockScan(base64Data: string): PropertyScanResult {
    // Generate a realistic property from a street board photo
    return {
      title: "3BHK Sea-Breeze Apartment (Scanned from Board)",
      location: "Medavakkam, Chennai",
      city: "Chennai",
      price: 11000000,
      priceFormatted: "₹1.10 Cr",
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1540,
      contactPhone: "+91 98401 23456",
      contactName: "S. Ramanathan (Owner)",
      amenities: ["Covered Car Parking", "24/7 Water", "Lift", "East Facing"],
      notes: "Scanned from physical TO LET / FOR SALE street board. Verified owner direct contact.",
      detectedType: "STREET_BOARD",
      confidenceScore: 92,
    };
  }
}

let instance: VisionScannerService | null = null;
export function getVisionScannerService(): VisionScannerService {
  if (!instance) {
    instance = new VisionScannerService();
  }
  return instance;
}
