import {
  IAIProvider,
  GenerateReplyInput,
  GenerateFollowUpInput,
  AssistantChatInput,
  AssistantResponse,
} from "./types";
import { LeadAnalysisResult, LeadAnalysisSchema } from "@/lib/validations/ai";

export class MockAiProvider implements IAIProvider {
  readonly name = "MOCK";
  readonly defaultModel = "mock-gpt-4o-real-estate";

  async analyzeLead(message: string, _businessContext?: string): Promise<LeadAnalysisResult> {
    const text = message.toLowerCase();

    // Intent detection
    let intent: "BUY" | "RENT" | "SELL" | "UNKNOWN" = "BUY";
    if (text.includes("rent") || text.includes("lease")) intent = "RENT";
    else if (text.includes("sell") || text.includes("selling")) intent = "SELL";

    // BHK detection
    let bedrooms: number | null = null;
    if (text.includes("1bhk") || text.includes("1 bhk") || text.includes("1 bedroom")) bedrooms = 1;
    else if (text.includes("2bhk") || text.includes("2 bhk") || text.includes("2 bedroom")) bedrooms = 2;
    else if (text.includes("3bhk") || text.includes("3 bhk") || text.includes("3 bedroom")) bedrooms = 3;
    else if (text.includes("4bhk") || text.includes("4 bhk") || text.includes("4 bedroom")) bedrooms = 4;

    // Property Type
    let propertyType = "Apartment";
    if (text.includes("villa") || text.includes("individual house")) propertyType = "Villa";
    else if (text.includes("plot") || text.includes("land")) propertyType = "Plot";
    else if (text.includes("commercial") || text.includes("office") || text.includes("shop")) propertyType = "Commercial";

    // Location extraction (common Indian / Chennai localities)
    let location = "";
    const knownLocations = [
      "Tambaram", "OMR", "Velachery", "Anna Nagar", "Adyar", "Porur",
      "Perungudi", "Thoraipakkam", "Sholinganallur", "ECR", "Guindy",
      "Medavakkam", "Navalur", "Siruseri", "Chromepet", "Kotturpuram"
    ];
    for (const loc of knownLocations) {
      if (text.includes(loc.toLowerCase())) {
        location = loc;
        break;
      }
    }

    // Budget extraction (Lakhs and Crores)
    let budgetMax: number | null = null;
    let budgetMin: number | null = null;

    const croreMatch = text.match(/(\d+(\.\d+)?)\s*(cr|crore|crores)/i);
    const lakhMatch = text.match(/(\d+(\.\d+)?)\s*(l|lac|lakh|lakhs)/i);

    if (croreMatch) {
      const val = parseFloat(croreMatch[1]) * 10000000;
      budgetMax = val;
      budgetMin = val * 0.8;
    } else if (lakhMatch) {
      const val = parseFloat(lakhMatch[1]) * 100000;
      budgetMax = val;
      budgetMin = val * 0.8;
    }

    // Urgency & Scoring
    let urgency: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
    let leadScore = 60;

    if (text.includes("urgent") || text.includes("immediate") || text.includes("ready to move") || text.includes("this month")) {
      urgency = "HIGH";
      leadScore += 25;
    } else if (text.includes("just looking") || text.includes("exploring") || text.includes("next year")) {
      urgency = "LOW";
      leadScore -= 20;
    }

    if (budgetMax) leadScore += 10;
    if (location) leadScore += 10;
    if (bedrooms) leadScore += 5;
    leadScore = Math.min(Math.max(leadScore, 10), 98);

    // Missing information
    const missing: string[] = [];
    if (!budgetMax) missing.push("Budget expectation in Lakhs/Crores");
    if (!location) missing.push("Preferred locality or commute requirement");
    if (!bedrooms && propertyType === "Apartment") missing.push("Bedroom preference (1, 2, or 3 BHK)");
    missing.push("Preferred possession timeline (Ready to move vs Under construction)");
    missing.push("Home loan pre-approval status");

    const summary = `Lead interested in ${bedrooms ? bedrooms + "BHK " : ""}${propertyType}${location ? " near " + location : ""}${budgetMax ? " with budget up to ₹" + (budgetMax / 100000).toFixed(0) + " Lakhs" : ""}.`;

    const nextAction = urgency === "HIGH"
      ? "Call customer within 15 minutes to share matching units and schedule immediate site visit."
      : "Send WhatsApp message with 2 verified property brochures and follow up in 24 hours.";

    // Broker & Spam Infiltration Detection
    let leadClassification: "GENUINE_BUYER" | "COMPETITOR_BROKER" | "SUSPECTED_SPAM" | "GENERAL_ENQUIRY" = "GENUINE_BUYER";
    let classificationReason = "Direct end-buyer inquiry with clear requirements";

    if (
      text.includes("cp commission") ||
      text.includes("channel partner") ||
      text.includes("co-broking") ||
      text.includes("broker") ||
      text.includes("direct client only") ||
      text.includes("side commission") ||
      text.includes("sharing brokerage")
    ) {
      leadClassification = "COMPETITOR_BROKER";
      classificationReason = "Inquiry contains broker or channel partner commission keywords";
    } else if (
      text.includes("test") ||
      text.includes("asdf") ||
      text.length < 5 ||
      text.includes("fake")
    ) {
      leadClassification = "SUSPECTED_SPAM";
      classificationReason = "Test or bot payload detected";
    } else if (!bedrooms && !budgetMax && !location) {
      leadClassification = "GENERAL_ENQUIRY";
      classificationReason = "Broad inquiry without specific budget or location criteria";
    }

    const rawOutput = {
      summary,
      intent,
      location: location || "Chennai",
      propertyType,
      bedrooms,
      budgetMin,
      budgetMax,
      urgency,
      leadScore,
      missingInformation: missing,
      recommendedNextAction: nextAction,
      leadClassification,
      classificationReason,
    };

    return LeadAnalysisSchema.parse(rawOutput);
  }

