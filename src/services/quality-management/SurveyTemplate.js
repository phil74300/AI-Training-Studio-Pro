import { SurveyQuestion } from "./SurveyQuestion";
import { SurveyType } from "./SurveyType";

const surveyTypes = new Set(Object.values(SurveyType));

export class SurveyTemplate {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !definition?.version ||
      !definition?.targetAudience ||
      !definition?.trainingProgramId
    )
      throw new TypeError(
        "SurveyTemplate requires id, title, version, targetAudience, and trainingProgramId."
      );
    if (!surveyTypes.has(definition.type))
      throw new TypeError("SurveyTemplate requires a supported type.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.version = definition.version;
    this.targetAudience = definition.targetAudience;
    this.trainingProgramId = definition.trainingProgramId;
    this.type = definition.type;
    this.questions = Object.freeze(
      (definition.questions || []).map((question) =>
        question instanceof SurveyQuestion
          ? question
          : new SurveyQuestion(question)
      )
    );
    this.status = definition.status || "draft";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
