import { ReviewType } from "./ReviewType";
import { cloneValue, normalizeTimestamp } from "./WorkflowValue";

const reviewTypes = new Set(Object.values(ReviewType));

export class ReviewerAssignment {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.workflowReference ||
      !definition?.reviewerReference ||
      !reviewTypes.has(definition?.reviewType) ||
      !definition?.assignedAt
    )
      throw new TypeError(
        "ReviewerAssignment requires id, workflowReference, reviewerReference, a supported reviewType, and assignedAt."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowReference = definition.workflowReference;
    this.reviewerReference = definition.reviewerReference;
    this.reviewType = definition.reviewType;
    this.assignedAt = normalizeTimestamp(
      definition.assignedAt,
      "ReviewerAssignment assignedAt"
    );
    this.deadlineReference = definition.deadlineReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
