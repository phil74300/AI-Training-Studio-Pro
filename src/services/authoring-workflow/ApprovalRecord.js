import { DecisionStatus } from "./DecisionStatus";
import { cloneValue, normalizeTimestamp } from "./WorkflowValue";

const decisions = new Set(Object.values(DecisionStatus));

export class ApprovalRecord {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.versionReference ||
      !definition?.reviewerReference ||
      !decisions.has(definition?.decision) ||
      !definition?.timestamp
    )
      throw new TypeError(
        "ApprovalRecord requires id, versionReference, reviewerReference, a supported decision, and timestamp."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.versionReference = definition.versionReference;
    this.reviewerReference = definition.reviewerReference;
    this.decision = definition.decision;
    this.timestamp = normalizeTimestamp(
      definition.timestamp,
      "ApprovalRecord timestamp"
    );
    this.evidenceReferences = Object.freeze([
      ...(definition.evidenceReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
