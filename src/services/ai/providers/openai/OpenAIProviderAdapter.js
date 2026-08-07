import { AIProviderAdapter } from "../../AIProviderAdapter";
import { AIRequest } from "../../AIRequest";
import { AIResponse } from "../../AIResponse";
import { findOpenAIModel, OPENAI_MODEL_CATALOG } from "./OpenAIModelCatalog";
import { OPENAI_PROVIDER_ID } from "./OpenAIModelDescriptor";
import { OpenAIProviderDescriptor } from "./OpenAIProviderDescriptor";

const allowedConfigurationFields = Object.freeze(
  new Set([
    "apiKeyReference",
    "defaultModel",
    "organizationId",
    "projectId",
    "timeout",
    "options",
  ])
);

const rawCredentialFields = Object.freeze(
  new Set(["apiKey", "key", "token", "accessToken", "secret"])
);

const isRecord = (value) =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const findRawCredentialPaths = (value, path = "configuration") => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findRawCredentialPaths(item, `${path}[${index}]`)
    );
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([field, item]) => {
    const fieldPath = `${path}.${field}`;

    return rawCredentialFields.has(field)
      ? [fieldPath]
      : findRawCredentialPaths(item, fieldPath);
  });
};

const validateOptionalText = (config, field, errors) => {
  if (
    config[field] !== undefined &&
    (typeof config[field] !== "string" || !config[field].trim())
  ) {
    errors.push(`${field} must be a non-empty string when provided.`);
  }
};

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
  constructor() {
    super(OPENAI_PROVIDER_ID);

    Object.defineProperty(this, "descriptor", {
      value: new OpenAIProviderDescriptor({ models: OPENAI_MODEL_CATALOG }),
      enumerable: true,
      writable: false,
    });
  }

  validateConfiguration(config = {}) {
    if (!isRecord(config)) {
      return Object.freeze({
        valid: false,
        errors: Object.freeze(["Configuration must be an object."]),
      });
    }

    const errors = [];
    const fields = Object.keys(config);

    findRawCredentialPaths(config).forEach((fieldPath) =>
      errors.push(`${fieldPath} must not contain a raw credential.`)
    );
    fields
      .filter(
        (field) =>
          !allowedConfigurationFields.has(field) &&
          !rawCredentialFields.has(field)
      )
      .forEach((field) =>
        errors.push(`Unsupported OpenAI configuration field: ${field}.`)
      );

    ["apiKeyReference", "defaultModel", "organizationId", "projectId"].forEach(
      (field) => validateOptionalText(config, field, errors)
    );

    if (
      config.defaultModel !== undefined &&
      !findOpenAIModel(config.defaultModel)
    ) {
      errors.push(`Unknown OpenAI default model: ${config.defaultModel}.`);
    }

    if (
      config.timeout !== undefined &&
      (!Number.isInteger(config.timeout) || config.timeout <= 0)
    ) {
      errors.push("timeout must be a positive integer when provided.");
    }

    if (config.options !== undefined && !isRecord(config.options)) {
      errors.push("options must be an object when provided.");
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
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

  healthCheck() {
    return Object.freeze({
      providerId: this.id,
      available: false,
      live: false,
      reason: "Live OpenAI health checks are not available in AI-7.1.",
      metadata: Object.freeze({
        openai: Object.freeze({ networkRequestPerformed: false }),
      }),
    });
  }
}
