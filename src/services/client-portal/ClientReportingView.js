import { cloneValue } from "./ClientPortalValue";
export class ClientReportingView {
  constructor(d) {
    if (!d?.id) throw new TypeError("ClientReportingView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.kpiReferences = Object.freeze([...(d.kpiReferences || [])]);
    this.reportReferences = Object.freeze([...(d.reportReferences || [])]);
    this.exportReferences = Object.freeze([...(d.exportReferences || [])]);
    this.summaryReferences = Object.freeze([...(d.summaryReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
