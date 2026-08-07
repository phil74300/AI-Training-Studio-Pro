import { AIContextItem } from "./AIContextItem";
import { AIContextManifest } from "./AIContextManifest";

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

const normalizeTokenEstimate = (tokenEstimate) => {
  const normalized = requireRecord(tokenEstimate, "tokenEstimate");
  const { estimatedTokens, includesUnknownEstimates, totalBudget } = normalized;

  if (!Number.isInteger(estimatedTokens) || estimatedTokens < 0) {
    throw new TypeError("tokenEstimate.estimatedTokens must be non-negative.");
  }

  if (typeof includesUnknownEstimates !== "boolean") {
    throw new TypeError(
      "tokenEstimate.includesUnknownEstimates must be a boolean."
    );
  }

  if (
    totalBudget !== null &&
    (!Number.isInteger(totalBudget) || totalBudget <= 0)
  ) {
    throw new TypeError("tokenEstimate.totalBudget must be positive or null.");
  }

  return Object.freeze({
    estimatedTokens,
    includesUnknownEstimates,
    totalBudget,
  });
};

export const AI_CONTEXT_SNAPSHOT_SCHEMA_VERSION = 1;

export class AIContextSnapshot {
  constructor({
    schemaVersion = AI_CONTEXT_SNAPSHOT_SCHEMA_VERSION,
    id,
    createdAt,
    projectId = null,
    chapterId = null,
    items = [],
    tokenEstimate,
    sourceMetadata,
    versionInformation,
    manifest,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Context snapshot schemaVersion must be positive.");
    }

    const normalizedCreatedAt = requireText(createdAt, "createdAt");

    if (Number.isNaN(Date.parse(normalizedCreatedAt))) {
      throw new TypeError("createdAt must be a valid date-time string.");
    }

    if (!Array.isArray(items)) {
      throw new TypeError("Context snapshot items must be an array.");
    }

    if (!(manifest instanceof AIContextManifest)) {
      throw new TypeError("Context snapshot requires an AIContextManifest.");
    }

    this.schemaVersion = schemaVersion;
    this.id = requireText(id, "Context snapshot id");
    this.createdAt = normalizedCreatedAt;
    this.projectId = optionalText(projectId, "projectId");
    this.chapterId = optionalText(chapterId, "chapterId");
    this.items = Object.freeze(items.map((item) => AIContextItem.from(item)));
    this.tokenEstimate = normalizeTokenEstimate(tokenEstimate);
    this.sourceMetadata = requireRecord(sourceMetadata, "sourceMetadata");
    this.versionInformation = requireRecord(
      versionInformation,
      "versionInformation"
    );
    this.manifest = manifest;

    if (this.manifest.snapshotId !== this.id) {
      throw new Error("Context snapshot and manifest identifiers must match.");
    }

    const manifestIds = this.manifest.ordering;

    if (
      this.items.length !== manifestIds.length ||
      this.items.some((item, index) => item.id !== manifestIds[index])
    ) {
      throw new Error(
        "Context snapshot items must match the manifest included item order."
      );
    }

    Object.freeze(this);
  }
}
