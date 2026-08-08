import { normalizeProposal } from "./ProposalValue";

export class PedagogicalProposal {
  constructor(definition) {
    Object.assign(this, normalizeProposal(definition, "PedagogicalProposal"));
    this.pedagogicalRationale = definition.pedagogicalRationale || null;
    this.learningObjectiveReferences = Object.freeze([
      ...(definition.learningObjectiveReferences || []),
    ]);
    Object.freeze(this);
  }
}
