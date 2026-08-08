import { cloneValue } from "./ApplicationViewsValue";

const filterTypes = new Set([
  "SEARCH",
  "DATE_RANGE",
  "STATUS",
  "ORGANIZATION",
  "LEARNER",
]);

export class ViewFilterDefinition {
  constructor(definition) {
    if (!definition?.id || !filterTypes.has(definition?.filterType))
      throw new TypeError(
        "ViewFilterDefinition requires id and a supported filterType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.filterType = definition.filterType;
    this.label = definition.label || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
