import { cloneValue } from "./QualityPortalValue";
export class AuditEvidenceView {
  constructor(d) {
    if (!d?.id) throw new TypeError("AuditEvidenceView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.evidenceReferences = Object.freeze([...(d.evidenceReferences || [])]);
    this.documentReferences = Object.freeze([...(d.documentReferences || [])]);
    this.versionReferences = Object.freeze([...(d.versionReferences || [])]);
    this.auditReferences = Object.freeze([...(d.auditReferences || [])]);
    this.traceabilityReferences = Object.freeze([
      ...(d.traceabilityReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
