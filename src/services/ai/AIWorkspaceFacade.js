import { createAIProviderManager } from "./AIProviderComposition";

const providerManagerMethods = Object.freeze([
  "listProviders",
  "selectProvider",
  "clearSelection",
  "getSelectedProviderId",
  "validateAvailability",
  "listModels",
  "getCapabilities",
]);

const isProviderManager = (providerManager) => {
  return providerManagerMethods.every(
    (method) => typeof providerManager?.[method] === "function"
  );
};

export class AIWorkspaceFacade {
  #providerManager;

  constructor(providerManager = createAIProviderManager()) {
    if (!isProviderManager(providerManager)) {
      throw new TypeError(
        "AIWorkspaceFacade requires an AI provider manager contract."
      );
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
