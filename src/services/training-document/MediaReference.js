import { MediaReferenceType } from "./TrainingDocumentTypes";
import {
  assertKnownFields,
  cloneRecord,
  normalizeEnum,
  normalizeSchemaVersion,
  optionalText,
  requireRecord,
  requireText,
} from "./TrainingDocumentValue";

export const MEDIA_REFERENCE_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "type",
  "title",
  "uri",
  "artifactId",
  "mimeType",
  "altText",
  "caption",
  "transcript",
  "metadata",
]);

export class MediaReference {
  constructor(definition) {
    const value = requireRecord(definition, "MediaReference");

    assertKnownFields(value, fields, "MediaReference");

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? MEDIA_REFERENCE_SCHEMA_VERSION,
      "MediaReference.schemaVersion"
    );
    this.id = requireText(value.id, "MediaReference.id");
    this.type = normalizeEnum(
      value.type,
      MediaReferenceType,
      "MediaReference.type"
    );
    this.title = optionalText(value.title ?? null, "MediaReference.title");
    this.uri = optionalText(value.uri ?? null, "MediaReference.uri");
    this.artifactId = optionalText(
      value.artifactId ?? null,
      "MediaReference.artifactId"
    );
    this.mimeType = optionalText(
      value.mimeType ?? null,
      "MediaReference.mimeType"
    );
    this.altText = optionalText(
      value.altText ?? null,
      "MediaReference.altText"
    );
    this.caption = optionalText(
      value.caption ?? null,
      "MediaReference.caption"
    );
    this.transcript = optionalText(
      value.transcript ?? null,
      "MediaReference.transcript"
    );
    this.metadata = cloneRecord(
      value.metadata || {},
      "MediaReference.metadata"
    );

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof MediaReference ? value : new MediaReference(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      type: this.type,
      title: this.title,
      uri: this.uri,
      artifactId: this.artifactId,
      mimeType: this.mimeType,
      altText: this.altText,
      caption: this.caption,
      transcript: this.transcript,
      metadata: { ...this.metadata },
    };
  }
}
