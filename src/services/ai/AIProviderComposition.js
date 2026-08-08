import { AIProviderManager } from "./AIProviderManager";
import { AIProviderRegistry } from "./AIProviderRegistry";
import { MockAIProviderAdapter } from "./providers/MockAIProviderAdapter";
import { createGeminiProviderAdapter } from "./providers/gemini/GeminiProviderComposition";
import { OpenAIProviderAdapter } from "./providers/openai/OpenAIProviderAdapter";

export const createAIProviderRegistry = ({
  openAIHealthCheckService = null,
  geminiHealthCheckService = null,
  geminiExecutionService = null,
} = {}) =>
  new AIProviderRegistry([
    new MockAIProviderAdapter(),
    new OpenAIProviderAdapter({ healthCheckService: openAIHealthCheckService }),
    createGeminiProviderAdapter({
      healthCheckService: geminiHealthCheckService,
      executionService: geminiExecutionService,
    }),
  ]);

export const createAIProviderManager = (options = {}) =>
  new AIProviderManager(createAIProviderRegistry(options));
