import { cloneValue } from "./ClientPortalValue";
export class ClientDashboard {
  constructor(d) {
    if (!d?.id || !d?.organizationReference)
      throw new TypeError(
        "ClientDashboard requires id and organizationReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.employeeSummaryReference = d.employeeSummaryReference || null;
    this.trainingStatusReference = d.trainingStatusReference || null;
    this.certificationStatusReference = d.certificationStatusReference || null;
    this.complianceIndicatorReferences = Object.freeze([
      ...(d.complianceIndicatorReferences || []),
    ]);
    this.upcomingExpirationReferences = Object.freeze([
      ...(d.upcomingExpirationReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
