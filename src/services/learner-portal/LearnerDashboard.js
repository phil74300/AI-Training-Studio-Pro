import { cloneValue } from "./LearnerPortalValue";
export class LearnerDashboard {
  constructor(definition) {
    if (!definition?.id || !definition?.learnerReference)
      throw new TypeError("LearnerDashboard requires id and learnerReference.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerReference = definition.learnerReference;
    this.progressSummaryReference = definition.progressSummaryReference || null;
    this.activeLearningPathReferences = Object.freeze([
      ...(definition.activeLearningPathReferences || []),
    ]);
    this.upcomingActivityReferences = Object.freeze([
      ...(definition.upcomingActivityReferences || []),
    ]);
    this.certificationStatusReference =
      definition.certificationStatusReference || null;
    this.recommendationReferences = Object.freeze([
      ...(definition.recommendationReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
