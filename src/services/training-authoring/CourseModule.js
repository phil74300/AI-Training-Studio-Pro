import { CourseChapter } from "./CourseChapter";
import { LearningObjective } from "./LearningObjective";

export class CourseModule {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !Number.isInteger(definition?.order)
    )
      throw new TypeError(
        "CourseModule requires id, title, and integer order."
      );
    if (definition.order < 0)
      throw new TypeError("CourseModule order must be zero or greater.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.order = definition.order;
    this.objectives = Object.freeze(
      (definition.objectives || []).map((objective) =>
        objective instanceof LearningObjective
          ? objective
          : new LearningObjective(objective)
      )
    );
    this.chapters = Object.freeze(
      (definition.chapters || []).map((chapter) =>
        chapter instanceof CourseChapter ? chapter : new CourseChapter(chapter)
      )
    );
    this.duration = definition.duration || null;
    this.references = Object.freeze([...(definition.references || [])]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
