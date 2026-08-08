import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentValidation } from "./AssessmentValidation";
export class Assessment {
  constructor(value) {
    if (!value?.id || !value?.title || !value?.trainingDocumentId)
      throw new TypeError(
        "Assessment requires id, title, and trainingDocumentId."
      );
    this.schemaVersion = 1;
    this.id = value.id;
    this.title = value.title;
    this.description = value.description || null;
    this.trainingDocumentId = value.trainingDocumentId;
    this.trainingPackageId = value.trainingPackageId || null;
    this.learningObjectiveIds = Object.freeze([
      ...(value.learningObjectiveIds || []),
    ]);
    this.questions = Object.freeze(
      (value.questions || []).map((question) =>
        question instanceof AssessmentQuestion
          ? question
          : new AssessmentQuestion(question)
      )
    );
    this.version = value.version || "1.0";
    this.status = value.status || "draft";
    this.validationState = value.validationState || AssessmentValidation.DRAFT;
    Object.freeze(this);
  }
}
