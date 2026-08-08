import { cloneValue } from "./UIDesignSystemValue";

const hierarchyLevels = new Set([
  "TITLE",
  "SUBTITLE",
  "BODY",
  "CAPTION",
  "LABEL",
]);

export class TypographyToken {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.fontFamilyReference ||
      definition?.size === undefined ||
      definition?.weight === undefined ||
      definition?.lineHeight === undefined ||
      !hierarchyLevels.has(definition?.hierarchyLevel)
    )
      throw new TypeError(
        "TypographyToken requires id, fontFamilyReference, size, weight, lineHeight, and a supported hierarchyLevel."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.fontFamilyReference = definition.fontFamilyReference;
    this.size = definition.size;
    this.weight = definition.weight;
    this.lineHeight = definition.lineHeight;
    this.hierarchyLevel = definition.hierarchyLevel;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
