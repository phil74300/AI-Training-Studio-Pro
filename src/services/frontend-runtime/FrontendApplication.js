import { cloneValue } from "./FrontendRuntimeValue";
import { FrontendState } from "./FrontendState";

const states = new Set(Object.values(FrontendState));

export class FrontendApplication {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.applicationIdentity ||
      !definition?.version ||
      !definition?.designSystemReference ||
      !definition?.applicationContextReference
    )
      throw new TypeError(
        "FrontendApplication requires id, applicationIdentity, version, designSystemReference, and applicationContextReference."
      );
    const state = definition.state || FrontendState.LOADING;
    if (!states.has(state))
      throw new TypeError("FrontendApplication requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.applicationIdentity = definition.applicationIdentity;
    this.version = definition.version;
    this.designSystemReference = definition.designSystemReference;
    this.applicationContextReference = definition.applicationContextReference;
    this.state = state;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
