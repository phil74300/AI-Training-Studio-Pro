import { cloneValue } from "./UIDesignSystemValue";

export class SpacingToken {
  constructor(definition) {
    if (!definition?.id || definition?.value === undefined)
      throw new TypeError("SpacingToken requires id and value.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.value = definition.value;
    this.reference = definition.reference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
