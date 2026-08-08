import { cloneValue } from "./UIDesignSystemValue";

const roles = new Set([
  "PRIMARY",
  "SECONDARY",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "NEUTRAL",
  "BACKGROUND",
  "SURFACE",
  "TEXT",
]);

export class ColorToken {
  constructor(definition) {
    if (!definition?.id || !roles.has(definition?.role))
      throw new TypeError("ColorToken requires id and a supported role.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.role = definition.role;
    this.colorReference = definition.colorReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
