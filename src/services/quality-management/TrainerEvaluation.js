import { QualityReviewStatus } from "./QualityReviewStatus";

const reviewStatuses = new Set(Object.values(QualityReviewStatus));

export class TrainerEvaluation {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.trainerId ||
      !definition?.trainingProgramId ||
      !definition?.trainingSessionId ||
      !definition?.evaluatedAt
    )
      throw new TypeError(
        "TrainerEvaluation requires id, trainerId, trainingProgramId, trainingSessionId, and evaluatedAt."
      );
    const validationState =
      definition.validationState ||
      QualityReviewStatus.PENDING_HUMAN_VALIDATION;
    if (!reviewStatuses.has(validationState))
      throw new TypeError(
        "TrainerEvaluation requires a supported validationState."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainerId = definition.trainerId;
    this.trainingProgramId = definition.trainingProgramId;
    this.trainingSessionId = definition.trainingSessionId;
    this.surveyResponseIds = Object.freeze([
      ...(definition.surveyResponseIds || []),
    ]);
    this.scores = Object.freeze({ ...(definition.scores || {}) });
    this.comments = Object.freeze([...(definition.comments || [])]);
    this.validationState = validationState;
    this.evaluatedAt = new Date(definition.evaluatedAt).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
