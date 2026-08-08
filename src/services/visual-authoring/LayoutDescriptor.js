import { cloneValue } from "./VisualAuthoringValue";

export class LayoutDescriptor {
  constructor(definition) {
    if (!definition?.id || !definition?.position)
      throw new TypeError("LayoutDescriptor requires id and position.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.position = cloneValue(definition.position);
    this.sizeReference = definition.sizeReference || null;
    this.alignment = definition.alignment || null;
    this.groupingReference = definition.groupingReference || null;
    this.layoutType = definition.layoutType || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
