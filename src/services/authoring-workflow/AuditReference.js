import { cloneValue, normalizeTimestamp } from "./WorkflowValue";

export class AuditReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.sourceReference ||
      !definition?.recordedAt
    )
      throw new TypeError(
        "AuditReference requires id, sourceReference, and recordedAt."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.sourceReference = definition.sourceReference;
    this.recordedAt = normalizeTimestamp(
      definition.recordedAt,
      "AuditReference recordedAt"
    );
    this.versionReference = definition.versionReference || null;
    this.reviewerReference = definition.reviewerReference || null;
    this.evidenceReferences = Object.freeze([
      ...(definition.evidenceReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
