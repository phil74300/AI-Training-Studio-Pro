import { ReviewTaskStatus } from "./ReviewTaskStatus";
import { ReviewType } from "./ReviewType";
import { cloneValue, normalizeTimestamp } from "./WorkflowValue";

const reviewTypes = new Set(Object.values(ReviewType));
const taskStatuses = new Set(Object.values(ReviewTaskStatus));

export class ReviewTask {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.workflowReference ||
      !definition?.reviewerReference ||
      !reviewTypes.has(definition?.reviewType) ||
      !definition?.assignedAt
    )
      throw new TypeError(
        "ReviewTask requires id, workflowReference, reviewerReference, a supported reviewType, and assignedAt."
      );
    const status = definition.status || ReviewTaskStatus.OPEN;
    if (!taskStatuses.has(status))
      throw new TypeError("ReviewTask requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowReference = definition.workflowReference;
    this.reviewerReference = definition.reviewerReference;
    this.reviewType = definition.reviewType;
    this.assignedAt = normalizeTimestamp(
      definition.assignedAt,
      "ReviewTask assignedAt"
    );
    this.deadlineReference = definition.deadlineReference || null;
    this.status = status;
    this.commentReferences = Object.freeze([
      ...(definition.commentReferences || []),
    ]);
    this.reviewerAssignmentReference =
      definition.reviewerAssignmentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
