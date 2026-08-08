export const PEDAGOGICAL_ANALYSIS_RESULT_SCHEMA_ID =
  "pedagogical-analysis-result";
export const PEDAGOGICAL_ANALYSIS_RESULT_SCHEMA_VERSION = 1;

const clone = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(clone));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, clone(item)])
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

export class PedagogicalAnalysisResult {
  constructor({
    id,
    createdAt,
    sourceDocument,
    provenance,
    analysis,
    reviewRequired = true,
  }) {
    if (reviewRequired !== true) {
      throw new TypeError("Pedagogical analysis must require human review.");
    }

    this.schemaId = PEDAGOGICAL_ANALYSIS_RESULT_SCHEMA_ID;
    this.schemaVersion = PEDAGOGICAL_ANALYSIS_RESULT_SCHEMA_VERSION;
    this.id = requireText(id, "Pedagogical analysis id");
    this.createdAt = requireText(createdAt, "Pedagogical analysis createdAt");
    this.sourceDocument = clone(sourceDocument);
    this.provenance = clone(provenance);
    this.analysis = clone(analysis);
    this.reviewRequired = true;

    Object.freeze(this);
  }
}
