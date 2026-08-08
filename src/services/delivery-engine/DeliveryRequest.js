export class DeliveryRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.deliveryDefinitionId ||
      !definition?.trainingPackageId ||
      !definition?.createdAt
    )
      throw new TypeError(
        "DeliveryRequest requires id, deliveryDefinitionId, trainingPackageId, and createdAt."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.deliveryDefinitionId = definition.deliveryDefinitionId;
    this.trainingPackageId = definition.trainingPackageId;
    this.exportManifestId = definition.exportManifestId || null;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.createdAt = new Date(definition.createdAt).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
