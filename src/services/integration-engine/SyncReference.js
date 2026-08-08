import { cloneValue, normalizeTimestamp } from "./IntegrationValue";

export class SyncReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.integrationReference ||
      !definition?.sourceReference ||
      !definition?.targetReference
    )
      throw new TypeError(
        "SyncReference requires id, integrationReference, sourceReference, and targetReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.integrationReference = definition.integrationReference;
    this.sourceReference = definition.sourceReference;
    this.targetReference = definition.targetReference;
    this.synchronizedAt = definition.synchronizedAt
      ? normalizeTimestamp(
          definition.synchronizedAt,
          "SyncReference synchronizedAt"
        )
      : null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
