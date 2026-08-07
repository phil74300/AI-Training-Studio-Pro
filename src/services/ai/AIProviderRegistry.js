import { isAIProviderAdapter } from "./AIProviderAdapter";

export class AIProviderRegistry {
  #providers = new Map();

  constructor(providers = []) {
    providers.forEach((provider) => this.register(provider));
  }

  register(provider) {
    if (!isAIProviderAdapter(provider)) {
      throw new TypeError("Invalid AI provider adapter.");
    }

    const providerId = provider.id.trim();

    if (this.#providers.has(providerId)) {
      throw new Error(`AI provider already registered: ${providerId}`);
    }

    this.#providers.set(providerId, provider);

    return this.get(providerId);
  }

  unregister(providerId) {
    return this.#providers.delete(providerId);
  }

  has(providerId) {
    return this.#providers.has(providerId);
  }

  get(providerId) {
    const provider = this.#providers.get(providerId);

    return provider ? this.#createDescriptor(provider) : null;
  }

  require(providerId) {
    const provider = this.get(providerId);

    if (!provider) {
      throw new Error(`Unknown AI provider: ${providerId}`);
    }

    return provider;
  }

  list() {
    return Object.freeze(
      [...this.#providers.values()].map((provider) =>
        this.#createDescriptor(provider)
      )
    );
  }

  validateConfiguration(providerId, config) {
    return this.#requireAdapter(providerId).validateConfiguration(config);
  }

  listModels(providerId, config) {
    return this.#requireAdapter(providerId).listModels(config);
  }

  getCapabilities(providerId, modelId, config) {
    return this.#requireAdapter(providerId).getCapabilities(modelId, config);
  }

  execute(providerId, request, executionContext) {
    return this.#requireAdapter(providerId).execute(request, executionContext);
  }

  healthCheck(providerId, config) {
    return this.#requireAdapter(providerId).healthCheck(config);
  }

  #requireAdapter(providerId) {
    const provider = this.#providers.get(providerId);

    if (!provider) {
      throw new Error(`Unknown AI provider: ${providerId}`);
    }

    return provider;
  }

  #createDescriptor(provider) {
    return Object.freeze({
      id: provider.id,
    });
  }
}
