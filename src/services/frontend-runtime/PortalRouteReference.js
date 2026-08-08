import { cloneValue } from "./FrontendRuntimeValue";

export class PortalRouteReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.portalReference ||
      !definition?.routeIdentity
    )
      throw new TypeError(
        "PortalRouteReference requires id, portalReference, and routeIdentity."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.portalReference = definition.portalReference;
    this.routeIdentity = definition.routeIdentity;
    this.viewReference = definition.viewReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
