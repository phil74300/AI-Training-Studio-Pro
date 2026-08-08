const freeze = (value) => Object.freeze(value);
export class TrainingPackageManifest {
  constructor(definition) {
    if (!definition?.sourceDocumentId)
      throw new TypeError("TrainingPackageManifest requires sourceDocumentId.");
    this.schemaVersion = 1;
    this.sourceDocumentId = definition.sourceDocumentId;
    this.moduleIds = freeze([...(definition.moduleIds || [])]);
    this.learningObjectiveIds = freeze([
      ...(definition.learningObjectiveIds || []),
    ]);
    this.assessmentIds = freeze([...(definition.assessmentIds || [])]);
    this.assetIds = freeze([...(definition.assetIds || [])]);
    this.sourceProvenance = freeze({ ...(definition.sourceProvenance || {}) });
    this.capabilities = freeze([...(definition.capabilities || [])]);
    freeze(this);
  }
}
