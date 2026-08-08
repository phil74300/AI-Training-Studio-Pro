import { MediaMetadata } from "./MediaMetadata";
import { MediaType } from "./MediaType";

const mediaTypes = new Set(Object.values(MediaType));

export class MediaAsset {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !definition?.type ||
      !definition?.version ||
      !definition?.sourceReference
    )
      throw new TypeError(
        "MediaAsset requires id, title, type, version, and sourceReference."
      );
    if (!mediaTypes.has(definition.type))
      throw new TypeError("MediaAsset requires a supported type.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.type = definition.type;
    this.metadata =
      definition.metadata instanceof MediaMetadata
        ? definition.metadata
        : new MediaMetadata(definition.metadata);
    this.version = definition.version;
    this.sourceReference = definition.sourceReference;
    this.usageReferences = Object.freeze([
      ...(definition.usageReferences || []),
    ]);
    this.providerReference = definition.providerReference || null;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
