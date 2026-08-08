import { cloneValue } from "./FrontendRuntimeValue";

export class ApplicationShellInstance {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.shellReference ||
      !definition?.navigationReference ||
      !definition?.layoutReference ||
      !definition?.themeReference
    )
      throw new TypeError(
        "ApplicationShellInstance requires id, shellReference, navigationReference, layoutReference, and themeReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.shellReference = definition.shellReference;
    this.activePortalReference = definition.activePortalReference || null;
    this.navigationReference = definition.navigationReference;
    this.layoutReference = definition.layoutReference;
    this.themeReference = definition.themeReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
