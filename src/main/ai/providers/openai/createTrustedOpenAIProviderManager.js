import { createAIProviderManager } from "../../../../services/ai/AIProviderComposition";
import { OpenAIHealthCheckService } from "./OpenAIHealthCheckService";

export const createTrustedOpenAIProviderManager = ({
  credentialStore,
  request = globalThis.fetch,
  clock = () => new Date(),
}) => {
  const openAIHealthCheckService = new OpenAIHealthCheckService({
    credentialStore,
    request,
    clock,
  });

  return createAIProviderManager({ openAIHealthCheckService });
};
