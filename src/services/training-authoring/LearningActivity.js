import { ActivityType } from "./ActivityType";

const activityTypes = new Set(Object.values(ActivityType));

export class LearningActivity {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !activityTypes.has(definition?.type)
    )
      throw new TypeError(
        "LearningActivity requires id, title, and a supported type."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.type = definition.type;
    this.learningObjectiveReferences = Object.freeze([
      ...(definition.learningObjectiveReferences || []),
    ]);
    this.mediaReference = definition.mediaReference || null;
    this.assessmentReference = definition.assessmentReference || null;
    this.deliveryReference = definition.deliveryReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
