import { AIProviderManager } from "./AIProviderManager";

export class AIWorkspaceFacade {
  #providerManager;

  constructor(providerManager = new AIProviderManager()) {
    if (!(providerManager instanceof AIProviderManager)) {
      throw new TypeError("AIWorkspaceFacade requires an AIProviderManager.");
    }

    this.#providerManager = providerManager;
  }

  listProviders() {
    return this.#providerManager.listProviders();
  }

  selectProvider(providerId) {
    this.#providerManager.selectProvider(providerId);

    return this.#providerManager.getSelectedProviderId();
  }

  clearProviderSelection() {
    this.#providerManager.clearSelection();
  }

  getSelectedProviderId() {
    return this.#providerManager.getSelectedProviderId();
  }

  validateAvailability(config = {}) {
    return this.#providerManager.validateAvailability(config);
  }

  listModels(config = {}) {
    return this.#providerManager.listModels(config);
  }

  getCapabilities(modelId, config = {}) {
    return this.#providerManager.getCapabilities(modelId, config);
  }
}
