import { cloneValue } from "./ApplicationViewsValue";
import { WidgetDefinition } from "./WidgetDefinition";

export class SectionDefinition {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !Number.isInteger(definition?.order)
    )
      throw new TypeError(
        "SectionDefinition requires id, title, and an integer order."
      );
    const widgets = definition.widgets || [];
    if (widgets.some((widget) => !(widget instanceof WidgetDefinition)))
      throw new TypeError(
        "SectionDefinition requires WidgetDefinition instances."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.order = definition.order;
    this.visibilityReference = definition.visibilityReference || null;
    this.widgets = Object.freeze([...widgets]);
    this.layoutReference = definition.layoutReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
