import { cloneValue } from "./QualityPortalValue";
export class QualityPreference {
  constructor(d) {
    if (!d?.id || !d?.qualityManagerReference)
      throw new TypeError(
        "QualityPreference requires id and qualityManagerReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.qualityManagerReference = d.qualityManagerReference;
    this.dashboardLayoutReference = d.dashboardLayoutReference || null;
    this.languageReference = d.languageReference || null;
    this.accessibilityReference = d.accessibilityReference || null;
    this.notificationPreferenceReference =
      d.notificationPreferenceReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
