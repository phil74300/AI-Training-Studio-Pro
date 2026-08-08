import { MediaType } from "./MediaType";

const mediaTypes = new Set(Object.values(MediaType));

export class MediaGenerationRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.sourceDocumentId ||
      !definition?.requestedMediaType ||
      !definition?.description
    )
      throw new TypeError(
        "MediaGenerationRequest requires id, sourceDocumentId, requestedMediaType, and description."
      );
    if (!mediaTypes.has(definition.requestedMediaType))
      throw new TypeError(
        "MediaGenerationRequest requires a supported requestedMediaType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.sourceDocumentId = definition.sourceDocumentId;
    this.requestedMediaType = definition.requestedMediaType;
    this.description = definition.description;
    this.providerCapabilityId = definition.providerCapabilityId || null;
    this.contextReferences = Object.freeze([
      ...(definition.contextReferences || []),
    ]);
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
