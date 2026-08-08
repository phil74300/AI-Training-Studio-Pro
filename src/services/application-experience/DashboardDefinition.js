import { cloneValue } from "./ApplicationExperienceValue";
import { DashboardWidget } from "./DashboardWidget";

const widgets = new Set(Object.values(DashboardWidget));

export class DashboardDefinition {
  constructor(definition) {
    if (!definition?.id || !definition?.portalReference || !definition?.title)
      throw new TypeError(
        "DashboardDefinition requires id, portalReference, and title."
      );
    const dashboardWidgets = definition.widgets || [];
    if (dashboardWidgets.some((widget) => !widgets.has(widget)))
      throw new TypeError("DashboardDefinition requires supported widgets.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.portalReference = definition.portalReference;
    this.title = definition.title;
    this.widgets = Object.freeze([...dashboardWidgets]);
    this.visibilityRulesReference = definition.visibilityRulesReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
