import { cloneValue } from "./AdminPortalValue";
export class AdminPreference {
  constructor(d) {
    if (!d?.id || !d?.administratorReference)
      throw new TypeError(
        "AdminPreference requires id and administratorReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.administratorReference = d.administratorReference;
    this.dashboardLayoutReference = d.dashboardLayoutReference || null;
    this.languageReference = d.languageReference || null;
    this.accessibilityReference = d.accessibilityReference || null;
    this.notificationPreferenceReference =
      d.notificationPreferenceReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
