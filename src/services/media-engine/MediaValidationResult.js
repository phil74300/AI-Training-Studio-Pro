export class MediaValidationResult {
  constructor(definition) {
    if (!definition?.mediaAssetId || typeof definition.valid !== "boolean")
      throw new TypeError(
        "MediaValidationResult requires mediaAssetId and valid."
      );
    this.schemaVersion = 1;
    this.mediaAssetId = definition.mediaAssetId;
    this.valid = definition.valid;
    this.issues = Object.freeze([...(definition.issues || [])]);
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.validatedAt = new Date(
      definition.validatedAt || Date.now()
    ).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }

  static valid(mediaAssetId, options = {}) {
    return new MediaValidationResult({ ...options, mediaAssetId, valid: true });
  }

  static invalid(mediaAssetId, issues, options = {}) {
    return new MediaValidationResult({
      ...options,
      mediaAssetId,
      valid: false,
      issues,
    });
  }
}
