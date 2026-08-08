export class AuthorReference {
  constructor(definition) {
    if (!definition?.id || !definition?.externalReference)
      throw new TypeError("AuthorReference requires id and externalReference.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.externalReference = definition.externalReference;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
