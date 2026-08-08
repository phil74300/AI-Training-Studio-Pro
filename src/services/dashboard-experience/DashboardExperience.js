import { cloneValue } from "./DashboardExperienceValue";
export class DashboardExperience {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.identity ||
      !definition?.portalReference ||
      !definition?.userRoleReference ||
      !definition?.layoutReference
    )
      throw new TypeError(
        "DashboardExperience requires id, identity, portalReference, userRoleReference, and layoutReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identity = definition.identity;
    this.portalReference = definition.portalReference;
    this.userRoleReference = definition.userRoleReference;
    this.layoutReference = definition.layoutReference;
    this.widgetReferences = Object.freeze([
      ...(definition.widgetReferences || []),
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
