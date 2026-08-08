export class AnalyticsMetric {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.name ||
      !definition?.calculationReference
    )
      throw new TypeError(
        "AnalyticsMetric requires id, name, and calculationReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.name = definition.name;
    this.description = definition.description || null;
    this.unit = definition.unit || null;
    this.calculationReference = definition.calculationReference;
    this.eventTypeReferences = Object.freeze([
      ...(definition.eventTypeReferences || []),
    ]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
