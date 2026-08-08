import { cloneValue } from "./TrainerPortalValue";
export class LearnerMonitoringView {
  constructor(d) {
    if (!d?.id || !d?.learnerReference || !d?.progressReference)
      throw new TypeError(
        "LearnerMonitoringView requires id, learnerReference, and progressReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.learnerReference = d.learnerReference;
    this.progressReference = d.progressReference;
    this.competencyReference = d.competencyReference || null;
    this.assessmentReference = d.assessmentReference || null;
    this.supportNeedsReference = d.supportNeedsReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
