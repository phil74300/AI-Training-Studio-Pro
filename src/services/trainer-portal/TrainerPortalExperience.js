import { cloneValue } from "./TrainerPortalValue";
export class TrainerPortalExperience {
  constructor(d) {
    if (
      !d?.id ||
      !d?.trainerReference ||
      !d?.organizationReference ||
      !d?.dashboardReference
    )
      throw new TypeError(
        "TrainerPortalExperience requires id, trainerReference, organizationReference, and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.trainerReference = d.trainerReference;
    this.organizationReference = d.organizationReference;
    this.assignedProgramReferences = Object.freeze([
      ...(d.assignedProgramReferences || []),
    ]);
    this.dashboardReference = d.dashboardReference;
    this.qualityReference = d.qualityReference || null;
    this.personalizationReference = d.personalizationReference || null;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
