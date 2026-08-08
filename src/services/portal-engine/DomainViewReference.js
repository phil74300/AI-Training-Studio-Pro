import { cloneValue } from "./PortalEngineValue";

const domains = new Set([
  "TRAINING_AUTHORING",
  "ASSESSMENT_ENGINE",
  "LEARNING_EXPERIENCE",
  "CERTIFICATION_MANAGEMENT",
  "QUALITY_MANAGEMENT",
  "ANALYTICS_ENGINE",
  "INTEGRATION_ENGINE",
]);

export class DomainViewReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.viewReference ||
      !domains.has(definition?.domainReference)
    )
      throw new TypeError(
        "DomainViewReference requires id, viewReference, and a supported domainReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.viewReference = definition.viewReference;
    this.domainReference = definition.domainReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
