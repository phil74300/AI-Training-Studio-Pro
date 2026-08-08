import { WorkflowState } from "./WorkflowState";
import { cloneValue } from "./WorkflowValue";

const states = new Set(Object.values(WorkflowState));

export class AuthoringWorkflow {
  constructor(definition) {
    if (!definition?.id || !definition?.trainingCourseReference)
      throw new TypeError(
        "AuthoringWorkflow requires id and trainingCourseReference."
      );
    const state = definition.state || WorkflowState.DRAFT;
    if (!states.has(state))
      throw new TypeError("AuthoringWorkflow requires a supported state.");
    if (
      definition.aiReviewProposal?.confidence !== undefined &&
      (typeof definition.aiReviewProposal.confidence !== "number" ||
        definition.aiReviewProposal.confidence < 0 ||
        definition.aiReviewProposal.confidence > 1)
    )
      throw new TypeError(
        "AuthoringWorkflow AI review proposal confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainingCourseReference = definition.trainingCourseReference;
    this.state = state;
    this.versionReference = definition.versionReference || null;
    this.reviewTaskReferences = Object.freeze([
      ...(definition.reviewTaskReferences || []),
    ]);
    this.changeRequestReferences = Object.freeze([
      ...(definition.changeRequestReferences || []),
    ]);
    this.approvalRecordReferences = Object.freeze([
      ...(definition.approvalRecordReferences || []),
    ]);
    this.auditReferences = Object.freeze([
      ...(definition.auditReferences || []),
    ]);
    this.aiReviewProposal = cloneValue({
      checklistReferences:
        definition.aiReviewProposal?.checklistReferences || [],
      missingContentReferences:
        definition.aiReviewProposal?.missingContentReferences || [],
      qualityRiskReferences:
        definition.aiReviewProposal?.qualityRiskReferences || [],
      improvementSuggestionReferences:
        definition.aiReviewProposal?.improvementSuggestionReferences || [],
      confidence: definition.aiReviewProposal?.confidence ?? null,
      status: "PROPOSAL_ONLY",
      validationState: "PENDING_HUMAN_REVIEWER_VALIDATION",
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
