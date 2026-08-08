import { CompetencyLevel } from "./CompetencyLevel";
import { cloneValue } from "./LearningExperienceValue";

const levels = new Set(Object.values(CompetencyLevel));

export class Competency {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.name ||
      !definition?.category ||
      !levels.has(definition?.level)
    )
      throw new TypeError(
        "Competency requires id, name, category, and a supported level."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.name = definition.name;
    this.description = definition.description || null;
    this.category = definition.category;
    this.level = definition.level;
    this.objectiveReferences = Object.freeze([
      ...(definition.objectiveReferences || []),
    ]);
    this.assessmentReferences = Object.freeze([
      ...(definition.assessmentReferences || []),
    ]);
    this.certificationReferences = Object.freeze([
      ...(definition.certificationReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
