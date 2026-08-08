import { LearningPathStep } from "./LearningPathStep";
import { cloneValue } from "./LearningExperienceValue";

export class LearningPath {
  constructor(definition) {
    if (!definition?.id || !definition?.title)
      throw new TypeError("LearningPath requires id and title.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.targetAudienceReferences = Object.freeze([
      ...(definition.targetAudienceReferences || []),
    ]);
    this.linkedCourseReferences = Object.freeze([
      ...(definition.linkedCourseReferences || []),
    ]);
    this.steps = Object.freeze(
      (definition.steps || []).map((step) =>
        step instanceof LearningPathStep ? step : new LearningPathStep(step)
      )
    );
    this.duration = definition.duration || null;
    this.prerequisites = Object.freeze([...(definition.prerequisites || [])]);
    this.objectiveReferences = Object.freeze([
      ...(definition.objectiveReferences || []),
    ]);
    this.version = definition.version || "1.0";
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
