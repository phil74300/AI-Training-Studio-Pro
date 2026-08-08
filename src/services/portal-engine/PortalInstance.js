import { cloneValue } from "./PortalEngineValue";

export class PortalInstance {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.portalDefinitionReference ||
      !definition?.userRoleReference ||
      !definition?.organizationScopeReference ||
      !definition?.dashboardReference
    )
      throw new TypeError(
        "PortalInstance requires id, portalDefinitionReference, userRoleReference, organizationScopeReference, and dashboardReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.portalDefinitionReference = definition.portalDefinitionReference;
    this.userRoleReference = definition.userRoleReference;
    this.organizationScopeReference = definition.organizationScopeReference;
    this.dashboardReference = definition.dashboardReference;
    this.workspaceReferences = Object.freeze([
      ...(definition.workspaceReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
