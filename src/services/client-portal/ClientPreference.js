import { cloneValue } from "./ClientPortalValue";
export class ClientPreference {
  constructor(d) {
    if (!d?.id || !d?.organizationReference)
      throw new TypeError(
        "ClientPreference requires id and organizationReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.dashboardLayoutReference = d.dashboardLayoutReference || null;
    this.languageReference = d.languageReference || null;
    this.accessibilityReference = d.accessibilityReference || null;
    this.notificationPreferenceReference =
      d.notificationPreferenceReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