  async generateReply(input: GenerateReplyInput): Promise<{
    reply: string;
    model: string;
    matchedPropertyIds: string[];
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    const lead = input.lead;
    const name = lead.name.split(" ")[0] || "there";
    const available = input.availableProperties;

    let matchedProps = available;
    if (lead.bedrooms) {
      const filtered = available.filter((p) => p.bedrooms === lead.bedrooms);
      if (filtered.length > 0) matchedProps = filtered;
    }
    if (lead.budgetMax) {
      const filtered = matchedProps.filter((p) => p.price <= lead.budgetMax! * 1.15);
      if (filtered.length > 0) matchedProps = filtered;
    }

    const matchedIds = matchedProps.slice(0, 2).map((p) => p.id);

    let reply = "";
    if (matchedProps.length > 0) {
      const prop1 = matchedProps[0];
      const priceLakhs = (prop1.price / 100000).toFixed(0);
      reply = `Hi ${name}, thanks for your enquiry with ${input.businessInfo?.name || "LeadPilot Realty"}. We have verified ${prop1.bedrooms || 2}BHK options in ${prop1.location} starting around ₹${priceLakhs} Lakhs that match your requirement. Could you let me know your preferred possession timeline and whether you need home loan assistance?`;
    } else {
      reply = `Hi ${name}, thanks for reaching out to ${input.businessInfo?.name || "our team"}. We received your requirement for ${lead.location || "the area"}. Could you let me know your preferred move-in date and your budget range so I can shortlist the best available units for you?`;
    }

    return {
      reply,
      model: this.defaultModel,
      matchedPropertyIds: matchedIds,
      tokenUsage: { promptTokens: 180, completionTokens: 65, totalTokens: 245 },
    };
  }

  async generateFollowUp(input: GenerateFollowUpInput): Promise<{
    followUpMessage: string;
    suggestedScheduledDate: Date;
    model: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    const name = input.lead.name.split(" ")[0] || "Sir/Madam";
    const loc = input.lead.location || "Chennai";

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2); // 2 days later

    let message = "";
    if (input.followUpType === "WHATSAPP") {
      message = `Hi ${name}, following up on your search for properties in ${loc}. Are you free this weekend for a quick 20-minute site visit, or would you prefer a digital walkthrough video first?`;
    } else if (input.followUpType === "CALL") {
      message = `Call ${name} to discuss shortlisted units in ${loc} and confirm loan eligibility status.`;
    } else {
      message = `Hi ${name}, following up on your recent property enquiry with ${input.businessInfo?.name || "LeadPilot"}. We have new inventory released in ${loc}. Let us know when is a good time to connect.`;
    }

    return {
      followUpMessage: message,
      suggestedScheduledDate: scheduledDate,
      model: this.defaultModel,
      tokenUsage: { promptTokens: 120, completionTokens: 45, totalTokens: 165 },
    };
  }

  async chatAssistant(input: AssistantChatInput): Promise<AssistantResponse> {
    const lastUserMessage = input.messages
      .filter((m) => m.role === "user")
      .slice(-1)[0]?.content.toLowerCase() || "";

    if (lastUserMessage.includes("hot") || lastUserMessage.includes("score")) {
      return {
        reply: "Here are your highest priority hot leads with lead scores above 80. They have immediate purchase intent and confirmed budgets.",
        suggestedAction: {
          type: "filter_leads",
          payload: { minScore: 80, urgency: "HIGH" },
        },
      };
    }

    if (lastUserMessage.includes("overdue") || lastUserMessage.includes("due")) {
      return {
        reply: "You have follow-ups that require urgent attention. Reaching out today increases conversion probability by 40%.",
        suggestedAction: {
          type: "navigate",
          payload: { url: "/followups?status=PENDING&overdue=true" },
        },
      };
    }

    if (lastUserMessage.includes("whatsapp") || lastUserMessage.includes("source")) {
      return {
        reply: "WhatsApp is currently your top performing lead acquisition channel with a 6.7% conversion rate, generating 18 qualified leads this month.",
        suggestedAction: {
          type: "navigate",
          payload: { url: "/analytics" },
        },
      };
    }

    return {
      reply: "I can assist you with analyzing leads, checking overdue follow-ups, viewing matching inventory, and generating WhatsApp responses. How can I help you today?",
    };
  }
}

