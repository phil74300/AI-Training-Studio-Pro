import { AIProviderAdapter } from "../../AIProviderAdapter";
import { AIRequest } from "../../AIRequest";
import { AIResponse } from "../../AIResponse";
import { OpenAIConfigurationValidator } from "./configuration/OpenAIConfigurationValidator";
import { findOpenAIModel, OPENAI_MODEL_CATALOG } from "./OpenAIModelCatalog";
import { OPENAI_PROVIDER_ID } from "./OpenAIModelDescriptor";
import { OpenAIProviderDescriptor } from "./OpenAIProviderDescriptor";

const configurationValidator = new OpenAIConfigurationValidator();

const createOfflineError = ({ requestId, modelId }) =>
  AIResponse.failed({
    requestId,
    providerId: OPENAI_PROVIDER_ID,
    modelId,
    error: {
      code: "provider-live-execution-unavailable",
      message: "Live OpenAI execution is not available in AI-7.1.",
      retryable: false,
      details: {},
    },
    providerMetadata: {
      openai: Object.freeze({
        integrationPhase: "foundation",
        networkRequestPerformed: false,
      }),
    },
  });

export class OpenAIProviderAdapter extends AIProviderAdapter {
  constructor() {
    super(OPENAI_PROVIDER_ID);

    Object.defineProperty(this, "descriptor", {
      value: new OpenAIProviderDescriptor({ models: OPENAI_MODEL_CATALOG }),
      enumerable: true,
      writable: false,
    });
  }

  validateConfiguration(config = {}) {
    const validation = configurationValidator.validate(config);

    return Object.freeze({
      valid: validation.valid,
      errors: validation.errors,
    });
  }

  listModels() {
    return OPENAI_MODEL_CATALOG;
  }

  getCapabilities(modelId) {
    const model = findOpenAIModel(modelId);

    if (!model) {
      throw new Error(`Unknown OpenAI model: ${modelId}`);
    }

    return model.capabilities;
  }

  execute(request) {
    if (!(request instanceof AIRequest)) {
      throw new TypeError("OpenAI provider requires an AIRequest.");
    }

    if (!findOpenAIModel(request.modelId)) {
      throw new Error(`Unknown OpenAI model: ${request.modelId}`);
    }

    return createOfflineError({
      requestId: request.requestId,
      modelId: request.modelId,
    });
  }

  healthCheck() {
    return Object.freeze({
      providerId: this.id,
      available: false,
      live: false,
      reason: "Live OpenAI health checks are not available in AI-7.1.",
      metadata: Object.freeze({
        openai: Object.freeze({ networkRequestPerformed: false }),
      }),
    });
  }
}
