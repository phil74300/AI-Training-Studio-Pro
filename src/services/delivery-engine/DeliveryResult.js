import { DeliveryStatus } from "./DeliveryStatus";

const statuses = new Set(Object.values(DeliveryStatus));

export class DeliveryResult {
  constructor(definition) {
    if (!definition?.id || !definition?.deliveryRequestId)
      throw new TypeError("DeliveryResult requires id and deliveryRequestId.");
    const status = definition.status || DeliveryStatus.PREPARED;
    if (!statuses.has(status))
      throw new TypeError("DeliveryResult requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.deliveryRequestId = definition.deliveryRequestId;
    this.status = status;
    this.exportManifestId = definition.exportManifestId || null;
    this.deliveryReference = definition.deliveryReference || null;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
