import { AnalyticsPeriod } from "./AnalyticsPeriod";

export class AnalyticsReport {
  constructor(definition) {
    if (!definition?.id || !definition?.audience || !definition?.createdAt)
      throw new TypeError(
        "AnalyticsReport requires id, audience, and createdAt."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.audience = definition.audience;
    this.period =
      definition.period instanceof AnalyticsPeriod
        ? definition.period
        : new AnalyticsPeriod(definition.period);
    this.indicatorReferences = Object.freeze([
      ...(definition.indicatorReferences || []),
    ]);
    this.insightReferences = Object.freeze([
      ...(definition.insightReferences || []),
    ]);
    this.anonymized = definition.anonymized !== false;
    this.createdAt = new Date(definition.createdAt).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
