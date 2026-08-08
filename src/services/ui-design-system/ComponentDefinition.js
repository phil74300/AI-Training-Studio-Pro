import { cloneValue } from "./UIDesignSystemValue";

const types = new Set([
  "BUTTON",
  "CARD",
  "TABLE",
  "FORM",
  "INPUT",
  "SELECT",
  "MODAL",
  "ALERT",
  "BADGE",
  "TABS",
  "MENU",
  "NAVIGATION",
  "PANEL",
]);

export class ComponentDefinition {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.componentType))
      throw new TypeError(
        "ComponentDefinition requires id and a supported componentType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.componentType = definition.componentType;
    this.variantReferences = Object.freeze([
      ...(definition.variantReferences || []),
    ]);
    this.accessibilityReferences = Object.freeze([
      ...(definition.accessibilityReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
