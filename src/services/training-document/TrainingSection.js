import { Activity } from "./Activity";
import { Assessment } from "./Assessment";
import { LearningObjective } from "./LearningObjective";
import { MediaReference } from "./MediaReference";
import {
  TrainingContentBlockType,
  TrainingSectionType,
} from "./TrainingDocumentTypes";
import {
  assertKnownFields,
  cloneRecord,
  cloneValue,
  normalizeEnum,
  normalizeModelArray,
  normalizeOrder,
  normalizeSchemaVersion,
  normalizeTextArray,
  optionalText,
  requireRecord,
  requireText,
  toRecordArray,
} from "./TrainingDocumentValue";

export const TRAINING_SECTION_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "type",
  "order",
  "blocks",
  "learningObjectives",
  "assessments",
  "activities",
  "media",
  "metadata",
]);

const blockFields = Object.freeze([
  "id",
  "type",
  "text",
  "data",
  "marks",
  "children",
]);

const normalizeBlock = (block, path) => {
  const value = requireRecord(block, path);

  assertKnownFields(value, blockFields, path);

  return Object.freeze({
    id: requireText(value.id, `${path}.id`),
    type: normalizeEnum(value.type, TrainingContentBlockType, `${path}.type`),
    text: optionalText(value.text ?? null, `${path}.text`),
    data: cloneValue(value.data || {}, `${path}.data`),
    marks: normalizeTextArray(value.marks || [], `${path}.marks`),
    children: normalizeBlocks(value.children || [], `${path}.children`),
  });
};

const normalizeBlocks = (blocks, field = "TrainingSection.blocks") => {
  if (!Array.isArray(blocks)) {
    throw new TypeError(`${field} must be an array.`);
  }

  const normalized = blocks.map((block, index) =>
    normalizeBlock(block, `${field}[${index}]`)
  );
  const ids = normalized.map((block) => block.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error(`${field} cannot contain duplicate identifiers.`);
  }

  return Object.freeze(normalized);
};

export class TrainingSection {
  constructor(definition) {
    const value = requireRecord(definition, "TrainingSection");

    assertKnownFields(value, fields, "TrainingSection");

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? TRAINING_SECTION_SCHEMA_VERSION,
      "TrainingSection.schemaVersion"
    );
    this.id = requireText(value.id, "TrainingSection.id");
    this.title = requireText(value.title, "TrainingSection.title");
    this.type = normalizeEnum(
      value.type ?? TrainingSectionType.CONTENT,
      TrainingSectionType,
      "TrainingSection.type"
    );
    this.order = normalizeOrder(value.order, "TrainingSection.order");
    this.blocks = normalizeBlocks(value.blocks || []);
    this.learningObjectives = normalizeModelArray(
      value.learningObjectives || [],
      LearningObjective,
      "TrainingSection.learningObjectives"
    );
    this.assessments = normalizeModelArray(
      value.assessments || [],
      Assessment,
      "TrainingSection.assessments"
    );
    this.activities = normalizeModelArray(
      value.activities || [],
      Activity,
      "TrainingSection.activities"
    );
    this.media = normalizeModelArray(
      value.media || [],
      MediaReference,
      "TrainingSection.media"
    );
    this.metadata = cloneRecord(
      value.metadata || {},
      "TrainingSection.metadata"
    );

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof TrainingSection
      ? value
      : new TrainingSection(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      title: this.title,
      type: this.type,
      order: this.order,
      blocks: this.blocks,
      learningObjectives: toRecordArray(this.learningObjectives),
      assessments: toRecordArray(this.assessments),
      activities: toRecordArray(this.activities),
      media: toRecordArray(this.media),
      metadata: { ...this.metadata },
    };
  }
}
