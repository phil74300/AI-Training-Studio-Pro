import { cloneValue } from "./ClientPortalValue";
export class ComplianceView {
  constructor(d) {
    if (!d?.id) throw new TypeError("ComplianceView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.requirementReferences = Object.freeze([
      ...(d.requirementReferences || []),
    ]);
    this.complianceIndicatorReferences = Object.freeze([
      ...(d.complianceIndicatorReferences || []),
    ]);
    this.gapReferences = Object.freeze([...(d.gapReferences || [])]);
    this.improvementReferences = Object.freeze([
      ...(d.improvementReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
