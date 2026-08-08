import { AssessmentValidation } from "./AssessmentValidation";
export class EvaluationResult {
  constructor(value) {
    this.schemaVersion = 1;
    this.assessmentId = value.assessmentId;
    this.assessmentVersion = value.assessmentVersion;
    this.learnerId = value.learnerId;
    this.results = Object.freeze([...(value.results || [])]);
    this.validationState =
      value.validationState || AssessmentValidation.PENDING_HUMAN_VALIDATION;
    this.createdAt = new Date(value.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
