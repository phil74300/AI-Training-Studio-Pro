export const AIContextItemType = Object.freeze({
  CHAPTER: "chapter",
  SELECTED_TEXT: "selected-text",
  SOURCE_DOCUMENT: "source-document",
  IMAGE: "image",
  ATTACHMENT: "attachment",
  CONVERSATION_MESSAGE: "conversation-message",
  METADATA: "metadata",
});

export const AIContextSensitivity = Object.freeze({
  PUBLIC: "public",
  INTERNAL: "internal",
  CONFIDENTIAL: "confidential",
  RESTRICTED: "restricted",
});

export const AIContextRedactionStatus = Object.freeze({
  NOT_REQUIRED: "not-required",
  PENDING: "pending",
  APPLIED: "applied",
});

const cloneValue = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
      )
    );
  }

  return value;
};

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const optionalText = (value, field) => {
  return value === null ? null : requireText(value, field);
};

const requireRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return cloneValue(value);
};

const normalizeEstimate = (value, field) => {
  if (value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${field} must be a non-negative integer or null.`);
  }

  return value;
};

const normalizeSizeEstimate = (sizeEstimate) => {
  const normalized = requireRecord(sizeEstimate, "sizeEstimate");

  return Object.freeze({
    characters: normalizeEstimate(
      normalized.characters ?? null,
      "sizeEstimate.characters"
    ),
    bytes: normalizeEstimate(normalized.bytes ?? null, "sizeEstimate.bytes"),
    tokens: normalizeEstimate(normalized.tokens ?? null, "sizeEstimate.tokens"),
  });
};

export const AI_CONTEXT_ITEM_SCHEMA_VERSION = 1;

export class AIContextItem {
  constructor({
    schemaVersion = AI_CONTEXT_ITEM_SCHEMA_VERSION,
    id,
    type,
    title,
    contentReference,
    sourceReference,
    sourceVersion = null,
    contentHash = null,
    sizeEstimate = {},
    provenance,
    sensitivity = AIContextSensitivity.INTERNAL,
    redactionStatus = AIContextRedactionStatus.NOT_REQUIRED,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Context item schemaVersion must be positive.");
    }

    if (!Object.values(AIContextItemType).includes(type)) {
      throw new TypeError(`Unsupported context item type: ${type}`);
    }

    if (!Object.values(AIContextSensitivity).includes(sensitivity)) {
      throw new TypeError(
        `Unsupported sensitivity classification: ${sensitivity}`
      );
    }

    if (!Object.values(AIContextRedactionStatus).includes(redactionStatus)) {
      throw new TypeError(`Unsupported redaction status: ${redactionStatus}`);
    }

    this.schemaVersion = schemaVersion;
    this.id = requireText(id, "Context item id");
    this.type = type;
    this.title = requireText(title, "Context item title");
    this.contentReference = requireRecord(contentReference, "contentReference");
    this.sourceReference = requireRecord(sourceReference, "sourceReference");
    this.sourceVersion = optionalText(sourceVersion, "sourceVersion");
    this.contentHash = optionalText(contentHash, "contentHash");
    this.sizeEstimate = normalizeSizeEstimate(sizeEstimate);
    this.provenance = requireRecord(provenance, "provenance");
    this.sensitivity = sensitivity;
    this.redactionStatus = redactionStatus;

    Object.freeze(this);
  }

  static from(item) {
    return item instanceof AIContextItem ? item : new AIContextItem(item);
  }

  toManifestEntry() {
    return Object.freeze({
      id: this.id,
      type: this.type,
      title: this.title,
      contentReference: this.contentReference,
      sourceReference: this.sourceReference,
      sourceVersion: this.sourceVersion,
      contentHash: this.contentHash,
      sizeEstimate: this.sizeEstimate,
      provenance: this.provenance,
      sensitivity: this.sensitivity,
      redactionStatus: this.redactionStatus,
    });
  }
}
