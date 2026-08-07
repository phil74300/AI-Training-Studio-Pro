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

export class AIRequest {
  constructor({
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
    if (timeout !== null && (!Number.isInteger(timeout) || timeout <= 0)) {
      throw new TypeError("timeout must be a positive integer or null.");
    }

    if (outputSchema !== null && typeof outputSchema !== "object") {
      throw new TypeError("outputSchema must be an object or null.");
    }

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
    this.metadata = cloneRecord(metadata, "metadata");
    this.providerExtensions = cloneRecord(
      providerExtensions,
      "providerExtensions"
    );

    Object.freeze(this);
  }
}
