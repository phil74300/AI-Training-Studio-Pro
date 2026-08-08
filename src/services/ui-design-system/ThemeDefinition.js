import { cloneValue } from "./UIDesignSystemValue";

const modes = new Set(["LIGHT", "DARK"]);

export class ThemeDefinition {
  constructor(definition) {
    if (!definition?.id || !modes.has(definition?.mode))
      throw new TypeError("ThemeDefinition requires id and a supported mode.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.mode = definition.mode;
    this.brandingReference = definition.brandingReference || null;
    this.colorReferences = Object.freeze([
      ...(definition.colorReferences || []),
    ]);
    this.typographyReferences = Object.freeze([
      ...(definition.typographyReferences || []),
    ]);
    this.spacingReferences = Object.freeze([
      ...(definition.spacingReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
