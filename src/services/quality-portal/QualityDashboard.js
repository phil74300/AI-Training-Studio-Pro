import { cloneValue } from "./QualityPortalValue";
export class QualityDashboard {
  constructor(d) {
    if (!d?.id || !d?.organizationReference)
      throw new TypeError(
        "QualityDashboard requires id and organizationReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.satisfactionIndicatorReferences = Object.freeze([
      ...(d.satisfactionIndicatorReferences || []),
    ]);
    this.trainingQualityIndicatorReferences = Object.freeze([
      ...(d.trainingQualityIndicatorReferences || []),
    ]);
    this.trainerIndicatorReferences = Object.freeze([
      ...(d.trainerIndicatorReferences || []),
    ]);
    this.learnerFeedbackReferences = Object.freeze([
      ...(d.learnerFeedbackReferences || []),
    ]);
    this.improvementStatusReference = d.improvementStatusReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
