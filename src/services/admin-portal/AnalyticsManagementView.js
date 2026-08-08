import { cloneValue } from "./AdminPortalValue";
export class AnalyticsManagementView {
  constructor(d) {
    if (!d?.id) throw new TypeError("AnalyticsManagementView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.kpiReferences = Object.freeze([...(d.kpiReferences || [])]);
    this.reportReferences = Object.freeze([...(d.reportReferences || [])]);
    this.insightProposalReferences = Object.freeze([
      ...(d.insightProposalReferences || []),
    ]);
    this.trendReferences = Object.freeze([...(d.trendReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
