import { FeedbackCategory } from "./FeedbackCategory";
import { SurveyQuestionType } from "./SurveyQuestionType";

const categories = new Set(Object.values(FeedbackCategory));
const questionTypes = new Set(Object.values(SurveyQuestionType));

export class SurveyQuestion {
  constructor(definition) {
    if (!definition?.id || !definition?.wording || !definition?.version)
      throw new TypeError("SurveyQuestion requires id, wording, and version.");
    if (!questionTypes.has(definition.type))
      throw new TypeError("SurveyQuestion requires a supported type.");
    if (!categories.has(definition.category))
      throw new TypeError("SurveyQuestion requires a supported category.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.wording = definition.wording;
    this.type = definition.type;
    this.category = definition.category;
    this.scoringMethod = definition.scoringMethod || null;
    this.mandatory = definition.mandatory === true;
    this.version = definition.version;
    this.options = Object.freeze([...(definition.options || [])]);
    Object.freeze(this);
  }
}
