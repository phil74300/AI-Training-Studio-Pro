import { AIProviderManager } from "./AIProviderManager";
import { AIProviderRegistry } from "./AIProviderRegistry";
import { MockAIProviderAdapter } from "./providers/MockAIProviderAdapter";
import { OpenAIProviderAdapter } from "./providers/openai/OpenAIProviderAdapter";

export const createAIProviderRegistry = ({
  openAIHealthCheckService = null,
} = {}) =>
  new AIProviderRegistry([
    new MockAIProviderAdapter(),
    new OpenAIProviderAdapter({ healthCheckService: openAIHealthCheckService }),
  ]);

export const createAIProviderManager = (options = {}) =>
  new AIProviderManager(createAIProviderRegistry(options));
