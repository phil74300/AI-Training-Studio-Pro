import { PermissionDescriptor } from "./PermissionDescriptor";

const permissions = new Set(Object.values(PermissionDescriptor));

export class RoleScope {
  constructor(definition) {
    if (!definition?.id || !definition?.roleReference)
      throw new TypeError("RoleScope requires id and roleReference.");
    const permissionReferences = definition.permissionReferences || [];
    if (permissionReferences.some((permission) => !permissions.has(permission)))
      throw new TypeError(
        "RoleScope requires supported permission references."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.roleReference = definition.roleReference;
    this.permissionReferences = Object.freeze([...permissionReferences]);
    this.organizationScopeReference =
      definition.organizationScopeReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
