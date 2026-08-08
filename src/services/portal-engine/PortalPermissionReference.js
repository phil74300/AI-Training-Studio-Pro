import { cloneValue } from "./PortalEngineValue";

export class PortalPermissionReference {
  constructor(definition) {
    if (!definition?.id || !definition?.permissionReference)
      throw new TypeError(
        "PortalPermissionReference requires id and permissionReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.permissionReference = definition.permissionReference;
    this.roleReference = definition.roleReference || null;
    this.organizationScopeReference =
      definition.organizationScopeReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
