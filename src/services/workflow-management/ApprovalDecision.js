import { cloneValue } from "./WorkflowManagementValue";

const decisions = new Set(["APPROVED", "REJECTED", "REQUIRES_CHANGES"]);

export class ApprovalDecision {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.taskInstanceReference ||
      !decisions.has(definition?.decision) ||
      !definition?.reviewerReference
    )
      throw new TypeError(
        "ApprovalDecision requires id, taskInstanceReference, a supported decision, and reviewerReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.taskInstanceReference = definition.taskInstanceReference;
    this.decision = definition.decision;
    this.reviewerReference = definition.reviewerReference;
    this.rationale = definition.rationale || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
