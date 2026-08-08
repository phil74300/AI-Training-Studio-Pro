import { cloneValue } from "./PortalEngineValue";
import { PortalInstance } from "./PortalInstance";
import { PortalState } from "./PortalState";

const states = new Set(Object.values(PortalState));

export class PortalRuntime {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.userContextReference ||
      !definition?.organizationContextReference
    )
      throw new TypeError(
        "PortalRuntime requires id, userContextReference, and organizationContextReference."
      );
    const availablePortals = definition.availablePortals || [];
    if (availablePortals.some((portal) => !(portal instanceof PortalInstance)))
      throw new TypeError(
        "PortalRuntime requires PortalInstance instances as availablePortals."
      );
    const state = definition.state || PortalState.LOADING;
    if (!states.has(state))
      throw new TypeError("PortalRuntime requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.availablePortals = Object.freeze([...availablePortals]);
    this.currentPortalReference = definition.currentPortalReference || null;
    this.userContextReference = definition.userContextReference;
    this.organizationContextReference = definition.organizationContextReference;
    this.state = state;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
