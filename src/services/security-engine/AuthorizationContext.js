import { PermissionDescriptor } from "./PermissionDescriptor";

const permissions = new Set(Object.values(PermissionDescriptor));

export class AuthorizationContext {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.identityReference ||
      !definition?.organizationScopeReference
    )
      throw new TypeError(
        "AuthorizationContext requires id, identityReference, and organizationScopeReference."
      );
    const permissionReferences = definition.permissionReferences || [];
    if (permissionReferences.some((permission) => !permissions.has(permission)))
      throw new TypeError(
        "AuthorizationContext requires supported permission references."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identityReference = definition.identityReference;
    this.roleReferences = Object.freeze([...(definition.roleReferences || [])]);
    this.permissionReferences = Object.freeze([...permissionReferences]);
    this.organizationScopeReference = definition.organizationScopeReference;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
