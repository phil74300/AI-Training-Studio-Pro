import { cloneValue, normalizeProposal } from "./ProposalValue";

export class CourseStructureProposal {
  constructor(definition) {
    Object.assign(
      this,
      normalizeProposal(definition, "CourseStructureProposal")
    );
    this.modules = cloneValue(definition.modules || []);
    this.chapters = cloneValue(definition.chapters || []);
    this.sequence = Object.freeze([...(definition.sequence || [])]);
    this.estimatedDuration = definition.estimatedDuration || null;
    Object.freeze(this);
  }
}
