import { cloneValue } from "./LearnerPortalValue";
const types = new Set([
  "E_LEARNING",
  "CLASSROOM",
  "EXERCISE",
  "SIMULATION",
  "INTERACTIVE_MEDIA",
]);
export class ActivityView {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.activityReference ||
      !types.has(definition?.activityType) ||
      !definition?.progressStateReference
    )
      throw new TypeError(
        "ActivityView requires id, activityReference, a supported activityType, and progressStateReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.activityReference = definition.activityReference;
    this.activityType = definition.activityType;
    this.progressStateReference = definition.progressStateReference;
    this.completionReference = definition.completionReference || null;
    this.assessmentReference = definition.assessmentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
