export class InsightRecommendation {
  constructor(definition) {
    if (!definition?.id || !definition?.description)
      throw new TypeError("InsightRecommendation requires id and description.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.description = definition.description;
    this.priority = definition.priority || "medium";
    this.actionReference = definition.actionReference || null;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
