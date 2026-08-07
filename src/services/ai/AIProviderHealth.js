export const AIProviderHealthStatus = Object.freeze({
  AVAILABLE: "AVAILABLE",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  UNREACHABLE: "UNREACHABLE",
  TIMEOUT: "TIMEOUT",
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
});

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const normalizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new TypeError("Provider health metadata must be an object.");
  }

  return Object.freeze({ ...metadata });
};

const normalizeError = (error, status) => {
  if (status === AIProviderHealthStatus.AVAILABLE) {
    if (error !== null && error !== undefined) {
      throw new TypeError("Available provider health cannot include an error.");
    }

    return null;
  }

  if (!error || typeof error !== "object" || Array.isArray(error)) {
    throw new TypeError("Unavailable provider health requires an error.");
  }

  if (typeof error.retryable !== "boolean") {
    throw new TypeError("Provider health error retryable must be a boolean.");
  }

  return Object.freeze({
    code: requireText(error.code, "Provider health error code"),
    category: status,
    retryable: error.retryable,
    message: requireText(error.message, "Provider health error message"),
  });
};

export class AIProviderHealth {
  constructor({ providerId, status, error = null, checkedAt, metadata = {} }) {
    if (!Object.values(AIProviderHealthStatus).includes(status)) {
      throw new TypeError(`Unsupported provider health status: ${status}`);
    }

    const timestamp = new Date(checkedAt);

    if (Number.isNaN(timestamp.getTime())) {
      throw new TypeError("Provider health checkedAt must be a valid date.");
    }

    this.providerId = requireText(providerId, "Provider health providerId");
    this.status = status;
    this.available = status === AIProviderHealthStatus.AVAILABLE;
    this.error = normalizeError(error, status);
    this.checkedAt = timestamp.toISOString();
    this.metadata = normalizeMetadata(metadata);

    Object.freeze(this);
  }

  static available({ providerId, checkedAt, metadata = {} }) {
    return new AIProviderHealth({
      providerId,
      status: AIProviderHealthStatus.AVAILABLE,
      checkedAt,
      metadata,
    });
  }

  static failed({ providerId, status, error, checkedAt, metadata = {} }) {
    return new AIProviderHealth({
      providerId,
      status,
      error,
      checkedAt,
      metadata,
    });
  }
}
