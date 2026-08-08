import { cloneValue } from "./IntegrationValue";

const operations = new Set([
  "CONNECT",
  "VALIDATE",
  "IMPORT",
  "EXPORT",
  "SYNCHRONIZE",
  "DISCONNECT",
]);

export class IntegrationRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.integrationReference ||
      !definition?.sourceReference ||
      !definition?.targetReference ||
      !operations.has(definition?.operation)
    )
      throw new TypeError(
        "IntegrationRequest requires id, integrationReference, sourceReference, targetReference, and a supported operation."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.integrationReference = definition.integrationReference;
    this.sourceReference = definition.sourceReference;
    this.targetReference = definition.targetReference;
    this.operation = definition.operation;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
