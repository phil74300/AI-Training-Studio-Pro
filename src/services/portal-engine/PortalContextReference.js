import { cloneValue } from "./PortalEngineValue";

export class PortalContextReference {
  constructor(definition) {
    if (!definition?.id || !definition?.contextReference)
      throw new TypeError(
        "PortalContextReference requires id and contextReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.contextReference = definition.contextReference;
    this.contextType = definition.contextType || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
