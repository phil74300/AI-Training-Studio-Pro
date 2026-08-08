import { Activity } from "./Activity";
import { Assessment } from "./Assessment";
import { LearningObjective } from "./LearningObjective";
import { MediaReference } from "./MediaReference";
import { TrainingChapter } from "./TrainingChapter";
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

export const TRAINING_MODULE_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "description",
  "order",
  "learningObjectives",
  "chapters",
  "assessments",
  "activities",
  "media",
  "metadata",
]);

export class TrainingModule {
  constructor(definition) {
    const value = requireRecord(definition, "TrainingModule");

    assertKnownFields(value, fields, "TrainingModule");

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? TRAINING_MODULE_SCHEMA_VERSION,
      "TrainingModule.schemaVersion"
    );
    this.id = requireText(value.id, "TrainingModule.id");
    this.title = requireText(value.title, "TrainingModule.title");
    this.description = optionalText(
      value.description ?? null,
      "TrainingModule.description"
    );
    this.order = normalizeOrder(value.order, "TrainingModule.order");
    this.learningObjectives = normalizeModelArray(
      value.learningObjectives || [],
      LearningObjective,
      "TrainingModule.learningObjectives"
    );
    this.chapters = normalizeModelArray(
      value.chapters || [],
      TrainingChapter,
      "TrainingModule.chapters"
    );
    this.assessments = normalizeModelArray(
      value.assessments || [],
      Assessment,
      "TrainingModule.assessments"
    );
    this.activities = normalizeModelArray(
      value.activities || [],
      Activity,
      "TrainingModule.activities"
    );
    this.media = normalizeModelArray(
      value.media || [],
      MediaReference,
      "TrainingModule.media"
    );
    this.metadata = cloneRecord(
      value.metadata || {},
      "TrainingModule.metadata"
    );

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof TrainingModule ? value : new TrainingModule(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      title: this.title,
      description: this.description,
      order: this.order,
      learningObjectives: toRecordArray(this.learningObjectives),
      chapters: toRecordArray(this.chapters),
      assessments: toRecordArray(this.assessments),
      activities: toRecordArray(this.activities),
      media: toRecordArray(this.media),
      metadata: { ...this.metadata },
    };
  }
}
