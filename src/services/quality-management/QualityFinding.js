import { FeedbackCategory } from "./FeedbackCategory";
import { QualityReviewStatus } from "./QualityReviewStatus";

const categories = new Set(Object.values(FeedbackCategory));
const reviewStatuses = new Set(Object.values(QualityReviewStatus));

export class QualityFinding {
  constructor(definition) {
    if (!definition?.id || !definition?.description || !definition?.category)
      throw new TypeError(
        "QualityFinding requires id, description, and category."
      );
    if (!categories.has(definition.category))
      throw new TypeError("QualityFinding requires a supported category.");
    const validationState =
      definition.validationState ||
      QualityReviewStatus.PENDING_HUMAN_VALIDATION;
    if (!reviewStatuses.has(validationState))
      throw new TypeError(
        "QualityFinding requires a supported validationState."
      );
    if (
      definition.confidence !== undefined &&
      (typeof definition.confidence !== "number" ||
        definition.confidence < 0 ||
        definition.confidence > 1)
    )
      throw new TypeError("QualityFinding confidence must be between 0 and 1.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.description = definition.description;
    this.category = definition.category;
    this.priority = definition.priority || "medium";
    this.qualityIndicatorId = definition.qualityIndicatorId || null;
    this.qualityReviewId = definition.qualityReviewId || null;
    this.sourceReferences = Object.freeze([
      ...(definition.sourceReferences || []),
    ]);
    this.strengths = Object.freeze([...(definition.strengths || [])]);
    this.weaknesses = Object.freeze([...(definition.weaknesses || [])]);
    this.improvementSuggestions = Object.freeze([
      ...(definition.improvementSuggestions || []),
    ]);
    this.confidence = definition.confidence ?? null;
    this.analysisOrigin = definition.analysisOrigin || "human";
    this.validationState = validationState;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
