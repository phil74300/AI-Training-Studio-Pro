const freeze = (value) => Object.freeze(value);
export class TrainingPackageAsset {
  constructor(definition) {
    if (!definition?.id || !definition.type)
      throw new TypeError("TrainingPackageAsset requires an id and type.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.type = definition.type;
    this.title = definition.title || null;
    this.artifactId = definition.artifactId || null;
    this.mimeType = definition.mimeType || null;
    this.provenance = freeze({ ...(definition.provenance || {}) });
    freeze(this);
  }
}
