import { AnalyticsPeriod } from "./AnalyticsPeriod";

export class AnalyticsAggregation {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.analyticsMetricId ||
      definition?.value === undefined
    )
      throw new TypeError(
        "AnalyticsAggregation requires id, analyticsMetricId, and value."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.analyticsMetricId = definition.analyticsMetricId;
    this.value = definition.value;
    this.unit = definition.unit || null;
    this.aggregationMethod = definition.aggregationMethod || "unspecified";
    this.period =
      definition.period instanceof AnalyticsPeriod
        ? definition.period
        : new AnalyticsPeriod(definition.period);
    this.dimensionReferences = Object.freeze([
      ...(definition.dimensionReferences || []),
    ]);
    this.sourceEventReferences = Object.freeze([
      ...(definition.sourceEventReferences || []),
    ]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
