import { cloneValue, normalizeTimestamp } from "./LearningExperienceValue";

export class LearningAchievement {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.learnerReference ||
      !definition?.achievementType ||
      !definition?.date ||
      !definition?.evidenceReference
    )
      throw new TypeError(
        "LearningAchievement requires id, learnerReference, achievementType, date, and evidenceReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerReference = definition.learnerReference;
    this.achievementType = definition.achievementType;
    this.date = normalizeTimestamp(definition.date, "LearningAchievement date");
    this.evidenceReference = definition.evidenceReference;
    this.competencyReference = definition.competencyReference || null;
    this.certificationReference = definition.certificationReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
