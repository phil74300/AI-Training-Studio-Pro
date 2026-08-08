import { cloneValue } from "./UIDesignSystemValue";

const categories = new Set([
  "KEYBOARD_NAVIGATION",
  "CONTRAST",
  "SCREEN_READER",
  "ALTERNATIVE_TEXT",
  "FOCUS_MANAGEMENT",
]);

export class AccessibilityRule {
  constructor(definition) {
    if (!definition?.id || !categories.has(definition?.category))
      throw new TypeError(
        "AccessibilityRule requires id and a supported category."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.category = definition.category;
    this.description = definition.description || null;
    this.qualityRequirementReference =
      definition.qualityRequirementReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
