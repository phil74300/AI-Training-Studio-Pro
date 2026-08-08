export class ExportManifest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.trainingPackageId ||
      !definition?.trainingPackageVersion
    )
      throw new TypeError(
        "ExportManifest requires id, trainingPackageId, and trainingPackageVersion."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainingPackageId = definition.trainingPackageId;
    this.trainingPackageVersion = definition.trainingPackageVersion;
    this.contentReferences = Object.freeze([
      ...(definition.contentReferences || []),
    ]);
    this.mediaReferences = Object.freeze([
      ...(definition.mediaReferences || []),
    ]);
    this.assessmentReferences = Object.freeze([
      ...(definition.assessmentReferences || []),
    ]);
    this.metadata = Object.freeze({ ...(definition.metadata || {}) });
    this.compatibility = Object.freeze({ ...(definition.compatibility || {}) });
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
