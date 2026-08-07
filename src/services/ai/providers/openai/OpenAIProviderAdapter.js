import { AIProviderAdapter } from "../../AIProviderAdapter";
import {
  AIProviderHealth,
  AIProviderHealthStatus,
} from "../../AIProviderHealth";
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
  #healthCheckService;

  constructor({ healthCheckService = null } = {}) {
    super(OPENAI_PROVIDER_ID);

    if (
      healthCheckService !== null &&
      typeof healthCheckService?.check !== "function"
    ) {
      throw new TypeError(
        "OpenAIProviderAdapter requires a health-check service contract."
      );
    }

    this.#healthCheckService = healthCheckService;

    Object.defineProperty(this, "descriptor", {
      value: new OpenAIProviderDescriptor({
        models: OPENAI_MODEL_CATALOG,
        liveHealthCheck: healthCheckService !== null,
      }),
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

  healthCheck(config = {}) {
    const checkedAt = new Date();
    const validation = configurationValidator.validate(config);

    if (!validation.valid || !validation.configuration.enabled) {
      return AIProviderHealth.failed({
        providerId: this.id,
        status: AIProviderHealthStatus.INVALID_CONFIGURATION,
        checkedAt,
        error: {
          code: "openai-invalid-configuration",
          retryable: false,
          message: "The OpenAI configuration is invalid or disabled.",
        },
        metadata: { networkRequestPerformed: false },
      });
    }

    if (!this.#healthCheckService) {
      return AIProviderHealth.failed({
        providerId: this.id,
        status: AIProviderHealthStatus.INVALID_CONFIGURATION,
        checkedAt,
        error: {
          code: "openai-trusted-health-check-unavailable",
          retryable: false,
          message: "The trusted OpenAI health-check service is unavailable.",
        },
        metadata: { networkRequestPerformed: false },
      });
    }

    return this.#healthCheckService.check(validation.configuration);
  }
}
