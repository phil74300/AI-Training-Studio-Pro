import { cloneValue } from "./WorkflowManagementValue";

export class WorkflowPreference {
  constructor(definition) {
    if (!definition?.id || !definition?.userReference)
      throw new TypeError("WorkflowPreference requires id and userReference.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userReference = definition.userReference;
    this.displayPreferences = cloneValue(definition.displayPreferences || {});
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
