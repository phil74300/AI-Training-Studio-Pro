import { cloneValue } from "./TrainerPortalValue";
export class TrainerDashboard {
  constructor(d) {
    if (!d?.id || !d?.trainerReference)
      throw new TypeError("TrainerDashboard requires id and trainerReference.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.trainerReference = d.trainerReference;
    this.activeTrainingReferences = Object.freeze([
      ...(d.activeTrainingReferences || []),
    ]);
    this.upcomingSessionReferences = Object.freeze([
      ...(d.upcomingSessionReferences || []),
    ]);
    this.learnerStatusReferences = Object.freeze([
      ...(d.learnerStatusReferences || []),
    ]);
    this.pendingEvaluationReferences = Object.freeze([
      ...(d.pendingEvaluationReferences || []),
    ]);
    this.qualityIndicatorReferences = Object.freeze([
      ...(d.qualityIndicatorReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
