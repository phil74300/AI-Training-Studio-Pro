import {
  LearningObjectiveDomain,
  LearningTaxonomyLevel,
} from "./TrainingDocumentTypes";
import {
  assertKnownFields,
  cloneRecord,
  normalizeEnum,
  normalizeSchemaVersion,
  normalizeTextArray,
  optionalText,
  requireRecord,
  requireText,
} from "./TrainingDocumentValue";

export const LEARNING_OBJECTIVE_SCHEMA_VERSION = 1;

const fields = Object.freeze([
  "schemaVersion",
  "id",
  "statement",
  "verb",
  "domain",
  "taxonomyLevel",
  "successCriteria",
  "metadata",
]);

export class LearningObjective {
  constructor(definition) {
    const value = requireRecord(definition, "LearningObjective");

    assertKnownFields(value, fields, "LearningObjective");

    this.schemaVersion = normalizeSchemaVersion(
      value.schemaVersion ?? LEARNING_OBJECTIVE_SCHEMA_VERSION,
      "LearningObjective.schemaVersion"
    );
    this.id = requireText(value.id, "LearningObjective.id");
    this.statement = requireText(
      value.statement,
      "LearningObjective.statement"
    );
    this.verb = optionalText(value.verb ?? null, "LearningObjective.verb");
    this.domain = normalizeEnum(
      value.domain ?? LearningObjectiveDomain.KNOWLEDGE,
      LearningObjectiveDomain,
      "LearningObjective.domain"
    );
    this.taxonomyLevel =
      value.taxonomyLevel === null || value.taxonomyLevel === undefined
        ? null
        : normalizeEnum(
            value.taxonomyLevel,
            LearningTaxonomyLevel,
            "LearningObjective.taxonomyLevel"
          );
    this.successCriteria = normalizeTextArray(
      value.successCriteria || [],
      "LearningObjective.successCriteria"
    );
    this.metadata = cloneRecord(
      value.metadata || {},
      "LearningObjective.metadata"
    );

    Object.freeze(this);
  }

  static from(value) {
    return value instanceof LearningObjective
      ? value
      : new LearningObjective(value);
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      statement: this.statement,
      verb: this.verb,
      domain: this.domain,
      taxonomyLevel: this.taxonomyLevel,
      successCriteria: [...this.successCriteria],
      metadata: { ...this.metadata },
    };
  }
}
