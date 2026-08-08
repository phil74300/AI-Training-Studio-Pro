import { CourseModule } from "./CourseModule";
import { ReviewStatus } from "./ReviewStatus";

const reviewStatuses = new Set(Object.values(ReviewStatus));

export class TrainingCourse {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.blueprintReference ||
      !definition?.title
    )
      throw new TypeError(
        "TrainingCourse requires id, blueprintReference, and title."
      );
    const status = definition.status || ReviewStatus.DRAFT;
    if (!reviewStatuses.has(status))
      throw new TypeError("TrainingCourse requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.blueprintReference = definition.blueprintReference;
    this.title = definition.title;
    this.description = definition.description || null;
    this.language = definition.language || null;
    this.duration = definition.duration || null;
    this.level = definition.level || null;
    this.status = status;
    this.version = definition.version || "1.0";
    this.modules = Object.freeze(
      (definition.modules || []).map((module) =>
        module instanceof CourseModule ? module : new CourseModule(module)
      )
    );
    this.trainingPackageReference = definition.trainingPackageReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
