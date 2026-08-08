import { cloneValue } from "./QualityPortalValue";
export class QualityPortalExperience {
  constructor(d) {
    if (
      !d?.id ||
      !d?.qualityManagerReference ||
      !d?.organizationReference ||
      !d?.dashboardReference
    )
      throw new TypeError(
        "QualityPortalExperience requires id, qualityManagerReference, organizationReference, and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.qualityManagerReference = d.qualityManagerReference;
    this.organizationReference = d.organizationReference;
    this.dashboardReference = d.dashboardReference;
    this.qualityIndicatorReferences = Object.freeze([
      ...(d.qualityIndicatorReferences || []),
    ]);
    this.auditReferences = Object.freeze([...(d.auditReferences || [])]);
    this.personalizationReference = d.personalizationReference || null;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
