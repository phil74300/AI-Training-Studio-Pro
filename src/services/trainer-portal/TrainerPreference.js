import { cloneValue } from "./TrainerPortalValue";
export class TrainerPreference {
  constructor(d) {
    if (!d?.id || !d?.trainerReference)
      throw new TypeError(
        "TrainerPreference requires id and trainerReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.trainerReference = d.trainerReference;
    this.languageReference = d.languageReference || null;
    this.accessibilityReference = d.accessibilityReference || null;
    this.dashboardLayoutReference = d.dashboardLayoutReference || null;
    this.notificationPreferenceReference =
      d.notificationPreferenceReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
