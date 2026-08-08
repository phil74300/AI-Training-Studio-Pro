import { cloneValue } from "./FrontendRuntimeValue";

const eventTypes = new Set([
  "NAVIGATION",
  "WORKSPACE_CHANGE",
  "USER_ACTION",
  "VALIDATION",
]);

export class FrontendEventReference {
  constructor(definition) {
    if (!definition?.id || !eventTypes.has(definition?.eventType))
      throw new TypeError(
        "FrontendEventReference requires id and a supported eventType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.eventType = definition.eventType;
    this.sourceReference = definition.sourceReference || null;
    this.targetReference = definition.targetReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
