import { AssessmentValidation } from "../assessment-engine/AssessmentValidation";
import { ExpirationStatus } from "./ExpirationStatus";

const validStatuses = new Set(Object.values(ExpirationStatus));

export class CertificationRecord {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.learnerId ||
      !definition?.certificationId ||
      !definition?.learningProgramId ||
      !definition?.completionDate ||
      !definition?.issueDate ||
      !definition?.expirationDate
    )
      throw new TypeError(
        "CertificationRecord requires id, learnerId, certificationId, learningProgramId, completionDate, issueDate, and expirationDate."
      );
    const status = definition.status || ExpirationStatus.ACTIVE;
    if (!validStatuses.has(status))
      throw new TypeError("CertificationRecord requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerId = definition.learnerId;
    this.certificationId = definition.certificationId;
    this.learningProgramId = definition.learningProgramId;
    this.trainingSessionId = definition.trainingSessionId || null;
    this.evaluationResultId = definition.evaluationResultId || null;
    this.completionDate = new Date(definition.completionDate).toISOString();
    this.issueDate = new Date(definition.issueDate).toISOString();
    this.expirationDate = new Date(definition.expirationDate).toISOString();
    this.status = status;
    this.validationReference = definition.validationReference || null;
    this.validationState =
      definition.validationState ||
      AssessmentValidation.PENDING_HUMAN_VALIDATION;
    this.trainerReference = definition.trainerReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.updatedAt = new Date(
      definition.updatedAt || this.createdAt
    ).toISOString();
    Object.freeze(this);
  }

  static isEligibleFromEvaluation(evaluationResult) {
    return (
      Boolean(evaluationResult?.assessmentId) &&
      evaluationResult.validationState === AssessmentValidation.HUMAN_VALIDATED
    );
  }
}
