import { cloneValue, normalizeProposal } from "./ProposalValue";

const activityTypes = new Set([
  "TEXT",
  "VIDEO",
  "IMAGE",
  "INTERACTIVE",
  "SCENARIO",
  "SIMULATION",
  "EXERCISE",
]);

export class ActivityProposal {
  constructor(definition) {
    Object.assign(this, normalizeProposal(definition, "ActivityProposal"));
    const activityType = definition.activityType;
    if (!activityTypes.has(activityType))
      throw new TypeError(
        "ActivityProposal requires a supported activityType."
      );
    this.activityType = activityType;
    this.activities = cloneValue(definition.activities || []);
    this.mediaReference = definition.mediaReference || null;
    this.assessmentReference = definition.assessmentReference || null;
    this.trainingAuthoringReference =
      definition.trainingAuthoringReference || null;
    Object.freeze(this);
  }
}
