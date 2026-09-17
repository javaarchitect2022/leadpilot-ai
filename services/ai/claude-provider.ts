import {
  IAIProvider,
  GenerateReplyInput,
  GenerateFollowUpInput,
  AssistantChatInput,
  AssistantResponse,
} from "./types";
import { LeadAnalysisResult } from "@/lib/validations/ai";
import { MockAiProvider } from "./mock-provider";

export class ClaudeProvider implements IAIProvider {
  readonly name = "CLAUDE";
  readonly defaultModel = "claude-3-5-sonnet-20241022";
  private fallback = new MockAiProvider();

  constructor(private apiKey?: string) {}

  async analyzeLead(message: string, businessContext?: string): Promise<LeadAnalysisResult> {
    if (!this.apiKey && !process.env.ANTHROPIC_API_KEY) {
      return this.fallback.analyzeLead(message, businessContext);
    }
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

