import { cloneValue } from "./DashboardExperienceValue";
export class DashboardPreference {
  constructor(definition) {
    if (!definition?.id || !definition?.dashboardReference)
      throw new TypeError(
        "DashboardPreference requires id and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.dashboardReference = definition.dashboardReference;
    this.layoutPreferenceReference =
      definition.layoutPreferenceReference || null;
    this.visibleWidgetReferences = Object.freeze([
      ...(definition.visibleWidgetReferences || []),
    ]);
    this.languageReference = definition.languageReference || null;
    this.accessibilityReference = definition.accessibilityReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
