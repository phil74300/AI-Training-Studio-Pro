import { AIProposalStatus } from "./AIProposalStatus";
import { cloneValue } from "./ProposalValue";

const reviewStatuses = new Set([
  AIProposalStatus.ACCEPTED,
  AIProposalStatus.REJECTED,
  AIProposalStatus.MODIFIED,
]);

export class AuthorReviewDecision {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.proposalReference ||
      !definition?.authorReference ||
      !reviewStatuses.has(definition?.status) ||
      !definition?.decidedAt
    )
      throw new TypeError(
        "AuthorReviewDecision requires id, proposalReference, authorReference, a final status, and decidedAt."
      );
    const decidedAt = new Date(definition.decidedAt);
    if (Number.isNaN(decidedAt.getTime()))
      throw new TypeError(
        "AuthorReviewDecision requires a valid decision date."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.proposalReference = definition.proposalReference;
    this.authorReference = definition.authorReference;
    this.status = definition.status;
    this.decidedAt = decidedAt.toISOString();
    this.reviewReference = definition.reviewReference || null;
    this.notes = definition.notes || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
