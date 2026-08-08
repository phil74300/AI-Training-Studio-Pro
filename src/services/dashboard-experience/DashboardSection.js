import { cloneValue } from "./DashboardExperienceValue";
import { DashboardWidgetInstance } from "./DashboardWidgetInstance";
export class DashboardSection {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !Number.isInteger(definition?.order)
    )
      throw new TypeError(
        "DashboardSection requires id, title, and an integer order."
      );
    const widgets = definition.widgets || [];
    if (widgets.some((widget) => !(widget instanceof DashboardWidgetInstance)))
      throw new TypeError(
        "DashboardSection requires DashboardWidgetInstance instances."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.order = definition.order;
    this.visibilityReference = definition.visibilityReference || null;
    this.widgets = Object.freeze([...widgets]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
