import { MediaReference } from "./MediaReference";
import { ActivityType } from "./TrainingDocumentTypes";
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

export const ACTIVITY_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "type",
  "instructions",
  "durationMinutes",
  "objectiveIds",
  "media",
  "metadata",
]);

export class Activity {
  constructor(definition) {
    const value = requireRecord(definition, "Activity");

    assertKnownFields(value, fields, "Activity");

    const durationMinutes = value.durationMinutes ?? null;

    if (
      durationMinutes !== null &&
      (!Number.isInteger(durationMinutes) || durationMinutes <= 0)
    ) {
      throw new TypeError(
        "Activity.durationMinutes must be a positive integer or null."
      );
    }

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? ACTIVITY_SCHEMA_VERSION,
      "Activity.schemaVersion"
    );
    this.id = requireText(value.id, "Activity.id");
    this.title = requireText(value.title, "Activity.title");
    this.type = normalizeEnum(value.type, ActivityType, "Activity.type");
    this.instructions = optionalText(
      value.instructions ?? null,
      "Activity.instructions"
    );
    this.durationMinutes = durationMinutes;
    this.objectiveIds = normalizeTextArray(
      value.objectiveIds || [],
      "Activity.objectiveIds"
    );
    this.media = normalizeModelArray(
      value.media || [],
      MediaReference,
      "Activity.media"
    );
    this.metadata = cloneRecord(value.metadata || {}, "Activity.metadata");

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof Activity ? value : new Activity(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      title: this.title,
      type: this.type,
      instructions: this.instructions,
      durationMinutes: this.durationMinutes,
      objectiveIds: [...this.objectiveIds],
      media: toRecordArray(this.media),
      metadata: { ...this.metadata },
    };
  }
}
