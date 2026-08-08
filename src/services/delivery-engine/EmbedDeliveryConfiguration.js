export class EmbedDeliveryConfiguration {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.externalUrlReference ||
      !definition?.allowedDomainReference ||
      !definition?.sandboxPolicyReference ||
      !definition?.version
    )
      throw new TypeError(
        "EmbedDeliveryConfiguration requires id, externalUrlReference, allowedDomainReference, sandboxPolicyReference, and version."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.externalUrlReference = definition.externalUrlReference;
    this.allowedDomainReference = definition.allowedDomainReference;
    this.sandboxPolicyReference = definition.sandboxPolicyReference;
    this.ownershipReference = definition.ownershipReference || null;
    this.version = definition.version;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
