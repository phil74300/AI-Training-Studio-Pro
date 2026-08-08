export class LearningProgram {
  constructor(value) {
    if (!value?.id || !value?.title || !value?.trainingPackageId)
      throw new TypeError(
        "LearningProgram requires id, title, and trainingPackageId."
      );
    this.schemaVersion = 1;
    this.id = value.id;
    this.title = value.title;
    this.description = value.description || null;
    this.version = value.version || "1.0";
    this.learningObjectiveIds = Object.freeze([
      ...(value.learningObjectiveIds || []),
    ]);
    this.trainingPackageId = value.trainingPackageId;
    this.durationMinutes = value.durationMinutes || null;
    this.prerequisites = Object.freeze([...(value.prerequisites || [])]);
    this.status = value.status || "draft";
    this.provenance = Object.freeze({ ...(value.provenance || {}) });
    Object.freeze(this);
  }
}
