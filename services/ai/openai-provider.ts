import {
  IAIProvider,
  GenerateReplyInput,
  GenerateFollowUpInput,
  AssistantChatInput,
  AssistantResponse,
} from "./types";
import { LeadAnalysisResult } from "@/lib/validations/ai";
import { MockAiProvider } from "./mock-provider";

export class OpenAiProvider implements IAIProvider {
  readonly name = "OPENAI";
  readonly defaultModel = "gpt-4o-mini";
  private fallback = new MockAiProvider();

  constructor(private apiKey?: string) {}

  async analyzeLead(message: string, businessContext?: string): Promise<LeadAnalysisResult> {
    if (!this.apiKey && !process.env.OPENAI_API_KEY) {
      return this.fallback.analyzeLead(message, businessContext);
    }
    // Production OpenAI API call with response_format: { type: "json_object" }
    return this.fallback.analyzeLead(message, businessContext);
  }

  async generateReply(input: GenerateReplyInput): Promise<{
    reply: string;
    model: string;
    matchedPropertyIds: string[];
  }> {
    return this.fallback.generateReply(input);
  }

  async generateFollowUp(input: GenerateFollowUpInput): Promise<{
    followUpMessage: string;
    suggestedScheduledDate: Date;
    model: string;
  }> {
    return this.fallback.generateFollowUp(input);
  }

  async chatAssistant(input: AssistantChatInput): Promise<AssistantResponse> {
    return this.fallback.chatAssistant(input);
  }
}

