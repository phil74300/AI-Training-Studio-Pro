import { cloneValue, normalizeTimestamp } from "./WorkflowValue";

export class WorkflowComment {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.authorReference ||
      !definition?.contentReference ||
      !definition?.timestamp ||
      !definition?.linkedObjectReference
    )
      throw new TypeError(
        "WorkflowComment requires id, authorReference, contentReference, timestamp, and linkedObjectReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.authorReference = definition.authorReference;
    this.contentReference = definition.contentReference;
    this.timestamp = normalizeTimestamp(
      definition.timestamp,
      "WorkflowComment timestamp"
    );
    this.linkedObjectReference = definition.linkedObjectReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
