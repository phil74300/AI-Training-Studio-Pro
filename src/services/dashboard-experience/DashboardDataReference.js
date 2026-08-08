import { cloneValue } from "./DashboardExperienceValue";
const domains = new Set([
  "ANALYTICS_ENGINE",
  "LEARNING_EXPERIENCE",
  "QUALITY_MANAGEMENT",
  "CERTIFICATION_MANAGEMENT",
  "ASSESSMENT_ENGINE",
]);
export class DashboardDataReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !domains.has(definition?.domainReference) ||
      !definition?.sourceReference
    )
      throw new TypeError(
        "DashboardDataReference requires id, a supported domainReference, and sourceReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.domainReference = definition.domainReference;
    this.sourceReference = definition.sourceReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
