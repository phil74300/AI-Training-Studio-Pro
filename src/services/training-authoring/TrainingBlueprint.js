export class TrainingBlueprint {
  constructor(definition) {
    if (!definition?.id || !definition?.title)
      throw new TypeError("TrainingBlueprint requires id and title.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.targetAudienceReferences = Object.freeze([
      ...(definition.targetAudienceReferences || []),
    ]);
    this.prerequisites = Object.freeze([...(definition.prerequisites || [])]);
    this.estimatedDuration = definition.estimatedDuration || null;
    this.competencyGoals = Object.freeze([
      ...(definition.competencyGoals || []),
    ]);
    this.version = definition.version || "1.0";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
