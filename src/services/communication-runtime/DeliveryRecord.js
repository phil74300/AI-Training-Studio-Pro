import { cloneValue } from "./CommunicationRuntimeValue";

export class DeliveryRecord {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.deliveryRequestReference ||
      !definition?.status
    )
      throw new TypeError(
        "DeliveryRecord requires id, deliveryRequestReference, and status."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.deliveryRequestReference = definition.deliveryRequestReference;
    this.status = definition.status;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
