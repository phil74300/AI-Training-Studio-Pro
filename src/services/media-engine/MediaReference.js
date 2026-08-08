export class MediaReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.mediaAssetId ||
      !definition?.usageContext
    )
      throw new TypeError(
        "MediaReference requires id, mediaAssetId, and usageContext."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.mediaAssetId = definition.mediaAssetId;
    this.usageContext = definition.usageContext;
    this.sourceDocumentId = definition.sourceDocumentId || null;
    this.trainingPackageId = definition.trainingPackageId || null;
    this.learningProgramId = definition.learningProgramId || null;
    this.locationReference = definition.locationReference || null;
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
