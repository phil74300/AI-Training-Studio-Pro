import { cloneValue } from "./PortalEngineValue";

export class ApplicationShell {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.applicationReference ||
      !definition?.version ||
      !definition?.themeReference ||
      !definition?.navigationReference
    )
      throw new TypeError(
        "ApplicationShell requires id, applicationReference, version, themeReference, and navigationReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.applicationReference = definition.applicationReference;
    this.version = definition.version;
    this.themeReference = definition.themeReference;
    this.navigationReference = definition.navigationReference;
    this.activePortalReference = definition.activePortalReference || null;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
