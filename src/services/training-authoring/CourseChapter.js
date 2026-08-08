import { ContentBlock } from "./ContentBlock";
import { LearningActivity } from "./LearningActivity";

export class CourseChapter {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !Number.isInteger(definition?.order)
    )
      throw new TypeError(
        "CourseChapter requires id, title, and integer order."
      );
    if (definition.order < 0)
      throw new TypeError("CourseChapter order must be zero or greater.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.order = definition.order;
    this.contentBlocks = Object.freeze(
      (definition.contentBlocks || []).map((block) =>
        block instanceof ContentBlock ? block : new ContentBlock(block)
      )
    );
    this.activities = Object.freeze(
      (definition.activities || []).map((activity) =>
        activity instanceof LearningActivity
          ? activity
          : new LearningActivity(activity)
      )
    );
    this.mediaReferences = Object.freeze([
      ...(definition.mediaReferences || []),
    ]);
    this.assessmentReferences = Object.freeze([
      ...(definition.assessmentReferences || []),
    ]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
