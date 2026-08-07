import { AIProviderCapabilities } from "./AIProviderCapabilities";
import { AIProviderRegistry } from "./AIProviderRegistry";

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
    if (!(registry instanceof AIProviderRegistry)) {
      throw new TypeError("AIProviderManager requires an AIProviderRegistry.");
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

  getProvider(providerId = this.#selectedProviderId) {
    if (!providerId) {
      throw new Error("No AI provider selected.");
    }

    return this.#registry.require(providerId);
  }

  async validateAvailability(config = {}, providerId) {
    const provider = this.getProvider(providerId);
    const validation = await provider.validateConfiguration(config);

    if (!normalizeCheck(validation, "valid")) {
      return Object.freeze({
        providerId: provider.id,
        available: false,
        validation,
        health: null,
      });
    }

    const health = await provider.healthCheck(config);

    return Object.freeze({
      providerId: provider.id,
      available: normalizeCheck(health, "available"),
      validation,
      health,
    });
  }

  async listModels(config = {}, providerId) {
    const models = await this.getProvider(providerId).listModels(config);

    if (!Array.isArray(models)) {
      throw new TypeError("AI provider listModels() must return an array.");
    }

    return Object.freeze([...models]);
  }

  async getCapabilities(modelId, config = {}, providerId) {
    const capabilities = await this.getProvider(providerId).getCapabilities(
      modelId,
      config
    );

    return AIProviderCapabilities.from(capabilities);
  }
}
