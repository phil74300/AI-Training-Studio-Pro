import { cloneValue } from "./UIDesignSystemValue";

const states = new Set([
  "DEFAULT",
  "HOVER",
  "ACTIVE",
  "DISABLED",
  "LOADING",
  "ERROR",
]);

export class UIStateReference {
  constructor(definition) {
    if (!definition?.id || !states.has(definition?.state))
      throw new TypeError(
        "UIStateReference requires id and a supported state."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.state = definition.state;
    this.description = definition.description || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
