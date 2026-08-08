import { cloneValue } from "./DashboardExperienceValue";
import { DashboardState } from "./DashboardState";
const types = new Set([
  "KPI_CARD",
  "SUMMARY_CARD",
  "PROGRESS_WIDGET",
  "TABLE_WIDGET",
  "TIMELINE_WIDGET",
  "STATUS_WIDGET",
  "ACTION_WIDGET",
]);
const states = new Set(Object.values(DashboardState));
export class DashboardWidgetInstance {
  constructor(definition) {
    if (
      !definition?.id ||
      !types.has(definition?.widgetType) ||
      !definition?.widgetReference ||
      !definition?.componentReference ||
      !definition?.dataReference
    )
      throw new TypeError(
        "DashboardWidgetInstance requires id, a supported widgetType, widgetReference, componentReference, and dataReference."
      );
    const state = definition.state || DashboardState.LOADING;
    if (!states.has(state))
      throw new TypeError(
        "DashboardWidgetInstance requires a supported state."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.widgetType = definition.widgetType;
    this.widgetReference = definition.widgetReference;
    this.componentReference = definition.componentReference;
    this.dataReference = definition.dataReference;
    this.state = state;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
