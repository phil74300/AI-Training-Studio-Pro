import { Question } from "./Question";
import { AssessmentType } from "./TrainingDocumentTypes";
import {
  assertKnownFields,
  cloneRecord,
  normalizeEnum,
  normalizeModelArray,
  normalizeSchemaVersion,
  normalizeTextArray,
  optionalText,
  requireRecord,
  requireText,
  toRecordArray,
} from "./TrainingDocumentValue";

export const ASSESSMENT_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "type",
  "instructions",
  "questions",
  "objectiveIds",
  "passingScore",
  "maxAttempts",
  "metadata",
]);

export class Assessment {
  constructor(definition) {
    const value = requireRecord(definition, "Assessment");

    assertKnownFields(value, fields, "Assessment");

    const passingScore = value.passingScore ?? null;
    const maxAttempts = value.maxAttempts ?? null;

    if (
      passingScore !== null &&
      (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100)
    ) {
      throw new TypeError(
        "Assessment.passingScore must be between 0 and 100 or null."
      );
    }

    if (
      maxAttempts !== null &&
      (!Number.isInteger(maxAttempts) || maxAttempts <= 0)
    ) {
      throw new TypeError(
        "Assessment.maxAttempts must be a positive integer or null."
      );
    }

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? ASSESSMENT_SCHEMA_VERSION,
      "Assessment.schemaVersion"
    );
    this.id = requireText(value.id, "Assessment.id");
    this.title = requireText(value.title, "Assessment.title");
    this.type = normalizeEnum(value.type, AssessmentType, "Assessment.type");
    this.instructions = optionalText(
      value.instructions ?? null,
      "Assessment.instructions"
    );
    this.questions = normalizeModelArray(
      value.questions || [],
      Question,
      "Assessment.questions"
    );
    this.objectiveIds = normalizeTextArray(
      value.objectiveIds || [],
      "Assessment.objectiveIds"
    );
    this.passingScore = passingScore;
    this.maxAttempts = maxAttempts;
    this.metadata = cloneRecord(value.metadata || {}, "Assessment.metadata");

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof Assessment ? value : new Assessment(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      title: this.title,
      type: this.type,
      instructions: this.instructions,
      questions: toRecordArray(this.questions),
      objectiveIds: [...this.objectiveIds],
      passingScore: this.passingScore,
      maxAttempts: this.maxAttempts,
      metadata: { ...this.metadata },
    };
  }
}
