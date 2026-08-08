import { cloneValue } from "./LearnerPortalValue";
export class LearnerPortalExperience {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.learnerReference ||
      !definition?.organizationReference ||
      !definition?.dashboardReference
    )
      throw new TypeError(
        "LearnerPortalExperience requires id, learnerReference, organizationReference, and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerReference = definition.learnerReference;
    this.organizationReference = definition.organizationReference;
    this.dashboardReference = definition.dashboardReference;
    this.learningPathReferences = Object.freeze([
      ...(definition.learningPathReferences || []),
    ]);
    this.certificationReferences = Object.freeze([
      ...(definition.certificationReferences || []),
    ]);
    this.personalizationReference = definition.personalizationReference || null;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
