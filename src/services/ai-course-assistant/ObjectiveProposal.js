import { cloneValue, normalizeProposal } from "./ProposalValue";

export class ObjectiveProposal {
  constructor(definition) {
    Object.assign(this, normalizeProposal(definition, "ObjectiveProposal"));
    this.learningObjectives = cloneValue(definition.learningObjectives || []);
    this.bloomTaxonomyLevel = definition.bloomTaxonomyLevel || null;
    this.competencyAlignmentReferences = Object.freeze([
      ...(definition.competencyAlignmentReferences || []),
    ]);
    this.evaluationCriteria = Object.freeze([
      ...(definition.evaluationCriteria || []),
    ]);
    Object.freeze(this);
  }
}
