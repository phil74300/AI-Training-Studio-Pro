import { DeliveryFormat } from "./DeliveryFormat";

const platforms = new Set([
  DeliveryFormat.TEAMS,
  DeliveryFormat.GOOGLE_CLASSROOM,
  DeliveryFormat["360LEARNING"],
  DeliveryFormat.MOODLE,
  DeliveryFormat.LMS_GENERIC,
]);

export class ExternalPlatformReference {
  constructor(definition) {
    if (!definition?.id || !platforms.has(definition?.platform))
      throw new TypeError(
        "ExternalPlatformReference requires id and a supported platform."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.platform = definition.platform;
    this.externalReference = definition.externalReference || null;
    this.ownershipReference = definition.ownershipReference || null;
    this.permissionsReference = definition.permissionsReference || null;
    this.version = definition.version || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
