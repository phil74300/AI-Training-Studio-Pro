import { TrainingDocumentStatus } from "./TrainingDocumentTypes";
import {
  assertKnownFields,
  cloneRecord,
  normalizeEnum,
  normalizeSchemaVersion,
  normalizeTextArray,
  normalizeTimestamp,
  requireRecord,
  requireText,
} from "./TrainingDocumentValue";

export const DOCUMENT_METADATA_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "language",
  "documentVersion",
  "status",
  "createdAt",
  "updatedAt",
  "authors",
  "tags",
  "source",
  "custom",
]);

export class DocumentMetadata {
  constructor(definition) {
    const value = requireRecord(definition, "DocumentMetadata");

    assertKnownFields(value, fields, "DocumentMetadata");

    const createdAt = normalizeTimestamp(
      value.createdAt,
      "DocumentMetadata.createdAt"
    );
    const updatedAt = normalizeTimestamp(
      value.updatedAt,
      "DocumentMetadata.updatedAt"
    );

    if (Date.parse(updatedAt) < Date.parse(createdAt)) {
      throw new Error("DocumentMetadata.updatedAt cannot precede createdAt.");
    }

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? DOCUMENT_METADATA_SCHEMA_VERSION,
      "DocumentMetadata.schemaVersion"
    );
    this.language = requireText(value.language, "DocumentMetadata.language");
    this.documentVersion = requireText(
      value.documentVersion,
      "DocumentMetadata.documentVersion"
    );
    this.status = normalizeEnum(
      value.status ?? TrainingDocumentStatus.DRAFT,
      TrainingDocumentStatus,
      "DocumentMetadata.status"
    );
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.authors = normalizeTextArray(
      value.authors || [],
      "DocumentMetadata.authors"
    );
    this.tags = normalizeTextArray(value.tags || [], "DocumentMetadata.tags");
    this.source = cloneRecord(value.source || {}, "DocumentMetadata.source");
    this.custom = cloneRecord(value.custom || {}, "DocumentMetadata.custom");

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof DocumentMetadata
      ? value
      : new DocumentMetadata(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      language: this.language,
      documentVersion: this.documentVersion,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      authors: [...this.authors],
      tags: [...this.tags],
      source: { ...this.source },
      custom: { ...this.custom },
    };
  }
}
