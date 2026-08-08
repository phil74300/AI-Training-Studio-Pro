import { cloneValue } from "./ApplicationExperienceValue";

export class WorkspaceDefinition {
  constructor(definition) {
    if (!definition?.id || !definition?.purpose)
      throw new TypeError("WorkspaceDefinition requires id and purpose.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.purpose = definition.purpose;
    this.linkedDomainReferences = Object.freeze([
      ...(definition.linkedDomainReferences || []),
    ]);
    this.allowedActionReferences = Object.freeze([
      ...(definition.allowedActionReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
