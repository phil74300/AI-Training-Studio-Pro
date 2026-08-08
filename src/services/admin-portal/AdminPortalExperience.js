import { cloneValue } from "./AdminPortalValue";
export class AdminPortalExperience {
  constructor(d) {
    if (
      !d?.id ||
      !d?.organizationReference ||
      !d?.administratorReference ||
      !d?.dashboardReference
    )
      throw new TypeError(
        "AdminPortalExperience requires id, organizationReference, administratorReference, and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.administratorReference = d.administratorReference;
    this.dashboardReference = d.dashboardReference;
    this.managementReferences = Object.freeze([
      ...(d.managementReferences || []),
    ]);
    this.qualityReferences = Object.freeze([...(d.qualityReferences || [])]);
    this.personalizationReference = d.personalizationReference || null;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
