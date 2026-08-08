import { cloneValue } from "./ApplicationExperienceValue";

export class UserExperiencePreference {
  constructor(definition) {
    if (!definition?.id || !definition?.userReference)
      throw new TypeError(
        "UserExperiencePreference requires id and userReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userReference = definition.userReference;
    this.language = definition.language || null;
    this.displayPreferences = cloneValue(definition.displayPreferences || {});
    this.accessibilityPreferences = cloneValue(
      definition.accessibilityPreferences || {}
    );
    this.notificationPreferencesReference =
      definition.notificationPreferencesReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
