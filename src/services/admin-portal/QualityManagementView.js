import { cloneValue } from "./AdminPortalValue";
export class QualityManagementView {
  constructor(d) {
    if (!d?.id) throw new TypeError("QualityManagementView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.surveyReferences = Object.freeze([...(d.surveyReferences || [])]);
    this.indicatorReferences = Object.freeze([
      ...(d.indicatorReferences || []),
    ]);
    this.improvementActionReferences = Object.freeze([
      ...(d.improvementActionReferences || []),
    ]);
    this.auditEvidenceReferences = Object.freeze([
      ...(d.auditEvidenceReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
