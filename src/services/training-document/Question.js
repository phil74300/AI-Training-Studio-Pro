import { QuestionType } from "./TrainingDocumentTypes";
import {
  assertKnownFields,
  cloneRecord,
  cloneValue,
  normalizeEnum,
  normalizeSchemaVersion,
  normalizeTextArray,
  optionalText,
  requireRecord,
  requireText,
} from "./TrainingDocumentValue";

export const QUESTION_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "type",
  "prompt",
  "options",
  "answer",
  "explanation",
  "points",
  "objectiveIds",
  "metadata",
]);

const optionFields = Object.freeze(["id", "text", "feedback"]);

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) {
    throw new TypeError("Question.options must be an array.");
  }

  const normalized = options.map((option) => {
    const value = requireRecord(option, "Question option");

    assertKnownFields(value, optionFields, "Question option");

    return Object.freeze({
      id: requireText(value.id, "Question option id"),
      text: requireText(value.text, "Question option text"),
      feedback: optionalText(
        value.feedback ?? null,
        "Question option feedback"
      ),
    });
  });
  const ids = normalized.map((option) => option.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error("Question.options cannot contain duplicate identifiers.");
  }

  return Object.freeze(normalized);
};

export class Question {
  constructor(definition) {
    const value = requireRecord(definition, "Question");

    assertKnownFields(value, fields, "Question");

    const points = value.points ?? 1;

    if (!Number.isFinite(points) || points < 0) {
      throw new TypeError("Question.points must be a non-negative number.");
    }

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? QUESTION_SCHEMA_VERSION,
      "Question.schemaVersion"
    );
    this.id = requireText(value.id, "Question.id");
    this.type = normalizeEnum(value.type, QuestionType, "Question.type");
    this.prompt = requireText(value.prompt, "Question.prompt");
    this.options = normalizeOptions(value.options || []);
    this.answer =
      value.answer === null || value.answer === undefined
        ? null
        : cloneValue(value.answer, "Question.answer");
    this.explanation = optionalText(
      value.explanation ?? null,
      "Question.explanation"
    );
    this.points = points;
    this.objectiveIds = normalizeTextArray(
      value.objectiveIds || [],
      "Question.objectiveIds"
    );
    this.metadata = cloneRecord(value.metadata || {}, "Question.metadata");

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof Question ? value : new Question(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      type: this.type,
      prompt: this.prompt,
      options: this.options.map((option) => ({ ...option })),
      answer: this.answer,
      explanation: this.explanation,
      points: this.points,
      objectiveIds: [...this.objectiveIds],
      metadata: { ...this.metadata },
    };
  }
}
