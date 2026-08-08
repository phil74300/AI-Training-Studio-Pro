import { cloneValue } from "./QualityPortalValue";
export class QualityAnalyticsView {
  constructor(d) {
    if (!d?.id) throw new TypeError("QualityAnalyticsView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.kpiReferences = Object.freeze([...(d.kpiReferences || [])]);
    this.trendReferences = Object.freeze([...(d.trendReferences || [])]);
    this.satisfactionAnalysisReferences = Object.freeze([
      ...(d.satisfactionAnalysisReferences || []),
    ]);
    this.improvementIndicatorReferences = Object.freeze([
      ...(d.improvementIndicatorReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
