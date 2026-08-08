import { MediaAsset } from "./MediaAsset";

export class MediaGenerationResult {
  constructor(definition) {
    if (!definition?.id || !definition?.mediaGenerationRequestId)
      throw new TypeError(
        "MediaGenerationResult requires id and mediaGenerationRequestId."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.mediaGenerationRequestId = definition.mediaGenerationRequestId;
    this.mediaAssetProposal = definition.mediaAssetProposal
      ? definition.mediaAssetProposal instanceof MediaAsset
        ? definition.mediaAssetProposal
        : new MediaAsset(definition.mediaAssetProposal)
      : null;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
