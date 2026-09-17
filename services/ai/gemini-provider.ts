import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  IAIProvider,
  GenerateReplyInput,
  GenerateFollowUpInput,
  AssistantChatInput,
  AssistantResponse,
} from "./types";
import { LeadAnalysisResult, LeadAnalysisSchema } from "@/lib/validations/ai";
import { MockAiProvider } from "./mock-provider";

export class GeminiProvider implements IAIProvider {
  readonly name = "GEMINI";
  readonly defaultModel = "gemini-1.5-flash";
  private client: GoogleGenerativeAI | null = null;
  private fallback: MockAiProvider;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.client = new GoogleGenerativeAI(key);
    }
    this.fallback = new MockAiProvider();
  }

  async analyzeLead(message: string, businessContext?: string): Promise<LeadAnalysisResult> {
    if (!this.client) {
      return this.fallback.analyzeLead(message, businessContext);
    }

    const prompt = `You are LeadPilot AI, an expert lead qualification assistant for Indian real estate agencies.
Analyze this buyer/renter enquiry and output strictly valid JSON matching this schema:
{
  "summary": "1-2 sentence concise executive summary",
  "intent": "BUY" | "RENT" | "SELL" | "UNKNOWN",
  "location": "Preferred neighborhood/city or empty string",
  "propertyType": "Apartment" | "Villa" | "Plot" | "Commercial" or specific type,
  "bedrooms": number (e.g. 1, 2, 3) or null,
  "budgetMin": minimum budget in INR as integer or null,
  "budgetMax": maximum budget in INR as integer or null (e.g. 70 Lakhs = 7000000, 1.5 Crores = 15000000),
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "leadScore": integer between 0 and 100 based on purchase certainty and budget clarity,
  "missingInformation": array of key missing questions to ask,
  "recommendedNextAction": "Actionable sales next step",
  "leadClassification": "GENUINE_BUYER" | "COMPETITOR_BROKER" | "SUSPECTED_SPAM" | "GENERAL_ENQUIRY",
  "classificationReason": "Brief 1-sentence reason e.g. direct genuine buyer vs inquiry using broker keywords"
}

Business Context: ${businessContext || "Indian Real Estate Agency"}
Customer Message: "${message}"

Output ONLY pure JSON.`;

    try {
      const model = this.client.getGenerativeModel({
        model: this.defaultModel,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      // Strictly validate with Zod
      return LeadAnalysisSchema.parse(parsed);
    } catch (err) {
      console.warn("Gemini lead analysis failed or returned invalid JSON; using fallback parser:", err);
      return this.fallback.analyzeLead(message, businessContext);
    }
  }

  async generateReply(input: GenerateReplyInput): Promise<{
    reply: string;
    model: string;
    matchedPropertyIds: string[];
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.client) {
      return this.fallback.generateReply(input);
    }

    const verifiedInventory = input.availableProperties.map(p =>
      `- [ID: ${p.id}] ${p.title} in ${p.location}, ${p.bedrooms || 'N/A'}BHK, ₹${(p.price / 100000).toFixed(0)} Lakhs (${p.status})${p.legalStatus === 'VERIFIED_CLEAR_TITLE' ? ' • [100% Verified Clear Title: DTCP & RERA Approved with 30-Yr Clear EC]' : ''}`
    ).join("\n");

    const prompt = `You are a professional real estate sales consultant for ${input.businessInfo?.name || "LeadPilot Realty"}.
Generate a concise, warm WhatsApp response in natural Indian English for this lead.

STRICT SAFETY RULES:
1. NEVER invent property information or amenities.
2. NEVER invent prices or discounts.
3. Only reference properties explicitly listed in "Verified Available Inventory" below.
4. If no matching property is listed, politely acknowledge and ask for budget and move-in timeline.
5. Keep message under 65 words. Ideal for WhatsApp.
6. Ask only 1-2 high-value qualification questions.
7. If a property has "Verified Clear Title", mention this legal peace of mind (e.g. "DTCP approved & legally clear title").

Lead:
Name: ${input.lead.name}
Requirement: ${input.lead.requirement || "Not specified"}
Budget Max: ${input.lead.budgetMax ? "₹" + input.lead.budgetMax : "Unknown"}
Location: ${input.lead.location || "Unknown"}
Bedrooms: ${input.lead.bedrooms ? input.lead.bedrooms + "BHK" : "Unknown"}

Verified Available Inventory:
${verifiedInventory || "No matching inventory in database currently."}

Previous Messages:
${input.previousMessages?.join("\n") || "First contact"}

Output ONLY the text of the message.`;

    try {
      const model = this.client.getGenerativeModel({
        model: this.defaultModel,
        generationConfig: { temperature: 0.3 },
      });

      const result = await model.generateContent(prompt);
      const reply = result.response.text().trim();

      // Find properties mentioned in response
      const matchedIds = input.availableProperties
        .filter(p => reply.includes(p.location) || reply.includes(p.title))
        .map(p => p.id);

      return {
        reply,
        model: this.defaultModel,
        matchedPropertyIds: matchedIds,
      };
    } catch (err) {
      console.warn("Gemini reply generation failed, using fallback:", err);
      return this.fallback.generateReply(input);
    }
  }

  async generateFollowUp(input: GenerateFollowUpInput): Promise<{
    followUpMessage: string;
    suggestedScheduledDate: Date;
    model: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.client) {
      return this.fallback.generateFollowUp(input);
    }

    const prompt = `You are a real estate follow-up automation assistant.
Draft a short, non-pushy follow-up message for:
Customer: ${input.lead.name}
Location preference: ${input.lead.location || "City"}
Requirement: ${input.lead.requirement || "Residential"}
Follow-up channel: ${input.followUpType}
Conversation history: ${input.conversationHistory.join(" | ") || "Inquired previously"}

Keep it under 40 words. Propose a short site visit or video tour. Natural Indian English.`;

    try {
      const model = this.client.getGenerativeModel({ model: this.defaultModel, generationConfig: { temperature: 0.4 } });
      const result = await model.generateContent(prompt);
      const followUpMessage = result.response.text().trim();

      const suggestedDate = new Date();
      suggestedDate.setDate(suggestedDate.getDate() + 2);

      return {
        followUpMessage,
        suggestedScheduledDate: suggestedDate,
        model: this.defaultModel,
      };
    } catch (err) {
      return this.fallback.generateFollowUp(input);
    }
  }

  async chatAssistant(input: AssistantChatInput): Promise<AssistantResponse> {
    if (!this.client) {
      return this.fallback.chatAssistant(input);
    }

    try {
      const systemInstruction = `You are LeadPilot AI CRM Assistant. You help real estate brokers manage leads, properties, follow-ups, and conversion metrics. Be crisp, actionable, and helpful.`;
      const model = this.client.getGenerativeModel({
        model: this.defaultModel,
        systemInstruction,
      });

      const history = input.messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history: history.slice(0, -1) });
      const lastMsg = history[history.length - 1]?.parts[0]?.text || "Hello";
      const result = await chat.sendMessage(lastMsg);

      return {
        reply: result.response.text(),
      };
    } catch {
      return this.fallback.chatAssistant(input);
    }
  }
}

