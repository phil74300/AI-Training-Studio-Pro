import { cloneValue } from "./IntelligenceValue";

const domains = new Set([
  "LEARNING_EXPERIENCE",
  "ASSESSMENT_ENGINE",
  "ANALYTICS_ENGINE",
  "QUALITY_MANAGEMENT",
  "CERTIFICATION_MANAGEMENT",
  "TRAINING_AUTHORING",
  "MEDIA_ENGINE",
]);

export class LearningDataReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !domains.has(definition?.domain) ||
      !definition?.sourceReference
    )
      throw new TypeError(
        "LearningDataReference requires id, a supported domain, and sourceReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.domain = definition.domain;
    this.sourceReference = definition.sourceReference;
    this.organizationScopeReference =
      definition.organizationScopeReference || null;
    this.consentReference = definition.consentReference || null;
    this.anonymized = definition.anonymized === true;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
