export class AnalyticsDimension {
  constructor(definition) {
    if (!definition?.id || !definition?.type || !definition?.reference)
      throw new TypeError(
        "AnalyticsDimension requires id, type, and an anonymized reference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.type = definition.type;
    this.reference = definition.reference;
    this.label = definition.label || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
