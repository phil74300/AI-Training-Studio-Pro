import { AIProviderManager } from "./AIProviderManager";
import { AIProviderRegistry } from "./AIProviderRegistry";
import { MockAIProviderAdapter } from "./providers/MockAIProviderAdapter";
import { OpenAIProviderAdapter } from "./providers/openai/OpenAIProviderAdapter";

export const createAIProviderRegistry = () =>
  new AIProviderRegistry([
    new MockAIProviderAdapter(),
    new OpenAIProviderAdapter(),
  ]);

export const createAIProviderManager = () =>
  new AIProviderManager(createAIProviderRegistry());
