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

    return provider;
  }

  unregister(providerId) {
    return this.#providers.delete(providerId);
  }

  has(providerId) {
    return this.#providers.has(providerId);
  }

  get(providerId) {
    return this.#providers.get(providerId) || null;
  }

  require(providerId) {
    const provider = this.get(providerId);

    if (!provider) {
      throw new Error(`Unknown AI provider: ${providerId}`);
    }

    return provider;
  }

  list() {
    return Object.freeze([...this.#providers.values()]);
  }
}
