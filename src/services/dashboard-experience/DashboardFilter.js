import { cloneValue } from "./DashboardExperienceValue";
const types = new Set([
  "DATE",
  "ORGANIZATION",
  "STATUS",
  "LEARNER",
  "TRAINING",
]);
export class DashboardFilter {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.filterType))
      throw new TypeError(
        "DashboardFilter requires id and a supported filterType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.filterType = definition.filterType;
    this.label = definition.label || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
