import { DeliveryFormat } from "./DeliveryFormat";
import { DeliveryStatus } from "./DeliveryStatus";
import { DeliveryTarget } from "./DeliveryTarget";

const formats = new Set(Object.values(DeliveryFormat));
const targets = new Set(Object.values(DeliveryTarget));
const statuses = new Set(Object.values(DeliveryStatus));

export class DeliveryDefinition {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.trainingPackageId ||
      !definition?.trainingPackageVersion ||
      !formats.has(definition?.format) ||
      !targets.has(definition?.target)
    )
      throw new TypeError(
        "DeliveryDefinition requires id, trainingPackageId, trainingPackageVersion, supported format, and supported target."
      );
    const status = definition.status || DeliveryStatus.DRAFT;
    if (!statuses.has(status))
      throw new TypeError("DeliveryDefinition requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainingPackageId = definition.trainingPackageId;
    this.trainingPackageVersion = definition.trainingPackageVersion;
    this.format = definition.format;
    this.target = definition.target;
    this.deliveryVersion = definition.deliveryVersion || "1.0";
    this.externalPlatformReferenceId =
      definition.externalPlatformReferenceId || null;
    this.embedDeliveryConfigurationId =
      definition.embedDeliveryConfigurationId || null;
    this.status = status;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
