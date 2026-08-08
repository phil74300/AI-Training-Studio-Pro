import { cloneValue } from "./IntegrationValue";

const directions = new Set(["OUTBOUND", "INBOUND", "BIDIRECTIONAL"]);

export class DataExchangeContract {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.sourceSystem ||
      !definition?.destinationSystem ||
      !definition?.dataType ||
      !directions.has(definition?.direction)
    )
      throw new TypeError(
        "DataExchangeContract requires id, sourceSystem, destinationSystem, dataType, and a supported direction."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.sourceSystem = definition.sourceSystem;
    this.destinationSystem = definition.destinationSystem;
    this.dataType = definition.dataType;
    this.direction = definition.direction;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.consentReference = definition.consentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
