import { LeadAnalysisResult } from "@/lib/validations/ai";

export interface PropertySummary {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  propertyType: string;
  bedrooms?: number | null;
  area?: number | null;
  status: string;
  legalStatus?: string;
}

export interface LeadContext {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  requirement?: string | null;
  location?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  leadScore?: number;
  urgency?: string;
  purchaseIntent?: string;
}

export interface GenerateReplyInput {
  lead: LeadContext;
  previousMessages?: string[];
  businessInfo?: {
    name: string;
    city: string;
    description?: string;
    agentName?: string;
  };
  availableProperties: PropertySummary[];
  customInstructions?: string;
}

export interface GenerateFollowUpInput {
  lead: LeadContext;
  conversationHistory: string[];
  businessInfo?: {
    name: string;
    agentName?: string;
  };
  followUpType: "CALL" | "WHATSAPP" | "EMAIL";
  lastContactDaysAgo?: number;
}

export interface AssistantTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AssistantChatInput {
  messages: AssistantMessage[];
  contextData?: Record<string, any>;
}

export interface AssistantResponse {
  reply: string;
  suggestedAction?: {
    type: "navigate" | "filter_leads" | "create_followup" | "show_properties";
    payload?: any;
  };
}

export interface IAIProvider {
  readonly name: string;
  readonly defaultModel: string;

  analyzeLead(message: string, businessContext?: string): Promise<LeadAnalysisResult>;

  generateReply(input: GenerateReplyInput): Promise<{
    reply: string;
    model: string;
    matchedPropertyIds: string[];
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }>;

  generateFollowUp(input: GenerateFollowUpInput): Promise<{
    followUpMessage: string;
    suggestedScheduledDate: Date;
    model: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }>;

  chatAssistant(input: AssistantChatInput): Promise<AssistantResponse>;
}

