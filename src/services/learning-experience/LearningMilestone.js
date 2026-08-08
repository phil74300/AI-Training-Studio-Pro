import { LearningMilestoneStatus } from "./LearningMilestoneStatus";
import { cloneValue } from "./LearningExperienceValue";

const statuses = new Set(Object.values(LearningMilestoneStatus));

export class LearningMilestone {
  constructor(definition) {
    if (!definition?.id || !definition?.title)
      throw new TypeError("LearningMilestone requires id and title.");
    const status = definition.status || LearningMilestoneStatus.NOT_STARTED;
    if (!statuses.has(status))
      throw new TypeError("LearningMilestone requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.criteria = Object.freeze([...(definition.criteria || [])]);
    this.status = status;
    this.evidenceReferences = Object.freeze([
      ...(definition.evidenceReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
