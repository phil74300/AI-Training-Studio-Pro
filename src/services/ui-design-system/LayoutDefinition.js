import { cloneValue } from "./UIDesignSystemValue";

const types = new Set([
  "APPLICATION_SHELL",
  "SIDEBAR",
  "DASHBOARD",
  "WORKSPACE",
  "CONTENT",
]);

export class LayoutDefinition {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.layoutType))
      throw new TypeError(
        "LayoutDefinition requires id and a supported layoutType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.layoutType = definition.layoutType;
    this.componentReferences = Object.freeze([
      ...(definition.componentReferences || []),
    ]);
    this.spacingReferences = Object.freeze([
      ...(definition.spacingReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
