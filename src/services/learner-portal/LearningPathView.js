import { cloneValue } from "./LearnerPortalValue";
export class LearningPathView {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.pathReference ||
      !definition?.completionStatusReference
    )
      throw new TypeError(
        "LearningPathView requires id, pathReference, and completionStatusReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.pathReference = definition.pathReference;
    this.moduleReferences = Object.freeze([
      ...(definition.moduleReferences || []),
    ]);
    this.completionStatusReference = definition.completionStatusReference;
    this.objectiveReferences = Object.freeze([
      ...(definition.objectiveReferences || []),
    ]);
    this.milestoneReferences = Object.freeze([
      ...(definition.milestoneReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
