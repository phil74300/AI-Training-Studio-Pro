import { cloneValue, normalizeProposal } from "./ProposalValue";

export class MediaRecommendation {
  constructor(definition) {
    Object.assign(this, normalizeProposal(definition, "MediaRecommendation"));
    this.recommendations = cloneValue(definition.recommendations || []);
    this.mediaTypes = Object.freeze([...(definition.mediaTypes || [])]);
    this.integrationReferences = Object.freeze([
      ...(definition.integrationReferences || []),
    ]);
    Object.freeze(this);
  }
}
