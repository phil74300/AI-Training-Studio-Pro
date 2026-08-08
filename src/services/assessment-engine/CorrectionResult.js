import { AssessmentValidation } from "./AssessmentValidation";
export class CorrectionResult {
  constructor(value) {
    this.schemaVersion = 1;
    this.questionId = value.questionId;
    this.method = value.method;
    this.score = value.score ?? null;
    this.comments = value.comments || null;
    this.confidence = value.confidence ?? null;
    this.evaluatorId = value.evaluatorId || null;
    this.validationState =
      value.validationState || AssessmentValidation.PENDING_HUMAN_VALIDATION;
    this.correctedAt = new Date(value.correctedAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
