import { QualityReviewStatus } from "./QualityReviewStatus";

const reviewStatuses = new Set(Object.values(QualityReviewStatus));

export class QualityEvidence {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.description ||
      !definition?.sourceReference
    )
      throw new TypeError(
        "QualityEvidence requires id, description, and sourceReference."
      );
    const validationState =
      definition.validationState ||
      QualityReviewStatus.PENDING_HUMAN_VALIDATION;
    if (!reviewStatuses.has(validationState))
      throw new TypeError(
        "QualityEvidence requires a supported validationState."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.description = definition.description;
    this.sourceReference = definition.sourceReference;
    this.trainingVersion = definition.trainingVersion || null;
    this.validationState = validationState;
    this.recordedAt = new Date(
      definition.recordedAt || Date.now()
    ).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
