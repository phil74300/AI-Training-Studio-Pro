import { AIResult } from "./AIResult";

const cloneRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return Object.freeze({ ...value });
};

const requireId = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const normalizeMetric = (value, field) => {
  if (value === null) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${field} must be a non-negative number or null.`);
  }

  return value;
};

const normalizeUsage = (usage) => {
  const normalized = cloneRecord(usage, "usage");

  return Object.freeze({
    inputUnits: normalizeMetric(
      normalized.inputUnits ?? null,
      "usage.inputUnits"
    ),
    outputUnits: normalizeMetric(
      normalized.outputUnits ?? null,
      "usage.outputUnits"
    ),
    totalUnits: normalizeMetric(
      normalized.totalUnits ?? null,
      "usage.totalUnits"
    ),
    cachedInputUnits: normalizeMetric(
      normalized.cachedInputUnits ?? null,
      "usage.cachedInputUnits"
    ),
    reasoningUnits: normalizeMetric(
      normalized.reasoningUnits ?? null,
      "usage.reasoningUnits"
    ),
    imageUnits: normalizeMetric(
      normalized.imageUnits ?? null,
      "usage.imageUnits"
    ),
    toolCalls: normalizeMetric(normalized.toolCalls ?? null, "usage.toolCalls"),
    durationMs: normalizeMetric(
      normalized.durationMs ?? null,
      "usage.durationMs"
    ),
  });
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

export const AI_RESPONSE_SCHEMA_VERSION = 1;

export class AIResponse {
  constructor({
    schemaVersion = AI_RESPONSE_SCHEMA_VERSION,
    requestId,
    providerId,
    modelId,
    success,
    result = null,
    usage = {},
    finishReason = null,
    providerMetadata = {},
    error = null,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("schemaVersion must be a positive integer.");
    }

    if (typeof success !== "boolean") {
      throw new TypeError("AIResponse.success must be a boolean.");
    }

    if (finishReason !== null && typeof finishReason !== "string") {
      throw new TypeError("finishReason must be a string or null.");
    }

    if (success && error !== null) {
      throw new Error("A successful AIResponse cannot contain an error.");
    }

    if (success && result === null) {
      throw new Error("A successful AIResponse requires a result.");
    }

    if (!success && result !== null) {
      throw new Error("A failed AIResponse cannot contain a result.");
    }

    this.schemaVersion = schemaVersion;
    this.requestId = requireId(requestId, "requestId");
    this.providerId = requireId(providerId, "providerId");
    this.modelId = requireId(modelId, "modelId");
    this.success = success;
    this.result = success ? AIResult.from(result) : null;
    this.usage = normalizeUsage(usage);
    this.finishReason = finishReason;
    this.providerMetadata = cloneRecord(providerMetadata, "providerMetadata");
    this.error = success ? null : normalizeError(error);

    Object.freeze(this);
  }

  static completed({
    schemaVersion = AI_RESPONSE_SCHEMA_VERSION,
    requestId,
    providerId,
    modelId,
    result,
    usage = {},
    finishReason = null,
    providerMetadata = {},
  }) {
    return new AIResponse({
      schemaVersion,
      requestId,
      providerId,
      modelId,
      success: true,
      result,
      usage,
      finishReason,
      providerMetadata,
    });
  }

  static failed({
    schemaVersion = AI_RESPONSE_SCHEMA_VERSION,
    requestId,
    providerId,
    modelId,
    error,
    usage = {},
    providerMetadata = {},
  }) {
    return new AIResponse({
      schemaVersion,
      requestId,
      providerId,
      modelId,
      success: false,
      usage,
      providerMetadata,
      error,
    });
  }
}
