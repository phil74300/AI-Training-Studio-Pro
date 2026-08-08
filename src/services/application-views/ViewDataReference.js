import { cloneValue } from "./ApplicationViewsValue";

const domains = new Set([
  "TRAINING_AUTHORING",
  "LEARNING_EXPERIENCE",
  "ASSESSMENT_ENGINE",
  "CERTIFICATION_MANAGEMENT",
  "QUALITY_MANAGEMENT",
  "ANALYTICS_ENGINE",
  "INTEGRATION_ENGINE",
]);

export class ViewDataReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !domains.has(definition?.domainReference) ||
      !definition?.sourceReference
    )
      throw new TypeError(
        "ViewDataReference requires id, a supported domainReference, and sourceReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.domainReference = definition.domainReference;
    this.sourceReference = definition.sourceReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
