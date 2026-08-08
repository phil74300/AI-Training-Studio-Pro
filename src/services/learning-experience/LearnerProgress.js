import { LearningMilestone } from "./LearningMilestone";
import { cloneValue, normalizeTimestamp } from "./LearningExperienceValue";

export class LearnerProgress {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.learnerJourneyReference ||
      typeof definition?.completionPercentage !== "number"
    )
      throw new TypeError(
        "LearnerProgress requires id, learnerJourneyReference, and completionPercentage."
      );
    if (
      definition.completionPercentage < 0 ||
      definition.completionPercentage > 100
    )
      throw new TypeError(
        "LearnerProgress completionPercentage must be between 0 and 100."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerJourneyReference = definition.learnerJourneyReference;
    this.completionPercentage = definition.completionPercentage;
    this.completedActivityReferences = Object.freeze([
      ...(definition.completedActivityReferences || []),
    ]);
    this.completedModuleReferences = Object.freeze([
      ...(definition.completedModuleReferences || []),
    ]);
    this.scoresReference = definition.scoresReference || null;
    this.milestones = Object.freeze(
      (definition.milestones || []).map((milestone) =>
        milestone instanceof LearningMilestone
          ? milestone
          : new LearningMilestone(milestone)
      )
    );
    this.startedAt = definition.startedAt
      ? normalizeTimestamp(definition.startedAt, "LearnerProgress startedAt")
      : null;
    this.updatedAt = definition.updatedAt
      ? normalizeTimestamp(definition.updatedAt, "LearnerProgress updatedAt")
      : null;
    this.completedAt = definition.completedAt
      ? normalizeTimestamp(
          definition.completedAt,
          "LearnerProgress completedAt"
        )
      : null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
