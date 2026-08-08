import { cloneValue } from "./UIDesignSystemValue";

export class DesignSystem {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.identity ||
      !definition?.version ||
      !definition?.themeReference
    )
      throw new TypeError(
        "DesignSystem requires id, identity, version, and themeReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identity = definition.identity;
    this.version = definition.version;
    this.themeReference = definition.themeReference;
    this.componentReferences = Object.freeze([
      ...(definition.componentReferences || []),
    ]);
    this.accessibilityReferences = Object.freeze([
      ...(definition.accessibilityReferences || []),
    ]);
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
