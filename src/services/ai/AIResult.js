export const AIResultType = Object.freeze({
  TEXT: "text",
  STRUCTURED_DATA: "structured-data",
  QUIZ: "quiz",
  IMAGE_ARTIFACT: "image-artifact",
  FILE_ARTIFACT: "file-artifact",
  EDITOR_SUGGESTION: "editor-suggestion",
});

const requireResultType = (type) => {
  if (!Object.values(AIResultType).includes(type)) {
    throw new TypeError(`Unsupported AI result type: ${type}`);
  }

  return type;
};

const requireSchemaVersion = (schemaVersion) => {
  if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    throw new TypeError("AI result schemaVersion must be a positive integer.");
  }

  return schemaVersion;
};

const normalizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new TypeError("AI result metadata must be an object.");
  }

  return Object.freeze({ ...metadata });
};

export class AIResult {
  constructor({ type, schemaVersion = 1, payload, metadata = {} }) {
    if (payload === undefined) {
      throw new TypeError("AI result payload is required.");
    }

    this.type = requireResultType(type);
    this.schemaVersion = requireSchemaVersion(schemaVersion);
    this.payload = payload;
    this.metadata = normalizeMetadata(metadata);

    Object.freeze(this);
  }

  static from(result) {
    return result instanceof AIResult ? result : new AIResult(result);
  }
}
