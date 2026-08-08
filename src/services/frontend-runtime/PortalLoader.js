import { cloneValue } from "./FrontendRuntimeValue";
import { FrontendState } from "./FrontendState";

const states = new Set(Object.values(FrontendState));

export class PortalLoader {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.portalReference ||
      !definition?.userContextReference ||
      !definition?.organizationReference ||
      !definition?.validationStateReference
    )
      throw new TypeError(
        "PortalLoader requires id, portalReference, userContextReference, organizationReference, and validationStateReference."
      );
    const loadingState = definition.loadingState || FrontendState.LOADING;
    if (!states.has(loadingState))
      throw new TypeError("PortalLoader requires a supported loadingState.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.portalReference = definition.portalReference;
    this.userContextReference = definition.userContextReference;
    this.organizationReference = definition.organizationReference;
    this.loadingState = loadingState;
    this.validationStateReference = definition.validationStateReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
