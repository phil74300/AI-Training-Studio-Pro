import { cloneValue, normalizeTimestamp } from "./IntegrationValue";

export class IntegrationAuditRecord {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.integrationReference ||
      !definition?.eventReference ||
      !definition?.timestamp
    )
      throw new TypeError(
        "IntegrationAuditRecord requires id, integrationReference, eventReference, and timestamp."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.integrationReference = definition.integrationReference;
    this.eventReference = definition.eventReference;
    this.timestamp = normalizeTimestamp(
      definition.timestamp,
      "IntegrationAuditRecord timestamp"
    );
    this.tenantScopeReference = definition.tenantScopeReference || null;
    this.consentReference = definition.consentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
