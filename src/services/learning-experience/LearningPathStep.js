import { cloneValue } from "./LearningExperienceValue";

export class LearningPathStep {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.learningPathReference ||
      !Number.isInteger(definition?.order) ||
      !definition?.courseReference
    )
      throw new TypeError(
        "LearningPathStep requires id, learningPathReference, integer order, and courseReference."
      );
    if (definition.order < 0)
      throw new TypeError("LearningPathStep order must be zero or greater.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learningPathReference = definition.learningPathReference;
    this.order = definition.order;
    this.courseReference = definition.courseReference;
    this.mandatory = definition.mandatory !== false;
    this.prerequisiteReferences = Object.freeze([
      ...(definition.prerequisiteReferences || []),
    ]);
    this.estimatedDuration = definition.estimatedDuration || null;
    this.branchReference = definition.branchReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
