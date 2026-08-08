import { ProgressStatus } from "./ProgressStatus";
export class LearningRecord {
  constructor(value) {
    if (!value?.learnerId || !value?.programId)
      throw new TypeError("LearningRecord requires learnerId and programId.");
    this.schemaVersion = 1;
    this.learnerId = value.learnerId;
    this.programId = value.programId;
    this.status = value.status || ProgressStatus.NOT_STARTED;
    this.completedModuleIds = Object.freeze([
      ...(value.completedModuleIds || []),
    ]);
    this.completedAssessmentIds = Object.freeze([
      ...(value.completedAssessmentIds || []),
    ]);
    this.scores = Object.freeze({ ...(value.scores || {}) });
    this.certificationReferences = Object.freeze([
      ...(value.certificationReferences || []),
    ]);
    this.provenance = Object.freeze({ ...(value.provenance || {}) });
    this.updatedAt = new Date(value.updatedAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
