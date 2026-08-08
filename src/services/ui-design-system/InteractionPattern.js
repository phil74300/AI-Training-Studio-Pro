import { cloneValue } from "./UIDesignSystemValue";

const types = new Set([
  "CONFIRMATION",
  "VALIDATION",
  "NOTIFICATION",
  "SEARCH",
  "FILTERING",
  "PAGINATION",
  "DRAG_PREPARATION",
]);

export class InteractionPattern {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.patternType))
      throw new TypeError(
        "InteractionPattern requires id and a supported patternType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.patternType = definition.patternType;
    this.description = definition.description || null;
    this.accessibilityReferences = Object.freeze([
      ...(definition.accessibilityReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
