import { cloneValue } from "./AdminPortalValue";
export class AdminDashboard {
  constructor(d) {
    if (!d?.id || !d?.organizationReference)
      throw new TypeError(
        "AdminDashboard requires id and organizationReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.globalActivityReference = d.globalActivityReference || null;
    this.trainingIndicatorReferences = Object.freeze([
      ...(d.trainingIndicatorReferences || []),
    ]);
    this.learnerIndicatorReferences = Object.freeze([
      ...(d.learnerIndicatorReferences || []),
    ]);
    this.certificationIndicatorReferences = Object.freeze([
      ...(d.certificationIndicatorReferences || []),
    ]);
    this.qualityIndicatorReferences = Object.freeze([
      ...(d.qualityIndicatorReferences || []),
    ]);
    this.alertReferences = Object.freeze([...(d.alertReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
