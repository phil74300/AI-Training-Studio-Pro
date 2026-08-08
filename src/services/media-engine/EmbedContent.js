export class EmbedContent {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.externalContentReference ||
      !definition?.version
    )
      throw new TypeError(
        "EmbedContent requires id, externalContentReference, and version."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.externalContentReference = definition.externalContentReference;
    this.version = definition.version;
    this.providerReference = definition.providerReference || null;
    this.ownershipReference = definition.ownershipReference || null;
    this.permissionsReference = definition.permissionsReference || null;
    this.embedMetadata = Object.freeze({ ...(definition.embedMetadata || {}) });
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
