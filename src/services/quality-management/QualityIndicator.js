export class QualityIndicator {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      definition?.value === undefined
    )
      throw new TypeError("QualityIndicator requires id, title, and value.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.value = definition.value;
    this.unit = definition.unit || null;
    this.targetValue = definition.targetValue ?? null;
    this.trainingProgramId = definition.trainingProgramId || null;
    this.trainingSessionId = definition.trainingSessionId || null;
    this.measurementPeriod = Object.freeze({
      ...(definition.measurementPeriod || {}),
    });
    this.sourceReferences = Object.freeze([
      ...(definition.sourceReferences || []),
    ]);
    this.calculatedAt = new Date(
      definition.calculatedAt || Date.now()
    ).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
