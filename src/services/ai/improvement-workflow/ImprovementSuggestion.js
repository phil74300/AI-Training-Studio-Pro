import { ImprovementCategory } from "./ImprovementCategory";
import { ImprovementImpact } from "./ImprovementImpact";
import { ImprovementPriority } from "./ImprovementPriority";

const clone = (value) =>
  Object.freeze(
    Array.isArray(value)
      ? value.map(clone)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, clone(item)])
          )
        : value
  );

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

export class ImprovementSuggestion {
  constructor({
    id,
    category,
    priority,
    impact,
    title,
    rationale,
    sourceReferences = [],
    confidence = 1,
  }) {
    if (!Object.values(ImprovementCategory).includes(category)) {
      throw new TypeError("Improvement suggestion category is invalid.");
    }

    if (!Object.values(ImprovementPriority).includes(priority)) {
      throw new TypeError("Improvement suggestion priority is invalid.");
    }

    if (!Object.values(ImprovementImpact).includes(impact)) {
      throw new TypeError("Improvement suggestion impact is invalid.");
    }

    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new TypeError(
        "Improvement suggestion confidence must be between 0 and 1."
      );
    }

    if (!Array.isArray(sourceReferences)) {
      throw new TypeError(
        "Improvement suggestion sourceReferences must be an array."
      );
    }

    this.id = requireText(id, "Improvement suggestion id");
    this.category = category;
    this.priority = priority;
    this.impact = impact;
    this.title = requireText(title, "Improvement suggestion title");
    this.rationale = requireText(rationale, "Improvement suggestion rationale");
    this.sourceReferences = clone(sourceReferences);
    this.confidence = confidence;
    this.reviewRequired = true;

    Object.freeze(this);
  }
}
