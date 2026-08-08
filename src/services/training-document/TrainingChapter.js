import { Activity } from "./Activity";
import { Assessment } from "./Assessment";
import { LearningObjective } from "./LearningObjective";
import { MediaReference } from "./MediaReference";
import { TrainingSection } from "./TrainingSection";
import {
  assertKnownFields,
  cloneRecord,
  normalizeModelArray,
  normalizeOrder,
  normalizeSchemaVersion,
  optionalText,
  requireRecord,
  requireText,
  toRecordArray,
} from "./TrainingDocumentValue";

export const TRAINING_CHAPTER_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "description",
  "order",
  "learningObjectives",
  "sections",
  "assessments",
  "activities",
  "media",
  "metadata",
]);

export class TrainingChapter {
  constructor(definition) {
    const value = requireRecord(definition, "TrainingChapter");

    assertKnownFields(value, fields, "TrainingChapter");

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? TRAINING_CHAPTER_SCHEMA_VERSION,
      "TrainingChapter.schemaVersion"
    );
    this.id = requireText(value.id, "TrainingChapter.id");
    this.title = requireText(value.title, "TrainingChapter.title");
    this.description = optionalText(
      value.description ?? null,
      "TrainingChapter.description"
    );
    this.order = normalizeOrder(value.order, "TrainingChapter.order");
    this.learningObjectives = normalizeModelArray(
      value.learningObjectives || [],
      LearningObjective,
      "TrainingChapter.learningObjectives"
    );
    this.sections = normalizeModelArray(
      value.sections || [],
      TrainingSection,
      "TrainingChapter.sections"
    );
    this.assessments = normalizeModelArray(
      value.assessments || [],
      Assessment,
      "TrainingChapter.assessments"
    );
    this.activities = normalizeModelArray(
      value.activities || [],
      Activity,
      "TrainingChapter.activities"
    );
    this.media = normalizeModelArray(
      value.media || [],
      MediaReference,
      "TrainingChapter.media"
    );
    this.metadata = cloneRecord(
      value.metadata || {},
      "TrainingChapter.metadata"
    );

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof TrainingChapter
      ? value
      : new TrainingChapter(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      title: this.title,
      description: this.description,
      order: this.order,
      learningObjectives: toRecordArray(this.learningObjectives),
      sections: toRecordArray(this.sections),
      assessments: toRecordArray(this.assessments),
      activities: toRecordArray(this.activities),
      media: toRecordArray(this.media),
      metadata: { ...this.metadata },
    };
  }
}
