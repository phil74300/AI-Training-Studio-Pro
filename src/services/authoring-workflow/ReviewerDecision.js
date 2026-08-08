import { DecisionStatus } from "./DecisionStatus";
import { cloneValue, normalizeTimestamp } from "./WorkflowValue";

const decisions = new Set(Object.values(DecisionStatus));

export class ReviewerDecision {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.reviewTaskReference ||
      !definition?.reviewerReference ||
      !decisions.has(definition?.decision) ||
      !definition?.justification ||
      !definition?.timestamp
    )
      throw new TypeError(
        "ReviewerDecision requires id, reviewTaskReference, reviewerReference, a supported decision, justification, and timestamp."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.reviewTaskReference = definition.reviewTaskReference;
    this.reviewerReference = definition.reviewerReference;
    this.decision = definition.decision;
    this.justification = definition.justification;
    this.timestamp = normalizeTimestamp(
      definition.timestamp,
      "ReviewerDecision timestamp"
    );
    this.evidenceReferences = Object.freeze([
      ...(definition.evidenceReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
