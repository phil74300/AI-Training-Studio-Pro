import { cloneValue, normalizeTimestamp } from "./VisualAuthoringValue";

export class AuthoringVersion {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.versionNumber ||
      !definition?.authorReference ||
      !definition?.timestamp ||
      !definition?.changesReference
    )
      throw new TypeError(
        "AuthoringVersion requires id, versionNumber, authorReference, timestamp, and changesReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.versionNumber = definition.versionNumber;
    this.authorReference = definition.authorReference;
    this.timestamp = normalizeTimestamp(
      definition.timestamp,
      "AuthoringVersion timestamp"
    );
    this.changesReference = definition.changesReference;
    this.validationState = definition.validationState || "DRAFT";
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
