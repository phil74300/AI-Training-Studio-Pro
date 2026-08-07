const abstractMethod = (method) => {
  throw new Error(`AIProviderAdapter.${method}() must be implemented.`);
};

export const AI_PROVIDER_ADAPTER_METHODS = Object.freeze([
  "validateConfiguration",
  "listModels",
  "getCapabilities",
  "execute",
  "healthCheck",
]);

export class AIProviderAdapter {
  constructor(id) {
    if (typeof id !== "string" || !id.trim()) {
      throw new TypeError("AIProviderAdapter requires a non-empty id.");
    }

    Object.defineProperty(this, "id", {
      value: id.trim(),
      enumerable: true,
      writable: false,
    });
  }

  validateConfiguration(config) {
    return abstractMethod("validateConfiguration", config);
  }

  listModels(config) {
    return abstractMethod("listModels", config);
  }

  getCapabilities(model, config) {
    return abstractMethod("getCapabilities", model, config);
  }

  execute(request, executionContext) {
    return abstractMethod("execute", request, executionContext);
  }

  healthCheck(config) {
    return abstractMethod("healthCheck", config);
  }
}

export function isAIProviderAdapter(provider) {
  return Boolean(
    provider &&
    typeof provider.id === "string" &&
    provider.id.trim() &&
    provider.id === provider.id.trim() &&
    AI_PROVIDER_ADAPTER_METHODS.every(
      (method) => typeof provider[method] === "function"
    )
  );
}
