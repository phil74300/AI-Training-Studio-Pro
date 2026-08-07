const cloneRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return Object.freeze({ ...value });
};

const normalizeError = (error) => {
  if (!error || typeof error !== "object") {
    throw new TypeError("A failed AIResponse requires a normalized error.");
  }

  if (typeof error.code !== "string" || !error.code.trim()) {
    throw new TypeError("AIResponse error.code must be a non-empty string.");
  }

  if (typeof error.message !== "string" || !error.message.trim()) {
    throw new TypeError("AIResponse error.message must be a non-empty string.");
  }

  return Object.freeze({
    code: error.code.trim(),
    message: error.message.trim(),
    retryable: error.retryable === true,
    details: cloneRecord(error.details || {}, "error.details"),
  });
};

export class AIResponse {
  constructor({
    success,
    result = null,
    usage = {},
    finishReason = null,
    providerMetadata = {},
    error = null,
  }) {
    if (typeof success !== "boolean") {
      throw new TypeError("AIResponse.success must be a boolean.");
    }

    if (finishReason !== null && typeof finishReason !== "string") {
      throw new TypeError("finishReason must be a string or null.");
    }

    if (success && error !== null) {
      throw new Error("A successful AIResponse cannot contain an error.");
    }

    this.success = success;
    this.result = result;
    this.usage = cloneRecord(usage, "usage");
    this.finishReason = finishReason;
    this.providerMetadata = cloneRecord(providerMetadata, "providerMetadata");
    this.error = success ? null : normalizeError(error);

    Object.freeze(this);
  }

  static completed({
    result,
    usage = {},
    finishReason = null,
    providerMetadata = {},
  }) {
    return new AIResponse({
      success: true,
      result,
      usage,
      finishReason,
      providerMetadata,
    });
  }

  static failed({ error, usage = {}, providerMetadata = {} }) {
    return new AIResponse({
      success: false,
      usage,
      providerMetadata,
      error,
    });
  }
}
