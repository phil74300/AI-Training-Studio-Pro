import { cloneValue } from "./ApplicationViewsValue";

const actionTypes = new Set(["CREATE", "EDIT", "VALIDATE", "EXPORT", "REVIEW"]);

export class ViewActionReference {
  constructor(definition) {
    if (!definition?.id || !actionTypes.has(definition?.actionType))
      throw new TypeError(
        "ViewActionReference requires id and a supported actionType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.actionType = definition.actionType;
    this.targetReference = definition.targetReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
