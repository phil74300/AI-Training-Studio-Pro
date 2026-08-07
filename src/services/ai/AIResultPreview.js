import { AIResult, AIResultType } from "./AIResult";

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

const normalizeResultReference = (reference) => {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) {
    throw new TypeError("Preview resultReference must be an object.");
  }

  const schemaVersion = reference.schemaVersion ?? 1;

  if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    throw new TypeError("resultReference.schemaVersion must be positive.");
  }

  if (!Object.values(AIResultType).includes(reference.type)) {
    throw new TypeError(`Unsupported AI result type: ${reference.type}`);
  }

  return Object.freeze({
    id: optionalText(reference.id ?? null, "resultReference.id"),
    type: reference.type,
    schemaVersion,
  });
};

const normalizeTimestamp = (value) => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new TypeError("Preview createdAt must be a date-time string.");
  }

  return value;
};

const normalizeWarnings = (warnings) => {
  if (!Array.isArray(warnings)) {
    throw new TypeError("Preview warnings must be an array.");
  }

  return Object.freeze(
    warnings.map((warning) => requireText(warning, "Preview warning"))
  );
};

export const AIResultPresentationStatus = Object.freeze({
  RAW_ONLY: "raw-only",
  SAFE_STRUCTURED: "safe-structured",
  SANITIZED: "sanitized",
});

export const AI_RESULT_PREVIEW_SCHEMA_VERSION = 1;

export class AIResultPreview {
  constructor({
    schemaVersion = AI_RESULT_PREVIEW_SCHEMA_VERSION,
    reviewId,
    taskId,
    resultReference,
    result,
    createdAt,
    presentationStatus = AIResultPresentationStatus.RAW_ONLY,
    presentationData = null,
    requiresSanitization = false,
    provenance = {},
    warnings = [],
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Result preview schemaVersion must be positive.");
    }

    if (
      !Object.values(AIResultPresentationStatus).includes(presentationStatus)
    ) {
      throw new TypeError(
        `Unsupported result presentation status: ${presentationStatus}`
      );
    }

    if (typeof requiresSanitization !== "boolean") {
      throw new TypeError("requiresSanitization must be a boolean.");
    }

    if (
      !provenance ||
      typeof provenance !== "object" ||
      Array.isArray(provenance)
    ) {
      throw new TypeError("Preview provenance must be an object.");
    }

    const normalizedResult = AIResult.from(result);

    this.schemaVersion = schemaVersion;
    this.reviewId = requireText(reviewId, "Preview reviewId");
    this.taskId = requireText(taskId, "Preview taskId");
    this.resultReference = normalizeResultReference(resultReference);
    this.resultType = normalizedResult.type;
    this.resultSchemaVersion = normalizedResult.schemaVersion;
    this.rawContent = cloneValue(normalizedResult.payload);
    this.resultMetadata = cloneValue(normalizedResult.metadata);
    this.createdAt = normalizeTimestamp(createdAt);
    this.presentationStatus = presentationStatus;
    this.presentationData =
      presentationData === null ? null : cloneValue(presentationData);
    this.requiresSanitization = requiresSanitization;
    this.provenance = cloneValue(provenance);
    this.warnings = normalizeWarnings(warnings);

    if (
      this.resultReference.type !== this.resultType ||
      this.resultReference.schemaVersion !== this.resultSchemaVersion
    ) {
      throw new Error("Preview result does not match its result reference.");
    }

    if (
      this.presentationStatus === AIResultPresentationStatus.RAW_ONLY &&
      this.presentationData !== null
    ) {
      throw new Error("Raw-only previews cannot contain presentation data.");
    }

    if (
      this.presentationStatus !== AIResultPresentationStatus.RAW_ONLY &&
      this.presentationData === null
    ) {
      throw new Error("Prepared presentations require presentation data.");
    }

    if (
      this.requiresSanitization &&
      this.presentationStatus === AIResultPresentationStatus.SAFE_STRUCTURED
    ) {
      throw new Error(
        "Content requiring sanitization cannot be marked safe structured."
      );
    }

    Object.freeze(this);
  }
}
