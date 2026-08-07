const cloneRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return Object.freeze({ ...value });
};

const cloneArray = (value, field) => {
  if (!Array.isArray(value)) {
    throw new TypeError(`${field} must be an array.`);
  }

  return Object.freeze([...value]);
};

const requireId = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const optionalId = (value, field) => {
  return value === null ? null : requireId(value, field);
};

const normalizeMetadata = (metadata) => {
  const normalized = cloneRecord(metadata, "metadata");

  return Object.freeze({
    correlationId: optionalId(
      normalized.correlationId ?? null,
      "metadata.correlationId"
    ),
    projectId: optionalId(normalized.projectId ?? null, "metadata.projectId"),
    chapterId: optionalId(normalized.chapterId ?? null, "metadata.chapterId"),
    attributes: cloneRecord(normalized.attributes || {}, "metadata.attributes"),
  });
};

const normalizeProviderExtensions = (extensions) => {
  const normalized = cloneRecord(extensions, "providerExtensions");

  return Object.freeze(
    Object.fromEntries(
      Object.entries(normalized).map(([providerId, values]) => [
        requireId(providerId, "providerExtensions provider id"),
        cloneRecord(values, `providerExtensions.${providerId}`),
      ])
    )
  );
};

export const AI_REQUEST_SCHEMA_VERSION = 1;

export class AIRequest {
  constructor({
    schemaVersion = AI_REQUEST_SCHEMA_VERSION,
    requestId,
    actionId,
    modelId,
    messages = [],
    input = null,
    multimodalInputs = [],
    generationParameters = {},
    outputSchema = null,
    tools = [],
    timeout = null,
    metadata = {},
    providerExtensions = {},
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("schemaVersion must be a positive integer.");
    }

    if (timeout !== null && (!Number.isInteger(timeout) || timeout <= 0)) {
      throw new TypeError("timeout must be a positive integer or null.");
    }

    if (outputSchema !== null && typeof outputSchema !== "object") {
      throw new TypeError("outputSchema must be an object or null.");
    }

    this.schemaVersion = schemaVersion;
    this.requestId = requireId(requestId, "requestId");
    this.actionId = requireId(actionId, "actionId");
    this.modelId = requireId(modelId, "modelId");
    this.messages = cloneArray(messages, "messages");
    this.input = input;
    this.multimodalInputs = cloneArray(multimodalInputs, "multimodalInputs");
    this.generationParameters = cloneRecord(
      generationParameters,
      "generationParameters"
    );
    this.outputSchema = outputSchema
      ? cloneRecord(outputSchema, "outputSchema")
      : null;
    this.tools = cloneArray(tools, "tools");
    this.timeout = timeout;
    this.metadata = normalizeMetadata(metadata);
    this.providerExtensions = normalizeProviderExtensions(providerExtensions);

    Object.freeze(this);
  }
}
