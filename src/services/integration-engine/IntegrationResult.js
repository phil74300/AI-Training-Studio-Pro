import { IntegrationStatus } from "./IntegrationStatus";
import { cloneValue, normalizeTimestamp } from "./IntegrationValue";

const statuses = new Set(Object.values(IntegrationStatus));

export class IntegrationResult {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.requestReference ||
      !statuses.has(definition?.status) ||
      !definition?.createdAt
    )
      throw new TypeError(
        "IntegrationResult requires id, requestReference, a supported status, and createdAt."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.requestReference = definition.requestReference;
    this.status = definition.status;
    this.externalReference = definition.externalReference || null;
    this.createdAt = normalizeTimestamp(
      definition.createdAt,
      "IntegrationResult createdAt"
    );
    this.completedAt = definition.completedAt
      ? normalizeTimestamp(
          definition.completedAt,
          "IntegrationResult completedAt"
        )
      : null;
    this.auditReference = definition.auditReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
