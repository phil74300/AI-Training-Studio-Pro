const freeze = (value) => Object.freeze(value);
export class TrainingPackageMetadata {
  constructor(definition) {
    if (
      !definition?.title ||
      !definition?.language ||
      !definition?.createdAt ||
      !definition?.version
    )
      throw new TypeError(
        "TrainingPackageMetadata requires title, language, version, and createdAt."
      );
    this.schemaVersion = 1;
    this.title = definition.title;
    this.description = definition.description || null;
    this.language = definition.language;
    this.author = definition.author || null;
    this.version = definition.version;
    this.createdAt = new Date(definition.createdAt).toISOString();
    this.provenance = freeze({ ...(definition.provenance || {}) });
    freeze(this);
  }
}
