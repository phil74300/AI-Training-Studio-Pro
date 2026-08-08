import { AuthoringProposalStatus } from "./AuthoringProposalStatus";

const proposalStatuses = new Set(Object.values(AuthoringProposalStatus));

export class TrainingAuthoringProposal {
  constructor(definition) {
    if (!definition?.id || !definition?.proposalType)
      throw new TypeError(
        "TrainingAuthoringProposal requires id and proposalType."
      );
    const status = definition.status || AuthoringProposalStatus.PROPOSAL_ONLY;
    if (!proposalStatuses.has(status))
      throw new TypeError(
        "TrainingAuthoringProposal requires a supported proposal status."
      );
    if (
      definition.confidence !== undefined &&
      (typeof definition.confidence !== "number" ||
        definition.confidence < 0 ||
        definition.confidence > 1)
    )
      throw new TypeError(
        "TrainingAuthoringProposal confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.proposalType = definition.proposalType;
    this.targetReference = definition.targetReference || null;
    this.suggestionReferences = Object.freeze([
      ...(definition.suggestionReferences || []),
    ]);
    this.confidence = definition.confidence ?? null;
    this.status = status;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_AUTHOR_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
