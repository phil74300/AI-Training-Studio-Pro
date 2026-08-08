import { LearnerJourneyStatus } from "./LearnerJourneyStatus";
import { cloneValue } from "./LearningExperienceValue";

const statuses = new Set(Object.values(LearnerJourneyStatus));

export class LearnerJourney {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.learnerReference ||
      !definition?.learningPathReference ||
      !definition?.startDateReference
    )
      throw new TypeError(
        "LearnerJourney requires id, learnerReference, learningPathReference, and startDateReference."
      );
    const status = definition.status || LearnerJourneyStatus.NOT_STARTED;
    if (!statuses.has(status))
      throw new TypeError("LearnerJourney requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerReference = definition.learnerReference;
    this.learningPathReference = definition.learningPathReference;
    this.startDateReference = definition.startDateReference;
    this.status = status;
    this.progressReference = definition.progressReference || null;
    this.organizationScopeReference =
      definition.organizationScopeReference || null;
    this.consentReference = definition.consentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
