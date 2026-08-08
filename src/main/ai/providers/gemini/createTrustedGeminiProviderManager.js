import { createAIProviderManager } from "../../../../services/ai/AIProviderComposition";
import { GeminiConfiguration } from "../../../../services/ai/providers/gemini/configuration/GeminiConfiguration";
import { GeminiExecutionService } from "./GeminiExecutionService";
import { GeminiHealthCheckService } from "./GeminiHealthCheckService";

export const createTrustedGeminiProviderManager = ({
  credentialStore,
  configuration,
  request = globalThis.fetch,
  clock = () => new Date(),
}) => {
  const normalizedConfiguration =
    configuration instanceof GeminiConfiguration
      ? configuration
      : new GeminiConfiguration(configuration);
  const geminiHealthCheckService = new GeminiHealthCheckService({
    credentialStore,
    request,
    clock,
  });
  const geminiExecutionService = new GeminiExecutionService({
    credentialStore,
    configuration: normalizedConfiguration,
    request,
  });

  return createAIProviderManager({
    geminiHealthCheckService,
    geminiExecutionService,
  });
};
