import { cloneValue } from "./ApplicationExperienceValue";

export class ViewReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.viewIdentity ||
      !definition?.domainReference ||
      !definition?.requiredRoleReference ||
      !definition?.version
    )
      throw new TypeError(
        "ViewReference requires id, viewIdentity, domainReference, requiredRoleReference, and version."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.viewIdentity = definition.viewIdentity;
    this.domainReference = definition.domainReference;
    this.requiredRoleReference = definition.requiredRoleReference;
    this.version = definition.version;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
