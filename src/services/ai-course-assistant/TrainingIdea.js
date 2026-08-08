import { cloneValue } from "./ProposalValue";

export class TrainingIdea {
  constructor(definition) {
    if (!definition?.id || !definition?.title)
      throw new TypeError("TrainingIdea requires id and title.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.targetAudienceReferences = Object.freeze([
      ...(definition.targetAudienceReferences || []),
    ]);
    this.durationTarget = definition.durationTarget || null;
    this.competencyGoals = Object.freeze([
      ...(definition.competencyGoals || []),
    ]);
    this.constraints = cloneValue(definition.constraints || {});
    this.sourceReferences = Object.freeze([
      ...(definition.sourceReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
