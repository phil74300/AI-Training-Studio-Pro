import { cloneValue } from "./ApplicationViewsValue";

const types = new Set([
  "SUMMARY_CARD",
  "TABLE",
  "CHART_REFERENCE",
  "PROGRESS",
  "TIMELINE",
  "STATUS",
  "ACTION_LIST",
  "FILTER_BAR",
]);

export class WidgetDefinition {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.widgetType))
      throw new TypeError(
        "WidgetDefinition requires id and a supported widgetType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.widgetType = definition.widgetType;
    this.componentReferences = Object.freeze([
      ...(definition.componentReferences || []),
    ]);
    this.dataReferences = Object.freeze([...(definition.dataReferences || [])]);
    this.actionReferences = Object.freeze([
      ...(definition.actionReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
