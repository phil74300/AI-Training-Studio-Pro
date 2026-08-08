import { cloneValue } from "./DashboardExperienceValue";
const types = new Set(["OPEN", "REVIEW", "EXPORT", "VALIDATE"]);
export class DashboardAction {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.actionType))
      throw new TypeError(
        "DashboardAction requires id and a supported actionType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.actionType = definition.actionType;
    this.targetReference = definition.targetReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
