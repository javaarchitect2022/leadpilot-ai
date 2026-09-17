import { IAIProvider } from "./types";
import { GeminiProvider } from "./gemini-provider";
import { OpenAiProvider } from "./openai-provider";
import { ClaudeProvider } from "./claude-provider";
import { MockAiProvider } from "./mock-provider";

export function getAiProvider(preferredProvider?: string): IAIProvider {
  const providerName = (preferredProvider || process.env.AI_PROVIDER || "GEMINI").toUpperCase();

  switch (providerName) {
    case "GEMINI":
      return new GeminiProvider();
    case "OPENAI":
      return new OpenAiProvider();
    case "CLAUDE":
      return new ClaudeProvider();
    case "MOCK":
    default:
      return new MockAiProvider();
  }
}

export * from "./types";
export * from "./gemini-provider";
export * from "./openai-provider";
export * from "./claude-provider";
export * from "./mock-provider";

