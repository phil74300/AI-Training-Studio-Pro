import { AIProviderCapabilities } from "./AIProviderCapabilities";
import { AIProviderHealth, AIProviderHealthStatus } from "./AIProviderHealth";
import { AIProviderRegistry } from "./AIProviderRegistry";
import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";

const registryMethods = Object.freeze([
  "list",
  "require",
  "validateConfiguration",
  "listModels",
  "getCapabilities",
  "execute",
  "healthCheck",
]);

const isProviderRegistry = (registry) => {
  return registryMethods.every(
    (method) => typeof registry?.[method] === "function"
  );
};

const normalizeCheck = (result, property) => {
  if (typeof result === "boolean") {
    return result;
  }

  return result?.[property] === true;
};

const createHealthError = (providerId, status, code, message) =>
  AIProviderHealth.failed({
    providerId,
    status,
    checkedAt: new Date(),
    error: {
      code,
      retryable: status === AIProviderHealthStatus.UNKNOWN_ERROR,
      message,
    },
  });

export class AIProviderManager {
  #registry;

  #selectedProviderId = null;

  constructor(registry = new AIProviderRegistry()) {
    if (!isProviderRegistry(registry)) {
      throw new TypeError(
        "AIProviderManager requires an AI provider registry contract."
      );
    }

    this.#registry = registry;
  }

  listProviders() {
    return this.#registry.list();
  }

  selectProvider(providerId) {
    const provider = this.#registry.require(providerId);

    this.#selectedProviderId = provider.id;

    return provider;
  }

  clearSelection() {
    this.#selectedProviderId = null;
  }

  getSelectedProviderId() {
    return this.#selectedProviderId;
  }

  async validateAvailability(config = {}, providerId) {
    const resolvedProviderId = this.#resolveProviderId(providerId);
    const validation = await this.#registry.validateConfiguration(
      resolvedProviderId,
      config
    );

    if (!normalizeCheck(validation, "valid")) {
      return Object.freeze({
        providerId: resolvedProviderId,
        available: false,
        validation,
        health: createHealthError(
          resolvedProviderId,
          AIProviderHealthStatus.INVALID_CONFIGURATION,
          "provider-invalid-configuration",
          "The AI provider configuration is invalid."
        ),
      });
    }

    let health;

    try {
      health = await this.#registry.healthCheck(resolvedProviderId, config);
    } catch {
      health = createHealthError(
        resolvedProviderId,
        AIProviderHealthStatus.UNKNOWN_ERROR,
        "provider-health-check-failed",
        "The AI provider health check failed."
      );
    }

    return Object.freeze({
      providerId: resolvedProviderId,
      available: normalizeCheck(health, "available"),
      validation,
      health,
    });
  }

  async listModels(config = {}, providerId) {
    const models = await this.#registry.listModels(
      this.#resolveProviderId(providerId),
      config
    );

    if (!Array.isArray(models)) {
      throw new TypeError("AI provider listModels() must return an array.");
    }

    return Object.freeze([...models]);
  }

  async getCapabilities(modelId, config = {}, providerId) {
    const capabilities = await this.#registry.getCapabilities(
      this.#resolveProviderId(providerId),
      modelId,
      config
    );

    return AIProviderCapabilities.from(capabilities);
  }

  async execute(request, executionContext, providerId) {
    if (!(request instanceof AIRequest)) {
      throw new TypeError("AIProviderManager.execute requires an AIRequest.");
    }

    const resolvedProviderId = this.#resolveProviderId(providerId);

    try {
      const providerResponse = await this.#registry.execute(
        resolvedProviderId,
        request,
        executionContext
      );
      const response =
        providerResponse instanceof AIResponse
          ? providerResponse
          : new AIResponse(providerResponse);

      if (
        response.requestId !== request.requestId ||
        response.providerId !== resolvedProviderId ||
        response.modelId !== request.modelId
      ) {
        throw new Error(
          "AI provider response identity does not match request."
        );
      }

      return response;
    } catch (error) {
      if (executionContext?.abortSignal?.aborted) {
        throw error;
      }

      return AIResponse.failed({
        requestId: request.requestId,
        providerId: resolvedProviderId,
        modelId: request.modelId,
        error: {
          code: "provider-execution-failed",
          message: "The AI provider execution failed.",
          retryable: false,
          details: {},
        },
      });
    }
  }

  #resolveProviderId(providerId) {
    const resolvedProviderId = providerId || this.#selectedProviderId;

    if (!resolvedProviderId) {
      throw new Error("No AI provider selected.");
    }

    this.#registry.require(resolvedProviderId);

    return resolvedProviderId;
  }
}
