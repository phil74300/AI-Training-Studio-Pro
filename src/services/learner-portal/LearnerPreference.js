import { cloneValue } from "./LearnerPortalValue";
export class LearnerPreference {
  constructor(definition) {
    if (!definition?.id || !definition?.learnerReference)
      throw new TypeError(
        "LearnerPreference requires id and learnerReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerReference = definition.learnerReference;
    this.languageReference = definition.languageReference || null;
    this.accessibilityReference = definition.accessibilityReference || null;
    this.displayPreferences = cloneValue(definition.displayPreferences || {});
    this.recommendationPreferences = cloneValue(
      definition.recommendationPreferences || {}
    );
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
