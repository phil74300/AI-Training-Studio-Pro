import { QuestionDifficulty } from "./QuestionDifficulty";
import { QuestionType } from "./QuestionType";
export class AssessmentQuestion {
  constructor(value) {
    if (
      !value?.id ||
      !value?.content ||
      !Object.values(QuestionType).includes(value.type)
    )
      throw new TypeError(
        "AssessmentQuestion requires id, content, and supported type."
      );
    this.schemaVersion = 1;
    this.id = value.id;
    this.type = value.type;
    this.content = value.content;
    this.possibleAnswers = Object.freeze([...(value.possibleAnswers || [])]);
    this.expectedAnswer = value.expectedAnswer ?? null;
    this.explanation = value.explanation || null;
    this.difficulty = value.difficulty || QuestionDifficulty.INTERMEDIATE;
    this.competencyReference = value.competencyReference || null;
    this.sourceReference = Object.freeze({ ...(value.sourceReference || {}) });
    this.version = value.version || "1.0";
    Object.freeze(this);
  }
}
