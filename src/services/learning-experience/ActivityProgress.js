import { ActivityProgressStatus } from "./ActivityProgressStatus";
import { cloneValue, normalizeTimestamp } from "./LearningExperienceValue";

const statuses = new Set(Object.values(ActivityProgressStatus));

export class ActivityProgress {
  constructor(definition) {
    if (!definition?.id || !definition?.activityReference)
      throw new TypeError(
        "ActivityProgress requires id and activityReference."
      );
    const status = definition.status || ActivityProgressStatus.NOT_STARTED;
    if (!statuses.has(status))
      throw new TypeError("ActivityProgress requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.activityReference = definition.activityReference;
    this.status = status;
    this.completionDate = definition.completionDate
      ? normalizeTimestamp(
          definition.completionDate,
          "ActivityProgress completionDate"
        )
      : null;
    this.attemptReference = definition.attemptReference || null;
    this.resultReference = definition.resultReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
