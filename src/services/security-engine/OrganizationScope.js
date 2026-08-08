import { OrganizationIsolationLevel } from "./OrganizationIsolationLevel";

const isolationLevels = new Set(Object.values(OrganizationIsolationLevel));

export class OrganizationScope {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.organizationReference ||
      !isolationLevels.has(definition?.isolationLevel)
    )
      throw new TypeError(
        "OrganizationScope requires id, organizationReference, and a supported isolationLevel."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.organizationReference = definition.organizationReference;
    this.isolationLevel = definition.isolationLevel;
    this.allowedDomainReferences = Object.freeze([
      ...(definition.allowedDomainReferences || []),
    ]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
