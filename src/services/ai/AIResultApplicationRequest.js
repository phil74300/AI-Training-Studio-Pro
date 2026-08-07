import { AIResultType } from "./AIResult";

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
    throw new TypeError("Application resultReference must be an object.");
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

const normalizeTargetContext = (reference) => {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) {
    throw new TypeError("targetContextReference must be an object.");
  }

  return Object.freeze({
    id: requireText(reference.id, "targetContextReference.id"),
    version: requireText(reference.version, "targetContextReference.version"),
  });
};

const normalizeSelectedPortions = (portions) => {
  if (!Array.isArray(portions)) {
    throw new TypeError("selectedPortions must be an array.");
  }

  return Object.freeze(
    portions.map((portion) => {
      if (!portion || typeof portion !== "object" || Array.isArray(portion)) {
        throw new TypeError("Selected portions must be objects.");
      }

      return cloneValue(portion);
    })
  );
};

export const AIResultApplicationStrategy = Object.freeze({
  INSERT: "insert",
  REPLACE: "replace",
  APPEND: "append",
  CREATE_ARTIFACT: "create-artifact",
});

export const AI_RESULT_APPLICATION_REQUEST_SCHEMA_VERSION = 1;

export class AIResultApplicationRequest {
  constructor({
    schemaVersion = AI_RESULT_APPLICATION_REQUEST_SCHEMA_VERSION,
    reviewId,
    taskId,
    resultReference,
    targetProjectId,
    targetChapterId = null,
    targetContextReference,
    applicationStrategy,
    selectedPortions = [],
    expectedSourceVersion = null,
    createdAt,
    correlationId,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError(
        "Result application request schemaVersion must be positive."
      );
    }

    if (
      !Object.values(AIResultApplicationStrategy).includes(applicationStrategy)
    ) {
      throw new TypeError(
        `Unsupported result application strategy: ${applicationStrategy}`
      );
    }

    if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) {
      throw new TypeError(
        "Application request createdAt must be a date-time string."
      );
    }

    this.schemaVersion = schemaVersion;
    this.reviewId = requireText(reviewId, "Application request reviewId");
    this.taskId = requireText(taskId, "Application request taskId");
    this.resultReference = normalizeResultReference(resultReference);
    this.targetProjectId = requireText(targetProjectId, "targetProjectId");
    this.targetChapterId = optionalText(targetChapterId, "targetChapterId");
    this.targetContextReference = normalizeTargetContext(
      targetContextReference
    );
    this.applicationStrategy = applicationStrategy;
    this.selectedPortions = normalizeSelectedPortions(selectedPortions);
    this.expectedSourceVersion = optionalText(
      expectedSourceVersion,
      "expectedSourceVersion"
    );
    this.createdAt = createdAt;
    this.correlationId = requireText(correlationId, "correlationId");

    Object.freeze(this);
  }
}
