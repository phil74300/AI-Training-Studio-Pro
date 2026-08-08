export const IMPROVEMENT_SUGGESTION_RESULT_SCHEMA_ID =
  "improvement-suggestion-result";
export const IMPROVEMENT_SUGGESTION_RESULT_SCHEMA_VERSION = 1;

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

export class ImprovementSuggestionResult {
  constructor({
    id,
    createdAt,
    sourceDocument,
    analysisReference,
    provenance,
    suggestions,
  }) {
    if (!Array.isArray(suggestions)) {
      throw new TypeError("Improvement suggestions must be an array.");
    }

    this.schemaId = IMPROVEMENT_SUGGESTION_RESULT_SCHEMA_ID;
    this.schemaVersion = IMPROVEMENT_SUGGESTION_RESULT_SCHEMA_VERSION;
    this.id = String(id);
    this.createdAt = String(createdAt);
    this.sourceDocument = clone(sourceDocument);
    this.analysisReference = clone(analysisReference);
    this.provenance = clone(provenance);
    this.suggestions = clone(suggestions);
    this.reviewRequired = true;

    Object.freeze(this);
  }
}
