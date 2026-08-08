import { cloneValue } from "./ClientPortalValue";
export class ClientPortalExperience {
  constructor(d) {
    if (
      !d?.id ||
      !d?.organizationReference ||
      !d?.clientAdministratorReference ||
      !d?.dashboardReference
    )
      throw new TypeError(
        "ClientPortalExperience requires id, organizationReference, clientAdministratorReference, and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.clientAdministratorReference = d.clientAdministratorReference;
    this.employeeReferences = Object.freeze([...(d.employeeReferences || [])]);
    this.dashboardReference = d.dashboardReference;
    this.complianceReferences = Object.freeze([
      ...(d.complianceReferences || []),
    ]);
    this.personalizationReference = d.personalizationReference || null;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
