import { AIProviderAdapter } from "../../AIProviderAdapter";
import {
  AIProviderHealth,
  AIProviderHealthStatus,
} from "../../AIProviderHealth";
import { AIRequest } from "../../AIRequest";
import { AIResponse } from "../../AIResponse";
import { GeminiConfigurationValidator } from "./configuration/GeminiConfigurationValidator";
import { findGeminiModel, GEMINI_MODEL_CATALOG } from "./GeminiModelCatalog";
import { GEMINI_PROVIDER_ID } from "./GeminiModelDescriptor";
import { GeminiProviderDescriptor } from "./GeminiProviderDescriptor";

const configurationValidator = new GeminiConfigurationValidator();

const requireService = (service, field) => {
  if (service !== null && typeof service?.[field] !== "function") {
    throw new TypeError(
      `GeminiProviderAdapter requires a ${field} service contract.`
    );
  }

  return service;
};

const createOfflineError = ({ requestId, modelId }) =>
  AIResponse.failed({
    requestId,
    providerId: GEMINI_PROVIDER_ID,
    modelId,
    error: {
      code: "provider-live-execution-unavailable",
      category: "provider",
      message: "Trusted Gemini execution is not configured.",
      retryable: false,
      details: { category: "provider" },
    },
    providerMetadata: {
      gemini: Object.freeze({
        integrationPhase: "foundation",
        api: "interactions-v1",
        networkRequestPerformed: false,
      }),
    },
  });

export class GeminiProviderAdapter extends AIProviderAdapter {
  #healthCheckService;

  #executionService;

  constructor({ healthCheckService = null, executionService = null } = {}) {
    super(GEMINI_PROVIDER_ID);

    this.#healthCheckService = requireService(healthCheckService, "check");
    this.#executionService = requireService(executionService, "execute");

    Object.defineProperty(this, "descriptor", {
      value: new GeminiProviderDescriptor({
        models: GEMINI_MODEL_CATALOG,
        liveHealthCheck: healthCheckService !== null,
        liveExecution: executionService !== null,
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
    return GEMINI_MODEL_CATALOG;
  }

  getCapabilities(modelId) {
    const model = findGeminiModel(modelId);

    if (!model) {
      throw new Error(`Unknown Gemini model: ${modelId}`);
    }

    return model.capabilities;
  }

  execute(request, executionContext) {
    if (!(request instanceof AIRequest)) {
      throw new TypeError("Gemini provider requires an AIRequest.");
    }

    if (!findGeminiModel(request.modelId)) {
      throw new Error(`Unknown Gemini model: ${request.modelId}`);
    }

    if (!this.#executionService) {
      return createOfflineError({
        requestId: request.requestId,
        modelId: request.modelId,
      });
    }

    return this.#executionService.execute(request, executionContext);
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
          code: "gemini-invalid-configuration",
          retryable: false,
          message: "The Gemini configuration is invalid or disabled.",
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
          code: "gemini-trusted-health-check-unavailable",
          retryable: false,
          message: "The trusted Gemini health-check service is unavailable.",
        },
        metadata: { networkRequestPerformed: false },
      });
    }

    return this.#healthCheckService.check(validation.configuration);
  }
}
