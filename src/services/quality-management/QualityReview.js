import { QualityFinding } from "./QualityFinding";
import { QualityReviewStatus } from "./QualityReviewStatus";

const reviewStatuses = new Set(Object.values(QualityReviewStatus));

export class QualityReview {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.trainingProgramId ||
      !definition?.createdAt
    )
      throw new TypeError(
        "QualityReview requires id, trainingProgramId, and createdAt."
      );
    const validationState =
      definition.validationState ||
      QualityReviewStatus.PENDING_HUMAN_VALIDATION;
    if (!reviewStatuses.has(validationState))
      throw new TypeError(
        "QualityReview requires a supported validationState."
      );
    if (
      definition.analysisProposal?.confidence !== undefined &&
      (typeof definition.analysisProposal.confidence !== "number" ||
        definition.analysisProposal.confidence < 0 ||
        definition.analysisProposal.confidence > 1)
    )
      throw new TypeError(
        "QualityReview analysis proposal confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainingProgramId = definition.trainingProgramId;
    this.trainingSessionId = definition.trainingSessionId || null;
    this.trainingVersion = definition.trainingVersion || null;
    this.surveyResponseIds = Object.freeze([
      ...(definition.surveyResponseIds || []),
    ]);
    this.trainerEvaluationIds = Object.freeze([
      ...(definition.trainerEvaluationIds || []),
    ]);
    this.qualityIndicatorIds = Object.freeze([
      ...(definition.qualityIndicatorIds || []),
    ]);
    this.findings = Object.freeze(
      (definition.findings || []).map((finding) =>
        finding instanceof QualityFinding
          ? finding
          : new QualityFinding(finding)
      )
    );
    this.analysisProposal = Object.freeze({
      sentiment: definition.analysisProposal?.sentiment || null,
      recurringThemes: Object.freeze([
        ...(definition.analysisProposal?.recurringThemes || []),
      ]),
      strengths: Object.freeze([
        ...(definition.analysisProposal?.strengths || []),
      ]),
      weaknesses: Object.freeze([
        ...(definition.analysisProposal?.weaknesses || []),
      ]),
      improvementSuggestions: Object.freeze([
        ...(definition.analysisProposal?.improvementSuggestions || []),
      ]),
      confidence: definition.analysisProposal?.confidence ?? null,
    });
    this.validationState = validationState;
    this.validatorReference = definition.validatorReference || null;
    this.createdAt = new Date(definition.createdAt).toISOString();
    this.validatedAt = definition.validatedAt
      ? new Date(definition.validatedAt).toISOString()
      : null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
