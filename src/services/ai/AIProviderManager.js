import { AIProviderCapabilities } from "./AIProviderCapabilities";
import { AIProviderRegistry } from "./AIProviderRegistry";

const registryMethods = Object.freeze([
  "list",
  "require",
  "validateConfiguration",
  "listModels",
  "getCapabilities",
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
        health: null,
      });
    }

    const health = await this.#registry.healthCheck(resolvedProviderId, config);

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

  #resolveProviderId(providerId) {
    const resolvedProviderId = providerId || this.#selectedProviderId;

    if (!resolvedProviderId) {
      throw new Error("No AI provider selected.");
    }

    this.#registry.require(resolvedProviderId);

    return resolvedProviderId;
  }
}
