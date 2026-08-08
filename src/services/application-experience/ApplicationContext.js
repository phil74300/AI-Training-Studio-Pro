import { cloneValue } from "./ApplicationExperienceValue";
import { ApplicationState } from "./ApplicationState";

const states = new Set(Object.values(ApplicationState));

export class ApplicationContext {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.applicationIdentity ||
      !definition?.version ||
      !definition?.activeOrganizationReference ||
      !definition?.userReference ||
      !definition?.roleReference ||
      !definition?.preferencesReference
    )
      throw new TypeError(
        "ApplicationContext requires id, applicationIdentity, version, activeOrganizationReference, userReference, roleReference, and preferencesReference."
      );
    const state = definition.state || ApplicationState.INITIALIZING;
    if (!states.has(state))
      throw new TypeError("ApplicationContext requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.applicationIdentity = definition.applicationIdentity;
    this.version = definition.version;
    this.activeOrganizationReference = definition.activeOrganizationReference;
    this.userReference = definition.userReference;
    this.roleReference = definition.roleReference;
    this.preferencesReference = definition.preferencesReference;
    this.state = state;
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
